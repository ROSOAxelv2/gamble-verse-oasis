
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService, userService } from "../services/api";
import { GameType, SlotGameResult, TransactionType } from "../types";
import { toast } from "sonner";

interface SuperAceGameState {
  reels: string[][];
  winningLines: number[];
  totalWin: number;
  isBonus: boolean;
  bonusType: string | null;
  bonusData: any | null;
  aceCount: number;
  multiplier: number;
  superAceActive: boolean;
  freeSpinsRemaining: number;
}

export const useSuperAceSlot = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 100,
    maxBet: 5000,
    enabled: true
  });

  const [gameState, setGameState] = useState<SuperAceGameState>({
    reels: Array(5).fill(null).map(() => Array(3).fill("🃏")),
    winningLines: [],
    totalWin: 0,
    isBonus: false,
    bonusType: null,
    bonusData: null,
    aceCount: 0,
    multiplier: 1,
    superAceActive: false,
    freeSpinsRemaining: 0
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotsConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig({
          minBet: slotsConfig.minBet || 100,
          maxBet: slotsConfig.maxBet || 5000,
          enabled: slotsConfig.enabled !== false
        });
      } catch (error) {
        console.error("Failed to load game config:", error);
      }
    };
    
    fetchGameConfig();
  }, []);

  const handleBetAmountChange = useCallback((value: number[]) => {
    setBetAmount(value[0]);
  }, []);

  const generateRandomReels = useCallback(() => {
    const symbols = ["🃁", "🂮", "🂭", "🂫", "🂪", "🂩", "🂨", "🂧", "🂦", "🂥", "💎", "👑"];
    const aceSymbols = ["🃁", "♠️", "♥️", "♦️", "♣️"];
    
    const newReels: string[][] = [];
    let totalAces = 0;
    
    for (let reel = 0; reel < 5; reel++) {
      const reelSymbols: string[] = [];
      for (let row = 0; row < 3; row++) {
        // Higher chance for ace symbols
        if (Math.random() < 0.15) {
          const aceSymbol = aceSymbols[Math.floor(Math.random() * aceSymbols.length)];
          reelSymbols.push(aceSymbol);
          if (aceSymbol === "🃁") totalAces++;
        } else {
          reelSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
      }
      newReels.push(reelSymbols);
    }
    
    return { reels: newReels, aceCount: totalAces };
  }, []);

  const calculateWins = useCallback((reels: string[][]) => {
    let totalWin = 0;
    const winningLines: number[] = [];
    
    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
      const line = reels.map(reel => reel[row]);
      if (checkWinningLine(line)) {
        winningLines.push(row + 1);
        totalWin += betAmount * getLineMultiplier(line);
      }
    }
    
    // Check for special ace combinations
    const aceCount = reels.flat().filter(symbol => symbol === "🃁").length;
    if (aceCount >= 3) {
      totalWin += betAmount * (aceCount * 10);
      toast.success(`🃁 ACE COMBO! ${aceCount} Aces = ${aceCount * 10}x!`);
    }
    
    return { totalWin, winningLines, aceCount };
  }, [betAmount]);

  const checkWinningLine = (line: string[]): boolean => {
    const first = line[0];
    return line.slice(1, 3).every(symbol => symbol === first || symbol === "🃁");
  };

  const getLineMultiplier = (line: string[]): number => {
    const symbol = line[0];
    const matchCount = line.filter(s => s === symbol || s === "🃁").length;
    
    if (symbol === "👑") return matchCount * 15;
    if (symbol === "💎") return matchCount * 12;
    if (symbol === "🃁") return matchCount * 20;
    return matchCount * 5;
  };

  const triggerSuperAce = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      superAceActive: true,
      multiplier: 3,
      freeSpinsRemaining: 5
    }));
    
    toast.success("🌟 SUPER ACE ACTIVATED! 3x Multiplier + 5 Free Spins!");
  }, []);

  const animateSpinSequence = useCallback(async (finalReels: string[][], aceCount: number) => {
    setSpinning(true);
    
    // Spin animation
    for (let i = 0; i < 20; i++) {
      const { reels } = generateRandomReels();
      setGameState(prev => ({ ...prev, reels }));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Set final result
    setGameState(prev => ({
      ...prev,
      reels: finalReels,
      aceCount
    }));
    
    setSpinning(false);
    
    // Check for Super Ace trigger
    if (aceCount >= 4 && !gameState.superAceActive) {
      setTimeout(triggerSuperAce, 1000);
    }
  }, [generateRandomReels, gameState.superAceActive, triggerSuperAce]);

  const playSlots = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to play");
      return;
    }

    if (betAmount < config.minBet || betAmount > config.maxBet) {
      toast.error(`Bet must be between ${config.minBet} and ${config.maxBet}`);
      return;
    }

    try {
      setLoading(true);

      // Use free spin if available
      if (gameState.freeSpinsRemaining > 0) {
        setGameState(prev => ({ ...prev, freeSpinsRemaining: prev.freeSpinsRemaining - 1 }));
      } else {
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS);
      }

      // Generate spin result
      const { reels: finalReels, aceCount } = generateRandomReels();
      const { totalWin, winningLines } = calculateWins(finalReels);
      
      // Apply multiplier if Super Ace is active
      let finalPayout = totalWin;
      if (gameState.superAceActive) {
        finalPayout *= gameState.multiplier;
      }

      const result: SlotGameResult = {
        reels: finalReels,
        isWin: finalPayout > 0,
        winAmount: finalPayout,
        paylines: winningLines,
        betAmount: betAmount
      };

      setGameResult(result);
      setGameState(prev => ({ ...prev, totalWin: finalPayout, winningLines }));

      // Animate the spin
      await animateSpinSequence(finalReels, aceCount);

      // Process winnings
      if (result.isWin) {
        await userService.updateBalance(result.winAmount, TransactionType.WIN, GameType.SLOTS);
        toast.success(`You won ${result.winAmount.toFixed(2)} credits!`);
      }

      // Check if Super Ace mode ended
      if (gameState.freeSpinsRemaining === 1 && gameState.superAceActive) {
        setGameState(prev => ({
          ...prev,
          superAceActive: false,
          multiplier: 1
        }));
        toast.info("Super Ace mode ended");
      }

    } catch (error) {
      console.error("Super Ace slot error:", error);
      toast.error("Failed to play: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, betAmount, config, gameState, generateRandomReels, calculateWins, animateSpinSequence]);

  return {
    betAmount,
    loading,
    spinning,
    gameResult,
    gameState,
    config,
    handleBetAmountChange,
    playSlots
  };
};
