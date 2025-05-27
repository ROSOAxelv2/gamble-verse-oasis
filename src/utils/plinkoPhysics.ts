import { Engine, Render, World, Bodies, Body, Events, Vector } from 'matter-js';
import plinkoLayout from '@/config/plinkoLayout.json';
import physicsConfig from '@/config/physicsConfig.json';
import { PegManager, PegPosition } from './pegManager';

export interface PlinkoDropBet {
  id: string;
  amount: number;
  ballId?: string;
}

export interface PlinkoResult {
  ballId: string;
  betId: string;
  betAmount: number;
  bucketIndex: number;
  multiplier: number;
  winAmount: number;
  isWin: boolean;
  path: Vector[];
}

export interface PlinkoPhysicsOptions {
  canvas: HTMLCanvasElement;
  onBallLand: (result: PlinkoResult) => void;
  onBallUpdate?: (ballId: string, position: Vector) => void;
  onBucketHighlight?: (bucketIndex: number) => void;
  slowDrop?: boolean;
  onInitialized?: () => void;
}

export class PlinkoPhysicsEngine {
  private engine: Engine;
  private render: Render;
  private activeBalls: Map<string, { bet: PlinkoDropBet; path: Vector[] }> = new Map();
  private buckets: Body[] = [];
  private pegs: Body[] = [];
  private options: PlinkoPhysicsOptions;
  private pegManager: PegManager;
  private ballDropAnimation: Map<string, { startTime: number; duration: number }> = new Map();
  private isInitialized: boolean = false;

