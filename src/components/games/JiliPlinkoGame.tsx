import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Pause, Settings, Zap, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import plinkoConfig from '@/config/jiliPlinkoConfig.json';

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGolden: boolean;
  trail: { x: number; y: number }[];
}

interface PlinkoResult {
  ballId: string;
  bucketIndex: number;
  multiplier: number;
  winAmount: number;
  isGolden: boolean;
}

export const JiliPlinkoGame = () => {
  const { user, updateUserBalance } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [betAmount, setBetAmount] = useState(plinkoConfig.gameSettings.defaultBet);
  const [pegRows, setPegRows] = useState(plinkoConfig.pegConfiguration.rows);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [results, setResults] = useState<PlinkoResult[]>([]);
  const [totalWon, setTotalWon] = useState(0);
  const [ballsDropped, setBallsDropped] = useState(0);

  // Get multipliers based on peg rows
  const currentMultipliers = plinkoConfig.multipliers[pegRows.toString() as keyof typeof plinkoConfig.multipliers] || plinkoConfig.multipliers[16];

  // Canvas dimensions
  const canvasWidth = 800;
  const canvasHeight = 600;
  const bucketWidth = canvasWidth / currentMultipliers.length;

  // Physics simulation
  const updatePhysics = useCallback(() => {
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => {
        const newBall = { ...ball };
        
        // Add gravity
        newBall.vy += 0.3;
        
        // Update position
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;
        
        // Add to trail
        newBall.trail.push({ x: newBall.x, y: newBall.y });
        if (newBall.trail.length > 20) {
          newBall.trail.shift();
        }
        
        // Collision with pegs
        for (let row = 0; row < pegRows; row++) {
          const pegsInRow = row + 2;
          const pegY = 100 + row * 35;
          const startX = canvasWidth / 2 - (pegsInRow - 1) * 25;
          
          for (let col = 0; col < pegsInRow; col++) {
            const pegX = startX + col * 50;
            const dx = newBall.x - pegX;
            const dy = newBall.y - pegY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
              // Bounce off peg
              const angle = Math.atan2(dy, dx);
              newBall.vx = Math.cos(angle) * 2 + (Math.random() - 0.5) * 2;
              newBall.vy = Math.abs(Math.sin(angle)) * 2;
              newBall.x = pegX + Math.cos(angle) * 15;
              newBall.y = pegY + Math.sin(angle) * 15;
            }
          }
        }
        
        // Side walls
        if (newBall.x < 10) {
          newBall.x = 10;
          newBall.vx = Math.abs(newBall.vx);
        }
        if (newBall.x > canvasWidth - 10) {
          newBall.x = canvasWidth - 10;
          newBall.vx = -Math.abs(newBall.vx);
        }
        
        return newBall;
      });
      
      // Check for balls that reached the bottom
      const activeBalls = updatedBalls.filter(ball => {
        if (ball.y > canvasHeight - 80) {
          // Ball reached bucket area
          const bucketIndex = Math.floor(ball.x / bucketWidth);
          const clampedIndex = Math.max(0, Math.min(bucketIndex, currentMultipliers.length - 1));
          const multiplier = currentMultipliers[clampedIndex];
          
          let finalMultiplier = multiplier;
          if (ball.isGolden) {
            finalMultiplier *= plinkoConfig.bonusFeatures.goldenBall.multiplier;
          }
          
          // Apply multiplier boost if triggered
          if (Math.random() < plinkoConfig.bonusFeatures.multiplierBoost.probability) {
            finalMultiplier *= (1 + Math.random() * (plinkoConfig.bonusFeatures.multiplierBoost.maxBoost - 1));
          }
          
          const winAmount = betAmount * finalMultiplier;
          
          const result: PlinkoResult = {
            ballId: ball.id,
            bucketIndex: clampedIndex,
            multiplier: finalMultiplier,
            winAmount,
            isGolden: ball.isGolden
          };
          
          setResults(prev => [result, ...prev.slice(0, 9)]);
          setTotalWon(prev => prev + winAmount);
          updateUserBalance(winAmount);
          
          if (ball.isGolden) {
            toast.success(`🌟 Golden Ball! Won $${winAmount.toFixed(2)}!`, {
              description: `${finalMultiplier.toFixed(1)}x multiplier!`
            });
          } else if (winAmount > betAmount * 5) {
            toast.success(`🎉 Big Win! $${winAmount.toFixed(2)}!`);
          }
          
          return false; // Remove ball
        }
        return true; // Keep ball
      });
      
      return activeBalls;
    });
  }, [pegRows, canvasWidth, bucketWidth, currentMultipliers, betAmount, updateUserBalance]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        updatePhysics();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updatePhysics]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#0a0f1c';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw pegs
    for (let row = 0; row < pegRows; row++) {
      const pegsInRow = row + 2;
      const pegY = 100 + row * 35;
      const startX = canvasWidth / 2 - (pegsInRow - 1) * 25;
      
      for (let col = 0; col < pegsInRow; col++) {
        const pegX = startX + col * 50;
        
        ctx.beginPath();
        ctx.arc(pegX, pegY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Draw buckets
    currentMultipliers.forEach((multiplier, index) => {
      const x = index * bucketWidth;
      const y = canvasHeight - 60;
      
      // Bucket color based on multiplier
      let color = '#4ECDC4';
      if (multiplier >= 10) color = '#FF6B35';
      else if (multiplier >= 5) color = '#FFD700';
      else if (multiplier >= 2) color = '#98FB98';
      else if (multiplier < 1) color = '#FF4444';
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bucketWidth - 2, 60);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${multiplier}x`, x + bucketWidth / 2, y + 35);
    });
    
    // Draw balls
    balls.forEach(ball => {
      // Draw trail
      if (plinkoConfig.features.ballTrails) {
        ctx.strokeStyle = ball.isGolden ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 107, 53, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ball.trail.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
      
      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = ball.isGolden ? '#FFD700' : '#FF6B35';
      ctx.fill();
      ctx.strokeStyle = ball.isGolden ? '#FFA500' : '#FF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (ball.isGolden) {
        // Golden ball sparkle effect
        ctx.fillStyle = '#FFF';
        ctx.fillRect(ball.x - 2, ball.y - 2, 1, 1);
        ctx.fillRect(ball.x + 2, ball.y + 2, 1, 1);
      }
    });
  }, [balls, pegRows, currentMultipliers]);

  const dropBall = useCallback(() => {
    if (!user || user.balance < betAmount) {
      toast.error('Insufficient balance!');
      return;
    }
    
    if (balls.length >= plinkoConfig.gameSettings.maxSimultaneousBalls) {
      toast.error('Too many balls in play!');
      return;
    }
    
    updateUserBalance(-betAmount);
    setBallsDropped(prev => prev + 1);
    
    const isGolden = Math.random() < plinkoConfig.bonusFeatures.goldenBall.probability;
    
    const newBall: Ball = {
      id: `ball-${Date.now()}-${Math.random()}`,
      x: canvasWidth / 2 + (Math.random() - 0.5) * 50,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      isGolden,
      trail: []
    };
    
    setBalls(prev => [...prev, newBall]);
    setIsPlaying(true);
  }, [user, betAmount, balls.length, updateUserBalance]);

  // Auto play
  useEffect(() => {
    if (autoPlay && balls.length === 0) {
      const timer = setTimeout(dropBall, plinkoConfig.gameSettings.autoDropDelay);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, balls.length, dropBall]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎯 Jili Plinko</h1>
        <p className="text-muted-foreground">Drop balls and watch them bounce to victory!</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-green-600">${user?.balance.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-muted-foreground">Balance</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-blue-600">${totalWon.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">Total Won</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-purple-600">{ballsDropped}</div>
          <div className="text-xs text-muted-foreground">Balls Dropped</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-lg font-bold text-orange-600">{balls.length}</div>
          <div className="text-xs text-muted-foreground">Active Balls</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Canvas */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-700 rounded-lg bg-gradient-to-b from-blue-900 to-purple-900"
            />
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Game Controls</h3>
            
            <div>
              <Label htmlFor="bet">Bet Amount</Label>
              <Input
                id="bet"
                type="number"
                min={plinkoConfig.gameSettings.minBet}
                max={plinkoConfig.gameSettings.maxBet}
                step="0.1"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="rows">Peg Rows: {pegRows}</Label>
              <Input
                id="rows"
                type="range"
                min={plinkoConfig.pegConfiguration.minRows}
                max={plinkoConfig.pegConfiguration.maxRows}
                value={pegRows}
                onChange={(e) => setPegRows(Number(e.target.value))}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={dropBall}
                disabled={!user || user.balance < betAmount || balls.length >= plinkoConfig.gameSettings.maxSimultaneousBalls}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-1" />
                Drop Ball
              </Button>
              <Button
                variant="outline"
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-1"
              >
                {autoPlay ? <Pause className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </Button>
            </div>

            {autoPlay && (
              <div className="text-center">
                <Badge variant="secondary">Auto Play Active</Badge>
              </div>
            )}
          </Card>

          {/* Recent Results */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Recent Results</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.ballId}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center gap-1">
                    {result.isGolden && <Sparkles className="w-3 h-3 text-yellow-500" />}
                    <span>{result.multiplier.toFixed(1)}x</span>
                  </div>
                  <span className={`font-semibold ${result.winAmount > betAmount ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.winAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Multiplier Preview */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Multipliers</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {currentMultipliers.map((mult, index) => (
                <div
                  key={index}
                  className={`text-center p-1 rounded ${
                    mult >= 10 ? 'bg-red-100 text-red-800' :
                    mult >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    mult >= 2 ? 'bg-green-100 text-green-800' :
                    mult >= 1 ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {mult}x
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
