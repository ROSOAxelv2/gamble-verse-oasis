
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
}

export const MultiBallControls = ({
  minBet,
  maxBet,
  onDropBalls,
  isDropping,
  activeBallCount,
  maxConcurrentBalls
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
  const canDrop = !isDropping && activeBallCount < maxConcurrentBalls && ballCount > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Ball Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ball Count */}
        <div className="space-y-2">
          <Label>Number of Balls: {ballCount}</Label>
          <Slider
            value={[ballCount]}
            min={1}
            max={Math.min(10, maxConcurrentBalls - activeBallCount)}
            step={1}
            onValueChange={([value]) => setBallCount(value)}
            disabled={isDropping}
          />
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
            disabled={isDropping}
          />
        </div>

        {/* Slow Drop Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="slow-drop"
            checked={slowDrop}
            onCheckedChange={setSlowDrop}
            disabled={isDropping}
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
        </div>

        {/* Drop Button */}
        <Button 
          onClick={handleDropBalls}
          disabled={!canDrop}
          className="w-full"
          size="lg"
        >
          {isDropping ? `Dropping... (${activeBallCount} active)` : `Drop ${ballCount} Ball${ballCount > 1 ? 's' : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
};
