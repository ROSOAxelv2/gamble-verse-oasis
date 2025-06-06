
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService } from '@/services/api';
import { GameType } from '@/types';
import { toast } from 'sonner';
import { MoneyComingSlotEngine, MoneyComingGameState, MoneyComingResult } from '@/utils/moneyComingSlotEngine';

export const useMoneyComingSlot = () => {
  const { user, updateUserBalance } = useAuth();
  const [engine] = useState(() => new MoneyComingSlotEngine());
  const [config, setConfig] = useState({
    minBet: 25,
    maxBet: 2500,
    enabled: false
  });
  
  const [betAmount, setBetAmount] = useState(engine.getBetLevels().minimum);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [gameResult, setGameResult] = useState<MoneyComingResult | null>(null);
  
  const [gameState, setGameState] = useState<MoneyComingGameState>({
    reels: [[], [], [], [], []],
    isSpinning: false,
    winningLines: [],
    freeSpinsRemaining: 0,
    isFreeSpin: false,
    bonusActive: false,
    bonusRound: 0,
    totalWin: 0,
    multiplier: 1,
    jackpotTriggered: false,
    wildPositions: [],
    scatterCount: 0,
    currentBet: engine.getBetLevels().minimum
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
        
        // Initialize reels
        const initialReels = engine.generateReels();
        setGameState(prev => ({
          ...prev,
          reels: initialReels,
          currentBet: slotConfig.minBet || engine.getBetLevels().minimum
        }));
        setBetAmount(slotConfig.minBet || engine.getBetLevels().minimum);
        
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

  const playSlots = async () => {
    if (!user || spinning || loading) {
      return;
    }

    if (user.balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setSpinning(true);
      setGameState(prev => ({ ...prev, isSpinning: true }));

      // Deduct bet amount
      updateUserBalance(-betAmount);

      // Simulate spinning delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate new reels
      const newReels = engine.generateReels();
      
      // Calculate wins
      const isCurrentlyFreeSpin = gameState.freeSpinsRemaining > 0;
      const { wins, totalWin, scatterCount } = engine.calculateWins(
        newReels, 
        betAmount, 
        isCurrentlyFreeSpin
      );

      // Check for bonus features
      const { freeSpinsAwarded, bonusTriggered, jackpotWon } = engine.checkBonusFeatures(
        newReels, 
        scatterCount
      );

      let finalWinAmount = totalWin;
      let newFreeSpins = gameState.freeSpinsRemaining;

      // Handle free spins
      if (freeSpinsAwarded > 0 && !isCurrentlyFreeSpin) {
        newFreeSpins = freeSpinsAwarded;
        toast.success(`🌳 ${freeSpinsAwarded} Free Spins Awarded!`);
      }

      // Decrement free spins if currently in free spin mode
      if (isCurrentlyFreeSpin) {
        newFreeSpins = Math.max(0, gameState.freeSpinsRemaining - 1);
        if (newFreeSpins === 0) {
          toast.info("Free spins completed!");
        }
      }

      // Handle bonus game
      if (bonusTriggered) {
        const bonusWin = engine.simulateBonusGame();
        finalWinAmount += bonusWin;
        toast.success(`🔒 Vault Bonus: +$${bonusWin.toFixed(2)}!`);
      }

      // Handle jackpot
      if (jackpotWon) {
        const jackpotAmount = engine.getGameInfo().maxWin === "2000x" ? betAmount * 2000 : 10000;
        finalWinAmount += jackpotAmount;
        toast.success(`💰 JACKPOT WON: $${jackpotAmount.toFixed(2)}!`);
      }

      // Update balance with winnings
      if (finalWinAmount > 0) {
        updateUserBalance(finalWinAmount);
        toast.success(`Won $${finalWinAmount.toFixed(2)}!`);
      }

      // Update game state
      setGameState(prev => ({
        ...prev,
        reels: newReels,
        isSpinning: false,
        winningLines: wins,
        freeSpinsRemaining: newFreeSpins,
        isFreeSpin: newFreeSpins > 0,
        bonusActive: bonusTriggered,
        totalWin: finalWinAmount,
        jackpotTriggered: jackpotWon,
        scatterCount,
        multiplier: isCurrentlyFreeSpin ? 2 : 1
      }));

      // Set game result with all required properties
      setGameResult({
        reels: newReels,
        wins,
        totalWin: finalWinAmount,
        freeSpinsAwarded,
        bonusTriggered,
        jackpotWon,
        newBalance: user.balance - betAmount + finalWinAmount,
        // Additional properties for SlotGameResult compatibility
        betAmount,
        winAmount: finalWinAmount,
        paylines: wins.map(win => win.line),
        isWin: finalWinAmount > 0
      });

    } catch (error) {
      console.error('Error playing slots:', error);
      toast.error('Failed to play slots');
      // Restore balance on error
      updateUserBalance(betAmount);
    } finally {
      setSpinning(false);
    }
  };

  return {
    betAmount,
    loading,
    spinning,
    gameResult,
    gameState,
    config,
    engine,
    handleBetAmountChange,
    playSlots
  };
};
