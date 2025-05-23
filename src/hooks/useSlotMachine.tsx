
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService, userService } from "../services/api";
import { GameType, SlotGameResult, TransactionType } from "../types";
import { SlotGameTheme } from "../types/slots";
import { toast } from "sonner";
import { getSymbolsForTheme } from "../utils/slotSymbols";

export const useSlotMachine = (initialGameTheme: SlotGameTheme = SlotGameTheme.CLASSIC) => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  const [activeGame, setActiveGame] = useState<SlotGameTheme>(initialGameTheme);
  const [visibleReels, setVisibleReels] = useState<string[][]>([[], [], []]);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 25,
    maxBet: 1500,
    enabled: false
  });
  
  // Aztec game features
  const [wildCollection, setWildCollection] = useState<number>(0);
  const [maxWildCollection, setMaxWildCollection] = useState<number>(10);
  const [freeSpins, setFreeSpins] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isBonus, setIsBonus] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotsConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig({
          minBet: slotsConfig.minBet,
          maxBet: slotsConfig.maxBet,
          enabled: slotsConfig.enabled
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game configuration");
      }
    };
    
    fetchGameConfig();
  }, []);

  useEffect(() => {
    // Reset or initialize game specific state when game changes
    const symbols = getSymbolsForTheme(activeGame);
    
    if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC) {
      setVisibleReels([
        [symbols.LOW_A, symbols.LOW_B, symbols.LOW_C],
        [symbols.HIGH_A, symbols.WILD, symbols.HIGH_B],
        [symbols.LOW_D, symbols.SCATTER, symbols.HIGH_C],
      ]);
    } else {
      // Reset to classic layout
      setVisibleReels([
        [symbols.CHERRY, symbols.CHERRY, symbols.CHERRY],
        [symbols.LEMON, symbols.LEMON, symbols.LEMON],
        [symbols.ORANGE, symbols.ORANGE, symbols.ORANGE],
      ]);
    }
    
    // Reset bonus states
    setWildCollection(0);
    setFreeSpins(0);
    setMultiplier(1);
    setIsBonus(false);
  }, [activeGame]);
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  const animateReels = (finalState: string[][]) => {
    setSpinning(true);
    
    const symbols = getSymbolsForTheme(activeGame);
    const symbolKeys = Object.keys(symbols);
    const totalFrames = 30;
    let frame = 0;
    
    const spin = () => {
      if (frame < totalFrames) {
        const tempReels: string[][] = [[], [], []];
        
        // Generate random symbols for each reel
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            // Gradually slow down and converge to final state
            if (frame > totalFrames - 10 && i < finalState.length && j < finalState[i].length) {
              if (frame > totalFrames - 5 - i * 2) {
                tempReels[i][j] = finalState[i][j];
              } else {
                const randomIndex = Math.floor(Math.random() * symbolKeys.length);
                const symbol = symbols[symbolKeys[randomIndex] as keyof typeof symbols];
                tempReels[i][j] = symbol;
              }
            } else {
              const randomIndex = Math.floor(Math.random() * symbolKeys.length);
              const symbol = symbols[symbolKeys[randomIndex] as keyof typeof symbols];
              tempReels[i][j] = symbol;
            }
          }
        }
        
        setVisibleReels(tempReels);
        frame++;
        requestAnimationFrame(spin);
      } else {
        setVisibleReels(finalState);
        setSpinning(false);
        
        // Process special symbols for Aztec game
        if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC) {
          processAztecSymbols(finalState);
        }
      }
    };
    
    requestAnimationFrame(spin);
  };
  
  const processAztecSymbols = (reels: string[][]) => {
    // Count wilds and scatters
    const symbols = getSymbolsForTheme(SlotGameTheme.TREASURE_OF_AZTEC);
    let wildCount = 0;
    let scatterCount = 0;
    
    for (let i = 0; i < reels.length; i++) {
      for (let j = 0; j < reels[i].length; j++) {
        if (reels[i][j] === symbols.WILD) {
          wildCount++;
        }
        if (reels[i][j] === symbols.SCATTER) {
          scatterCount++;
        }
      }
    }
    
    // Collect wilds for the meter
    if (wildCount > 0) {
      setWildCollection(prev => {
        const newValue = Math.min(prev + wildCount, maxWildCollection);
        
        // If meter is full, trigger free spins
        if (newValue >= maxWildCollection && !isBonus) {
          triggerFreeSpins();
        }
        
        return newValue;
      });
      
      // Increase multiplier based on wilds
      setMultiplier(prev => Math.min(prev + (wildCount * 0.5), 5));
    }
    
    // Trigger free spins with 3+ scatters
    if (scatterCount >= 3 && !isBonus) {
      triggerFreeSpins();
    }
  };
  
  const triggerFreeSpins = () => {
    setIsBonus(true);
    setFreeSpins(7);
    toast.success("🌟 FREE SPINS TRIGGERED! 🌟");
  };
  
  const playSlots = async () => {
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
      
      // Use free spin if available, otherwise place a bet
      if (freeSpins > 0 && isBonus) {
        setFreeSpins(prev => prev - 1);
      } else {
        // Regular spin - place bet
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS);
      }
      
      // Get result from backend
      const result = await gameService.playSlotsGame(betAmount);
      
      // Animate spinning reels
      animateReels(result.reels);
      
      // Apply multiplier for Aztec game if in bonus mode
      if (activeGame === SlotGameTheme.TREASURE_OF_AZTEC && isBonus && result.isWin) {
        result.winAmount *= multiplier;
      }
      
      setGameResult(result);
      
      // Add win to balance if there's a win
      if (result.isWin) {
        await userService.updateBalance(result.winAmount, TransactionType.WIN, GameType.SLOTS);
        toast.success(`You won ${result.winAmount} credits!`);
      } else {
        toast.error("Better luck next time!");
      }
      
      // Check if free spins ended
      if (freeSpins === 1 && isBonus) {
        setIsBonus(false);
        setMultiplier(1);
        toast.info("Free spins round ended");
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to play: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    betAmount,
    loading,
    spinning,
    gameResult,
    activeGame,
    visibleReels,
    config,
    wildCollection,
    maxWildCollection,
    freeSpins,
    multiplier,
    isBonus,
    handleBetAmountChange,
    setActiveGame,
    playSlots
  };
};