  constructor(options: PlinkoPhysicsOptions) {
    this.options = options;
    this.pegManager = new PegManager();
    this.pegManager.loadPegCount();
    
    this.engine = Engine.create();
    
    // Configure physics with optimized settings
    const gravity = physicsConfig.physics.gravity;
    const scale = options.slowDrop ? gravity.scale * physicsConfig.dropSettings.slowDropMultiplier : gravity.scale;
    
    this.engine.world.gravity.x = gravity.x;
    this.engine.world.gravity.y = gravity.y;
    this.engine.world.gravity.scale = scale;

    // Setup responsive canvas dimensions
    const boardAspectRatio = plinkoLayout.board.width / plinkoLayout.board.height;
    const containerWidth = options.canvas.parentElement?.clientWidth || 800;
    const maxWidth = Math.min(containerWidth - 40, 800); // 20px margin on each side
    const canvasWidth = maxWidth;
    const canvasHeight = canvasWidth / boardAspectRatio;

    // Set canvas size
    options.canvas.width = canvasWidth;
    options.canvas.height = canvasHeight;
    options.canvas.style.width = `${canvasWidth}px`;
    options.canvas.style.height = `${canvasHeight}px`;

    this.render = Render.create({
      canvas: options.canvas,
      engine: this.engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        showDebug: false,
        showVelocity: false,
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    this.setupWorld();
    this.setupCollisionEvents();
  }

  private setupWorld() {
    const world = this.engine.world;
    const canvas = this.options.canvas;
    const scaleX = canvas.width / plinkoLayout.board.width;
    const scaleY = canvas.height / plinkoLayout.board.height;

    // Create walls with proper scaling
    plinkoLayout.walls.forEach(wall => {
      const wallBody = Bodies.rectangle(
        (wall.x + wall.width / 2) * scaleX,
        (wall.y + wall.height / 2) * scaleY,
        wall.width * scaleX,
        wall.height * scaleY,
        {
          isStatic: true,
          render: { 
            fillStyle: '#333',
            strokeStyle: '#555',
            lineWidth: 2
          },
          ...physicsConfig.materials.wall
        }
      );
      World.add(world, wallBody);
    });

    // Create pegs using PegManager with scaling
    this.updatePegs();

    // Create buckets with proper scaling and enhanced visuals
    plinkoLayout.buckets.forEach((bucket, index) => {
      const bucketBody = Bodies.rectangle(
        (bucket.x + bucket.width / 2) * scaleX,
        (bucket.y + bucket.height / 2) * scaleY,
        bucket.width * scaleX,
        bucket.height * scaleY,
        {
          isStatic: true,
          isSensor: true,
          render: { 
            fillStyle: bucket.color,
            strokeStyle: '#fff',
            lineWidth: 2
          },
          label: `bucket-${index}`,
          ...physicsConfig.materials.bucket
        }
      );
      this.buckets.push(bucketBody);
      World.add(world, bucketBody);
    });

    // Mark as initialized
    this.isInitialized = true;
    this.options.onInitialized?.();
  }

  private updatePegs() {
    const canvas = this.options.canvas;
    const scaleX = canvas.width / plinkoLayout.board.width;
    const scaleY = canvas.height / plinkoLayout.board.height;

    // Remove existing pegs
    this.pegs.forEach(peg => {
      World.remove(this.engine.world, peg);
    });
    this.pegs = [];

    // Add new pegs based on current configuration with scaling
    const pegPositions = this.pegManager.generatePegs();
    pegPositions.forEach(peg => {
      const pegBody = Bodies.circle(
        peg.x * scaleX, 
        peg.y * scaleY, 
        peg.radius * Math.min(scaleX, scaleY), 
        {
          isStatic: true,
          render: { 
            fillStyle: '#9b87f5',
            strokeStyle: '#7c3aed',
            lineWidth: 2
          },
          ...physicsConfig.materials.peg
        }
      );
      this.pegs.push(pegBody);
      World.add(this.engine.world, pegBody);
    });
  }

  private setupCollisionEvents() {
    Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        
        // Check if ball hits bucket
        const ballBody = bodyA.label?.startsWith('ball-') ? bodyA : 
                        bodyB.label?.startsWith('ball-') ? bodyB : null;
        const bucketBody = bodyA.label?.startsWith('bucket-') ? bodyA :
                          bodyB.label?.startsWith('bucket-') ? bodyB : null;

        if (ballBody && bucketBody) {
          const bucketIndex = parseInt(bucketBody.label?.replace('bucket-', '') || '0');
          this.options.onBucketHighlight?.(bucketIndex);
          this.handleBallLanding(ballBody, bucketBody);
        }
      });
    });

    Events.on(this.engine, 'afterUpdate', () => {
      this.activeBalls.forEach((ballData, ballId) => {
        const body = this.findBallBody(ballId);
        if (body) {
          ballData.path.push({ x: body.position.x, y: body.position.y });
          this.options.onBallUpdate?.(ballId, body.position);

          // Update drop animation
          const animation = this.ballDropAnimation.get(ballId);
          if (animation) {
            const elapsed = Date.now() - animation.startTime;
            if (elapsed >= animation.duration) {
              this.ballDropAnimation.delete(ballId);
            }
          }
        }
      });
    });
  }

  private findBallBody(ballId: string): Body | null {
    return this.engine.world.bodies.find(body => body.label === `ball-${ballId}`) || null;
  }

  private handleBallLanding(ballBody: Body, bucketBody: Body) {
    const ballId = ballBody.label?.replace('ball-', '') || '';
    const bucketIndex = parseInt(bucketBody.label?.replace('bucket-', '') || '0');
    const ballData = this.activeBalls.get(ballId);

    if (!ballData) return;

    const bucket = plinkoLayout.buckets[bucketIndex];
    const winAmount = ballData.bet.amount * bucket.multiplier;
    
    const result: PlinkoResult = {
      ballId,
      betId: ballData.bet.id,
      betAmount: ballData.bet.amount,
      bucketIndex,
      multiplier: bucket.multiplier,
      winAmount,
      isWin: bucket.multiplier > 0,
      path: [...ballData.path]
    };

    // Remove ball from world and tracking
    World.remove(this.engine.world, ballBody);
    this.activeBalls.delete(ballId);
    this.ballDropAnimation.delete(ballId);

    this.options.onBallLand(result);
  }

  async dropBalls(bets: PlinkoDropBet[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Physics engine not initialized');
    }

    const delay = physicsConfig.dropSettings.dropDelay;
    
    for (let i = 0; i < bets.length; i++) {
      const bet = bets[i];
      this.dropSingleBall(bet);
      
      if (i < bets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private dropSingleBall(bet: PlinkoDropBet) {
    const ballId = `${bet.id}-${Date.now()}-${Math.random()}`;
    const canvas = this.options.canvas;
    const scaleX = canvas.width / plinkoLayout.board.width;
    const scaleY = canvas.height / plinkoLayout.board.height;
    
    const startX = (plinkoLayout.board.ballStartX + (Math.random() - 0.5) * 20) * scaleX;
    const startY = plinkoLayout.board.ballStartY * scaleY;

    // Add visible drop animation tracking
    this.ballDropAnimation.set(ballId, {
      startTime: Date.now(),
      duration: 800 // 800ms drop animation
    });

    const ballRadius = physicsConfig.materials.ball.radius * Math.min(scaleX, scaleY);
    const ballBody = Bodies.circle(startX, startY, ballRadius, {
      label: `ball-${ballId}`,
      render: { 
        fillStyle: '#f97316',
        strokeStyle: '#ea580c',
        lineWidth: 3
      },
      ...physicsConfig.materials.ball
    });

    // Apply initial velocity for visible drop with scaling
    const initialVel = physicsConfig.dropSettings.initialVelocity;
    Body.setVelocity(ballBody, { 
      x: initialVel.x * scaleX, 
      y: initialVel.y * scaleY 
    });

    World.add(this.engine.world, ballBody);
    
    this.activeBalls.set(ballId, {
      bet: { ...bet, ballId },
      path: [{ x: startX, y: startY }]
    });
  }

  increasePegs(): void {
    this.pegManager.increasePegs();
    this.pegManager.savePegCount();
    this.updatePegs();
  }

  decreasePegs(): void {
    this.pegManager.decreasePegs();
    this.pegManager.savePegCount();
    this.updatePegs();
  }

  getPegRows(): number {
    return this.pegManager.getCurrentRows();
  }

  getMinPegRows(): number {
    return this.pegManager.getMinRows();
  }

  getMaxPegRows(): number {
    return this.pegManager.getMaxRows();
  }

  canIncreasePegs(): boolean {
    return this.pegManager.canIncrease();
  }

  canDecreasePegs(): boolean {
    return this.pegManager.canDecrease();
  }

  start() {
    Engine.run(this.engine);
    Render.run(this.render);
  }

  stop() {
    Render.stop(this.render);
    Engine.clear(this.engine);
  }

  getActiveBallCount(): number {
    return this.activeBalls.size;
  }

  updateSlowDrop(slowDrop: boolean) {
    const gravity = physicsConfig.physics.gravity;
    const scale = slowDrop ? gravity.scale * physicsConfig.dropSettings.slowDropMultiplier : gravity.scale;
    this.engine.world.gravity.scale = scale;
  }

  isEngineInitialized(): boolean {
    return this.isInitialized;
  }

  resize() {
    if (!this.options.canvas.parentElement) return;

    const boardAspectRatio = plinkoLayout.board.width / plinkoLayout.board.height;
    const containerWidth = this.options.canvas.parentElement.clientWidth;
    const maxWidth = Math.min(containerWidth - 40, 800);
    const canvasWidth = maxWidth;
    const canvasHeight = canvasWidth / boardAspectRatio;

    this.options.canvas.width = canvasWidth;
    this.options.canvas.height = canvasHeight;
    this.options.canvas.style.width = `${canvasWidth}px`;
    this.options.canvas.style.height = `${canvasHeight}px`;

    this.render.options.width = canvasWidth;
    this.render.options.height = canvasHeight;
    this.render.canvas.width = canvasWidth;
    this.render.canvas.height = canvasHeight;

    // Recreate world with new scaling
    this.setupWorld();
  }
}
