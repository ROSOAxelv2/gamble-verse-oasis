import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService, userService } from '@/services/api';
import { GameType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PlinkoPhysicsEngine, PlinkoDropBet, PlinkoResult } from '@/utils/plinkoPhysics';
import { MultiBallControls } from './plinko/MultiBallControls';
import { ResultsTracker } from './plinko/ResultsTracker';
import { SlotValueDisplay } from './plinko/SlotValueDisplay';
import { PegControls } from './plinko/PegControls';
import { TestReport } from './plinko/TestReport';
import physicsConfig from '@/config/physicsConfig.json';

export const PlinkoAdvanced = () => {
  const { user, updateUserBalance } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PlinkoPhysicsEngine | null>(null);
  
  const [isDropping, setIsDropping] = useState(false);
  const [activeBallCount, setActiveBallCount] = useState(0);
  const [results, setResults] = useState<PlinkoResult[]>([]);
  const [highlightedBucket, setHighlightedBucket] = useState<number | null>(null);
  const [pegRows, setPegRows] = useState(6);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPhysicsReady, setIsPhysicsReady] = useState(false);
  const [config, setConfig] = useState({
    minBet: 50,
    maxBet: 2000,
    enabled: false
  });

  // Calculate totals
  const totalBet = results.reduce((sum, result) => sum + result.betAmount, 0);
  const totalWin = results.reduce((sum, result) => sum + result.winAmount, 0);

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const plinkoConfig = await gameService.getGameConfig(GameType.PLINKO);
        setConfig({
          minBet: plinkoConfig.minBet,
          maxBet: plinkoConfig.maxBet,
          enabled: plinkoConfig.enabled
        });
      } catch (error) {
        console.error('Failed to load game config:', error);
        toast.error("Failed to load game configuration");
      } finally {
        setIsInitializing(false);
      }
    };
    
    fetchGameConfig();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !config.enabled || isInitializing) return;

    const handleBallLand = async (result: PlinkoResult) => {
      console.log('Ball landed:', result);
      
      try {
        // Update balance
        const balanceChange = result.winAmount - result.betAmount;
        updateUserBalance(balanceChange);
        
        // Add to results
        setResults(prev => [...prev, result]);
        
        // Update active ball count
        setActiveBallCount(prev => prev - 1);
        
        // Show result toast
        if (result.isWin) {
          toast.success(`Ball won $${result.winAmount.toFixed(2)} (${result.multiplier}x)!`);
        } else {
          toast.error(`Ball lost $${result.betAmount.toFixed(2)}`);
        }
        
        // Refresh user profile
        await userService.getProfile();
      } catch (error) {
        console.error('Error handling ball result:', error);
        toast.error('Failed to process result');
      }
    };

    const handleBucketHighlight = (bucketIndex: number) => {
      setHighlightedBucket(bucketIndex);
    };

    const handleBallUpdate = (ballId: string, position: { x: number; y: number }) => {
      // Optional: track ball positions for advanced animations
    };

    const handleInitialized = () => {
      setIsPhysicsReady(true);
      console.log('Plinko physics engine initialized');
    };

    engineRef.current = new PlinkoPhysicsEngine({
      canvas: canvasRef.current,
      onBallLand: handleBallLand,
      onBallUpdate: handleBallUpdate,
      onBucketHighlight: handleBucketHighlight,
      onInitialized: handleInitialized
    });

    // Update peg rows state
    setPegRows(engineRef.current.getPegRows());

    engineRef.current.start();

    // Handle window resize
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [config.enabled, isInitializing, updateUserBalance]);

  const handleDropBalls = useCallback(async (bets: PlinkoDropBet[]) => {
    if (!user || !engineRef.current || !isPhysicsReady) {
      toast.error("Game not ready");
      return;
    }

    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
    
    if (user.balance < totalBetAmount) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsDropping(true);
      setActiveBallCount(prev => prev + bets.length);
      
      // Deduct bet amount immediately
      updateUserBalance(-totalBetAmount);
      
      // Drop the balls
      await engineRef.current.dropBalls(bets);
      
      toast.success(`Dropped ${bets.length} ball${bets.length > 1 ? 's' : ''} - Total bet: $${totalBetAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error dropping balls:', error);
      toast.error('Failed to drop balls');
      // Restore balance on error
      updateUserBalance(totalBetAmount);
      setActiveBallCount(prev => prev - bets.length);
    } finally {
      setIsDropping(false);
    }
  }, [user, updateUserBalance, isPhysicsReady]);

  const handleIncreasePegs = () => {
    if (engineRef.current && engineRef.current.canIncreasePegs()) {
      engineRef.current.increasePegs();
      setPegRows(engineRef.current.getPegRows());
      toast.success(`Increased to ${engineRef.current.getPegRows()} peg rows`);
    }
  };

  const handleDecreasePegs = () => {
    if (engineRef.current && engineRef.current.canDecreasePegs()) {
      engineRef.current.decreasePegs();
      setPegRows(engineRef.current.getPegRows());
      toast.success(`Decreased to ${engineRef.current.getPegRows()} peg rows`);
    }
  };

  const isPegControlDisabled = activeBallCount > 0 || isDropping || !isPhysicsReady;
  const isDropDisabled = isDropping || !isPhysicsReady || activeBallCount >= physicsConfig.dropSettings.maxConcurrentBalls;

  if (isInitializing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plinko Advanced</CardTitle>
          <CardDescription>Loading game configuration...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plinko Advanced</CardTitle>
          <CardDescription>Professional physics-based Plinko with dynamic peg control</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Plinko Advanced is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plinko Advanced</CardTitle>
              <CardDescription>Professional physics-based Plinko with dynamic peg control</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center relative p-4">
              <div className="relative w-full flex justify-center" ref={containerRef}>
                {!isPhysicsReady && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center space-y-2">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Initializing physics engine...</p>
                    </div>
                  </div>
                )}
                <canvas 
                  ref={canvasRef}
                  className="border border-border rounded-lg shadow-lg bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    display: 'block'
                  }}
                />
                <SlotValueDisplay
                  highlightedBucket={highlightedBucket}
                  onAnimationComplete={() => setHighlightedBucket(null)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls and Results */}
        <div className="space-y-6">
          <PegControls
            currentRows={pegRows}
            minRows={engineRef.current?.getMinPegRows() || 3}
            maxRows={engineRef.current?.getMaxPegRows() || 10}
            onIncrease={handleIncreasePegs}
            onDecrease={handleDecreasePegs}
            disabled={isPegControlDisabled}
          />

          <MultiBallControls
            minBet={config.minBet}
            maxBet={config.maxBet}
            onDropBalls={handleDropBalls}
            isDropping={isDropping}
            activeBallCount={activeBallCount}
            maxConcurrentBalls={physicsConfig.dropSettings.maxConcurrentBalls}
            disabled={isDropDisabled}
            isPhysicsReady={isPhysicsReady}
          />

          <ResultsTracker
            results={results}
            totalBet={totalBet}
            totalWin={totalWin}
          />
        </div>
      </div>
      
      {/* Test Report - Only show in development */}
      {import.meta.env.DEV && <TestReport />}
    </>
  );
};
