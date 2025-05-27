
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService, userService } from '@/services/api';
import { GameType, TransactionType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlinkoPhysicsEngine, PlinkoDropBet, PlinkoResult } from '@/utils/plinkoPhysics';
import { MultiBallControls } from './plinko/MultiBallControls';
import { ResultsTracker } from './plinko/ResultsTracker';
import physicsConfig from '@/config/physicsConfig.json';

export const EnhancedPlinkoGame = () => {
  const { user, updateUserBalance } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlinkoPhysicsEngine | null>(null);
  
  const [isDropping, setIsDropping] = useState(false);
  const [activeBallCount, setActiveBallCount] = useState(0);
  const [results, setResults] = useState<PlinkoResult[]>([]);
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
      }
    };
    
    fetchGameConfig();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !config.enabled) return;

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

    const handleBallUpdate = (ballId: string, position: { x: number; y: number }) => {
      // Optional: track ball positions for advanced animations
    };

    engineRef.current = new PlinkoPhysicsEngine({
      canvas: canvasRef.current,
      onBallLand: handleBallLand,
      onBallUpdate: handleBallUpdate
    });

    engineRef.current.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, [config.enabled, updateUserBalance]);

  const handleDropBalls = useCallback(async (bets: PlinkoDropBet[]) => {
    if (!user || !engineRef.current) {
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
  }, [user, updateUserBalance]);

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Plinko</CardTitle>
          <CardDescription>Professional physics-based Plinko with multi-ball support</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <p>Enhanced Plinko is currently unavailable. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Board */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Plinko</CardTitle>
            <CardDescription>Professional physics-based Plinko with multi-ball support</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <canvas 
              ref={canvasRef}
              className="border border-border rounded-lg shadow-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls and Results */}
      <div className="space-y-6">
        <MultiBallControls
          minBet={config.minBet}
          maxBet={config.maxBet}
          onDropBalls={handleDropBalls}
          isDropping={isDropping}
          activeBallCount={activeBallCount}
          maxConcurrentBalls={physicsConfig.dropSettings.maxConcurrentBalls}
        />

        <ResultsTracker
          results={results}
          totalBet={totalBet}
          totalWin={totalWin}
        />
      </div>
    </div>
  );
};
