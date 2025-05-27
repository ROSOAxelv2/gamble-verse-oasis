
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PlinkoDropBet } from '@/utils/plinkoPhysics';

interface MultiBallControlsProps {
  minBet: number;
  maxBet: number;
  onDropBalls: (bets: PlinkoDropBet[]) => Promise<void>;
  isDropping: boolean;
  activeBallCount: number;
  maxConcurrentBalls: number;
  disabled?: boolean;
  isPhysicsReady?: boolean;
}

export const MultiBallControls = ({
  minBet,
  maxBet,
  onDropBalls,
  isDropping,
  activeBallCount,
  maxConcurrentBalls,
  disabled = false,
  isPhysicsReady = false
}: MultiBallControlsProps) => {
  const [ballCount, setBallCount] = useState(1);
  const [betPerBall, setBetPerBall] = useState(minBet);
  const [slowDrop, setSlowDrop] = useState(false);

  const handleDropBalls = async () => {
    const bets: PlinkoDropBet[] = [];
    
    for (let i = 0; i < ballCount; i++) {
      bets.push({
        id: `bet-${Date.now()}-${i}`,
        amount: betPerBall
      });
    }
    
    await onDropBalls(bets);
  };

  const totalBet = ballCount * betPerBall;
  const maxPossibleBalls = Math.min(10, maxConcurrentBalls - activeBallCount);
  const canDrop = !disabled && !isDropping && activeBallCount < maxConcurrentBalls && ballCount > 0 && isPhysicsReady;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Ball Controls</CardTitle>
        {!isPhysicsReady && (
          <p className="text-sm text-muted-foreground">Waiting for game initialization...</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ball Count */}
        <div className="space-y-2">
          <Label>Number of Balls: {ballCount}</Label>
          <Slider
            value={[ballCount]}
            min={1}
            max={maxPossibleBalls || 1}
            step={1}
            onValueChange={([value]) => setBallCount(value)}
            disabled={disabled || isDropping || !isPhysicsReady}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Available slots: {maxPossibleBalls}
          </div>
        </div>

        {/* Bet Per Ball */}
        <div className="space-y-2">
          <Label>Bet Per Ball: ${betPerBall}</Label>
          <Slider
            value={[betPerBall]}
            min={minBet}
            max={maxBet}
            step={10}
            onValueChange={([value]) => setBetPerBall(value)}
            disabled={disabled || isDropping || !isPhysicsReady}
            className="w-full"
          />
        </div>

        {/* Slow Drop Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="slow-drop"
            checked={slowDrop}
            onCheckedChange={setSlowDrop}
            disabled={disabled || isDropping || !isPhysicsReady}
          />
          <Label htmlFor="slow-drop">Slow Drop Mode</Label>
        </div>

        {/* Total Bet Display */}
        <div className="p-3 bg-muted rounded-md">
          <div className="flex justify-between items-center">
            <span>Total Bet:</span>
            <span className="font-bold">${totalBet}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Active Balls:</span>
            <span>{activeBallCount}/{maxConcurrentBalls}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Physics:</span>
            <span className={isPhysicsReady ? "text-green-600" : "text-orange-600"}>
              {isPhysicsReady ? "Ready" : "Initializing..."}
            </span>
          </div>
        </div>

        {/* Drop Button */}
        <Button 
          onClick={handleDropBalls}
          disabled={!canDrop}
          className="w-full"
          size="lg"
        >
          {!isPhysicsReady ? "Initializing..." : 
           isDropping ? `Dropping... (${activeBallCount} active)` : 
           `Drop ${ballCount} Ball${ballCount > 1 ? 's' : ''}`}
        </Button>

        {!isPhysicsReady && (
          <p className="text-xs text-center text-muted-foreground">
            Please wait for the game to finish loading before dropping balls.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
