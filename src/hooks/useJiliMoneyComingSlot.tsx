
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService } from '@/services/api';
import { GameType } from '@/types';
import { toast } from 'sonner';
import { JiliMoneyComingEngine, JiliSpinResult, BonusWheelResult, JiliGameState } from '@/utils/jiliMoneyComingEngine';

export const useJiliMoneyComingSlot = () => {
  const { user, updateUserBalance } = useAuth();
  const [engine] = useState(() => new JiliMoneyComingEngine());
  const [config, setConfig] = useState({
    minBet: 25,
    maxBet: 2500,
    enabled: false
  });
  
  const [betAmount, setBetAmount] = useState(engine.getBetLevels().minimum);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [gameResult, setGameResult] = useState<JiliSpinResult | null>(null);
  const [bonusWheelResult, setBonusWheelResult] = useState<BonusWheelResult | null>(null);
  
  const [gameState, setGameState] = useState<JiliGameState>({
    mainGrid: [['0', '0', '0'], ['0', '0', '0'], ['0', '0', '0']],
    multiplierReel: 'x2',
    currentBet: engine.getBetLevels().minimum,
    totalWin: 0,
    respinCount: 0,
    isSpinning: false,
    showBonusWheel: false,
    lastSpinResult: null,
    bonusWheelResult: null
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig({
          minBet: slotConfig.minBet || engine.getBetLevels().minimum,
          maxBet: slotConfig.maxBet || engine.getBetLevels().maximum,
          enabled: slotConfig.enabled
        });
        
        setBetAmount(slotConfig.minBet || engine.getBetLevels().minimum);
        setGameState(prev => ({
          ...prev,
          currentBet: slotConfig.minBet || engine.getBetLevels().minimum
        }));
        
      } catch (error) {
        console.error('Failed to load game config:', error);
        toast.error("Failed to load game configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchGameConfig();
  }, [engine]);

  const handleBetAmountChange = (value: number[]) => {
    const numValue = value[0];
    if (!isNaN(numValue) && numValue >= config.minBet && numValue <= config.maxBet) {
      setBetAmount(numValue);
      setGameState(prev => ({ ...prev, currentBet: numValue }));
    }
  };

  const performSpin = async (isRespin: boolean = false) => {
    if (!user || spinning || loading) {
      return;
    }

    if (!isRespin && user.balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setSpinning(true);
      setGameState(prev => ({ ...prev, isSpinning: true }));

      // Deduct bet amount only for initial spin, not respins
      if (!isRespin) {
        updateUserBalance(-betAmount);
      }

      // Simulate spinning delay with proper reel stopping sequence
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Perform the spin
      const spinResult = engine.performSpin(betAmount, gameState.respinCount);
      
      setGameResult(spinResult);
      setGameState(prev => ({
        ...prev,
        mainGrid: spinResult.mainReels,
        multiplierReel: spinResult.multiplierSymbol,
        totalWin: spinResult.finalWin,
        respinCount: spinResult.respinCount,
        isSpinning: false,
        lastSpinResult: spinResult
      }));

      // Handle different outcomes
      if (spinResult.isBonusWheel) {
        // Trigger bonus wheel
        setTimeout(() => {
          setGameState(prev => ({ ...prev, showBonusWheel: true }));
          toast.success("🎡 Bonus Wheel Triggered!");
        }, 1000);
      } else if (spinResult.isRespin) {
        // Trigger respin
        toast.success(`🔄 Respin Awarded! (${spinResult.respinCount + 1}/3)`);
        setTimeout(() => {
          setGameState(prev => ({ ...prev, respinCount: spinResult.respinCount }));
          performSpin(true); // Recursive respin
        }, 1500);
      } else if (spinResult.finalWin > 0) {
        // Regular win
        updateUserBalance(spinResult.finalWin);
        toast.success(`Won $${spinResult.finalWin.toFixed(2)}!`);
        setGameState(prev => ({ ...prev, respinCount: 0 })); // Reset respin count
      } else {
        // No win
        setGameState(prev => ({ ...prev, respinCount: 0 })); // Reset respin count
      }

    } catch (error) {
      console.error('Error playing Jili Money Coming:', error);
      toast.error('Failed to play slot');
      // Restore balance on error
      if (!isRespin) {
        updateUserBalance(betAmount);
      }
    } finally {
      setSpinning(false);
    }
  };

  const spinBonusWheel = async () => {
    if (!gameResult) return;

    try {
      // Simulate wheel spin animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const wheelResult = engine.launchBonusWheel(gameResult.baseWin);
      setBonusWheelResult(wheelResult);
      
      // Award final win
      updateUserBalance(wheelResult.finalWin);
      
      // Show celebration for high wins
      if (wheelResult.multiplier >= 1000) {
        toast.success(`🎉 MEGA WIN! x${wheelResult.multiplier} = $${wheelResult.finalWin.toFixed(2)}!`, {
          duration: 5000
        });
      } else {
        toast.success(`🎡 Wheel Win: x${wheelResult.multiplier} = $${wheelResult.finalWin.toFixed(2)}!`);
      }
      
      setGameState(prev => ({
        ...prev,
        showBonusWheel: false,
        bonusWheelResult: wheelResult,
        totalWin: wheelResult.finalWin,
        respinCount: 0
      }));
      
    } catch (error) {
      console.error('Error spinning bonus wheel:', error);
      toast.error('Bonus wheel error');
    }
  };

  const playSlots = () => {
    setGameState(prev => ({ ...prev, respinCount: 0 })); // Reset for new game
    performSpin(false);
  };

  return {
    betAmount,
    loading,
    spinning,
    gameResult,
    bonusWheelResult,
    gameState,
    config,
    engine,
    handleBetAmountChange,
    playSlots,
    spinBonusWheel
  };
};
