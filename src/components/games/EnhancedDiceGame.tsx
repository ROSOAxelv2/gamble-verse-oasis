
import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';
import diceConfig from '@/config/enhancedDiceConfig.json';

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface DiceResult {
  dice1: number;
  dice2: number;
  total: number;
  isWin: boolean;
  winAmount: number;
  betType: string;
  multiplier: number;
  isBonus?: boolean;
}

export const EnhancedDiceGame = () => {
  const { user, updateUserBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(diceConfig.gameSettings.defaultBet);
  const [betType, setBetType] = useState<string>('specific-7');
  const [isRolling, setIsRolling] = useState(false);
  const [diceValues, setDiceValues] = useState({ dice1: 1, dice2: 1 });
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [doubleOrNothing, setDoubleOrNothing] = useState<{ active: boolean; round: number; potential: number }>({
    active: false,
    round: 0,
    potential: 0
  });

  const rollDice = useCallback(() => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return { dice1, dice2 };
  }, []);

  const calculateWin = useCallback((dice1: number, dice2: number, total: number, type: string): DiceResult => {
    let winAmount = 0;
    let multiplier = 0;
    let isWin = false;
    let isBonus = false;

    // Check for golden dice bonus
    if (Math.random() < diceConfig.bonusFeatures.goldenDice.probability) {
      isBonus = true;
      multiplier = diceConfig.bonusFeatures.goldenDice.multiplier;
    }

    if (type.startsWith('specific-')) {
      const targetSum = parseInt(type.split('-')[1]);
      if (total === targetSum) {
        isWin = true;
        multiplier = isBonus ? multiplier : diceConfig.payouts.specific[targetSum as keyof typeof diceConfig.payouts.specific];
      }
    } else if (type === 'low') {
      if (total >= 2 && total <= 6) {
        isWin = true;
        multiplier = isBonus ? multiplier : diceConfig.payouts.ranges.low.multiplier;
      }
    } else if (type === 'high') {
      if (total >= 8 && total <= 12) {
        isWin = true;
        multiplier = isBonus ? multiplier : diceConfig.payouts.ranges.high.multiplier;
      }
    } else if (type === 'even') {
      if (total % 2 === 0) {
        isWin = true;
        multiplier = isBonus ? multiplier : diceConfig.payouts.ranges.even.multiplier;
      }
    } else if (type === 'odd') {
      if (total % 2 === 1) {
        isWin = true;
        multiplier = isBonus ? multiplier : diceConfig.payouts.ranges.odd.multiplier;
      }
    }

    // Apply streak bonus
    if (isWin && streak > 0 && streak < diceConfig.bonusFeatures.luckyStreaks.streakMultipliers.length) {
      multiplier *= diceConfig.bonusFeatures.luckyStreaks.streakMultipliers[streak];
    }

    winAmount = isWin ? betAmount * multiplier : 0;

    return {
      dice1,
      dice2,
      total,
      isWin,
      winAmount,
      betType: type,
      multiplier,
      isBonus
    };
  }, [betAmount, streak]);

  const handleRoll = useCallback(async () => {
    if (!user || user.balance < betAmount) {
      toast.error('Insufficient balance!');
      return;
    }

    setIsRolling(true);
    updateUserBalance(-betAmount);

    // Animate dice rolling
    const rollAnimation = setInterval(() => {
      setDiceValues(rollDice());
    }, 100);

    setTimeout(() => {
      clearInterval(rollAnimation);
      const finalRoll = rollDice();
      setDiceValues(finalRoll);
      
      const result = calculateWin(finalRoll.dice1, finalRoll.dice2, finalRoll.dice1 + finalRoll.dice2, betType);
      setLastResult(result);

      if (result.isWin) {
        updateUserBalance(result.winAmount);
        setStreak(prev => prev + 1);
        
        if (result.isBonus) {
          toast.success(`🎲 Golden Dice! Won $${result.winAmount.toFixed(2)}!`, {
            description: `${result.multiplier}x multiplier applied!`
          });
        } else {
          toast.success(`🎲 You won $${result.winAmount.toFixed(2)}!`);
        }

        // Offer double or nothing
        if (diceConfig.bonusFeatures.doubleOrNothing.enabled && !doubleOrNothing.active) {
          setDoubleOrNothing({
            active: true,
            round: 1,
            potential: result.winAmount * 2
          });
        }
      } else {
        setStreak(0);
        toast.error('Better luck next time!');
      }

      setIsRolling(false);
    }, diceConfig.gameSettings.animationDuration);
  }, [user, betAmount, betType, rollDice, calculateWin, updateUserBalance, streak, doubleOrNothing.active]);

  const handleDoubleOrNothing = useCallback((accept: boolean) => {
    if (!accept) {
      setDoubleOrNothing({ active: false, round: 0, potential: 0 });
      return;
    }

    const dice = rollDice();
    const total = dice.dice1 + dice.dice2;
    const win = total >= 7;

    if (win && doubleOrNothing.round < diceConfig.bonusFeatures.doubleOrNothing.maxRounds) {
      const newPotential = doubleOrNothing.potential * 2;
      setDoubleOrNothing(prev => ({
        ...prev,
        round: prev.round + 1,
        potential: newPotential
      }));
      toast.success(`Double or Nothing won! Potential: $${newPotential.toFixed(2)}`);
    } else if (win) {
      updateUserBalance(doubleOrNothing.potential);
      toast.success(`🏆 Double or Nothing completed! Won $${doubleOrNothing.potential.toFixed(2)}!`);
      setDoubleOrNothing({ active: false, round: 0, potential: 0 });
    } else {
      toast.error('Double or Nothing lost!');
      setDoubleOrNothing({ active: false, round: 0, potential: 0 });
    }
  }, [rollDice, doubleOrNothing, updateUserBalance]);

  // Auto play functionality
  useEffect(() => {
    if (autoPlay && !isRolling && !doubleOrNothing.active) {
      const timer = setTimeout(handleRoll, diceConfig.gameSettings.autoRollDelay);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isRolling, doubleOrNothing.active, handleRoll]);

  const DiceIcon1 = DiceIcons[diceValues.dice1 - 1];
  const DiceIcon2 = DiceIcons[diceValues.dice2 - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎲 Enhanced Dice Game</h1>
        <p className="text-muted-foreground">Roll the dice and win big with enhanced features!</p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">${user?.balance.toFixed(2) || '0.00'}</div>
          <div className="text-sm text-muted-foreground">Balance</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{streak}</div>
          <div className="text-sm text-muted-foreground">Win Streak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {lastResult ? `$${lastResult.winAmount.toFixed(2)}` : '$0.00'}
          </div>
          <div className="text-sm text-muted-foreground">Last Win</div>
        </Card>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dice Display */}
        <Card className="p-6">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">Dice Roll</h3>
            
            <div className="flex justify-center items-center gap-8">
              <div className={`text-6xl transition-all duration-300 ${isRolling ? 'animate-spin' : ''}`}>
                <DiceIcon1 className={`w-16 h-16 ${lastResult?.isBonus ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
              <div className="text-3xl font-bold">+</div>
              <div className={`text-6xl transition-all duration-300 ${isRolling ? 'animate-spin' : ''}`}>
                <DiceIcon2 className={`w-16 h-16 ${lastResult?.isBonus ? 'text-yellow-500' : 'text-blue-500'}`} />
              </div>
            </div>

            <div className="text-4xl font-bold">
              = {diceValues.dice1 + diceValues.dice2}
            </div>

            {lastResult && (
              <div className="space-y-2">
                {lastResult.isWin ? (
                  <Badge variant="default" className="bg-green-600">
                    <Trophy className="w-4 h-4 mr-1" />
                    Win! {lastResult.multiplier}x
                  </Badge>
                ) : (
                  <Badge variant="destructive">Try Again</Badge>
                )}
                {lastResult.isBonus && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white ml-2">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Golden Dice!
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Betting Controls */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Place Your Bet</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bet-amount">Bet Amount</Label>
              <Input
                id="bet-amount"
                type="number"
                min={diceConfig.gameSettings.minBet}
                max={diceConfig.gameSettings.maxBet}
                step="0.1"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Bet Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Specific Number Bets */}
                {Object.entries(diceConfig.payouts.specific).map(([sum, multiplier]) => (
                  <Button
                    key={sum}
                    variant={betType === `specific-${sum}` ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBetType(`specific-${sum}`)}
                    className="text-xs"
                  >
                    {sum} ({multiplier}x)
                  </Button>
                ))}
                
                {/* Range Bets */}
                <Button
                  variant={betType === 'low' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('low')}
                >
                  Low (2-6) {diceConfig.payouts.ranges.low.multiplier}x
                </Button>
                <Button
                  variant={betType === 'high' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('high')}
                >
                  High (8-12) {diceConfig.payouts.ranges.high.multiplier}x
                </Button>
                <Button
                  variant={betType === 'even' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('even')}
                >
                  Even {diceConfig.payouts.ranges.even.multiplier}x
                </Button>
                <Button
                  variant={betType === 'odd' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType('odd')}
                >
                  Odd {diceConfig.payouts.ranges.odd.multiplier}x
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRoll}
                disabled={isRolling || !user || user.balance < betAmount}
                className="flex-1"
                size="lg"
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {autoPlay ? 'Stop' : 'Auto'}
              </Button>
            </div>

            {/* Streak Progress */}
            {streak > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Win Streak</span>
                  <span>{streak}/5</span>
                </div>
                <Progress value={(streak / 5) * 100} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Double or Nothing Modal */}
      {doubleOrNothing.active && (
        <Card className="p-6 border-yellow-500 border-2">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-yellow-600">🎯 Double or Nothing!</h3>
            <p>Current potential: ${doubleOrNothing.potential.toFixed(2)}</p>
            <p>Round {doubleOrNothing.round}/{diceConfig.bonusFeatures.doubleOrNothing.maxRounds}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleDoubleOrNothing(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Double It!
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDoubleOrNothing(false)}
              >
                Take Winnings
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
