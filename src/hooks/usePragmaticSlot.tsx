import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService, userService } from "../services/api";
import { GameType, TransactionType } from "../types";
import { PragmaticGameState, PragmaticAztecConfig } from "../types/slots";
import { toast } from "sonner";
import { 
  DEFAULT_PRAGMATIC_CONFIG,
  PRAGMATIC_SYMBOLS,
  PragmaticSymbolType
} from "../utils/pragmaticSlotSymbols";

export const usePragmaticSlot = () => {
  const { user, loading: authLoading } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 50,
    maxBet: 2500,
    enabled: true // Default to enabled
  });
  
  const [gameState, setGameState] = useState<PragmaticGameState>({
    reels: [[], [], [], [], [], []],
    winningLines: [],
    totalWin: 0,
    isBonus: false,
    bonusType: null,
    bonusData: null,
    grid: Array(6).fill(null).map(() => Array(5).fill(PRAGMATIC_SYMBOLS.BLANK.symbol)),
    wildMeter: 0,
    currentMultiplier: 1,
    freeSpinsRemaining: 0,
    giantSymbols: [],
    cascadeCount: 0,
    isFreeSpin: false
  });
  
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const pragmaticConfig = await gameService.getGameConfig(GameType.TREASURE_OF_AZTEC);
        setConfig({
          minBet: pragmaticConfig.minBet || 50,
          maxBet: pragmaticConfig.maxBet || 2500,
          enabled: pragmaticConfig.enabled !== false // Default to true if undefined
        });
        console.log("PragmaticSlot: Game config loaded", pragmaticConfig);
      } catch (error) {
        console.error("PragmaticSlot: Failed to load pragmatic game config:", error);
        // Keep default config if API fails
        console.log("PragmaticSlot: Using default pragmatic slot machine configuration");
      }
    };
    
    fetchGameConfig();
    initializeGrid();
  }, []);
  
  const initializeGrid = () => {
    const newGrid = Array(6).fill(null).map(() => 
      Array(5).fill(null).map(() => {
        const symbolKeys = Object.keys(PRAGMATIC_SYMBOLS);
        const randomSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as PragmaticSymbolType;
        return PRAGMATIC_SYMBOLS[randomSymbol].symbol;
      })
    );
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid
    }));
  };
  
  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  const playSlots = async () => {
    console.log("PragmaticSlot: Play slots called");
    console.log("PragmaticSlot: User state:", user);
    console.log("PragmaticSlot: Auth loading:", authLoading);
    
    if (authLoading) {
      console.log("PragmaticSlot: Still loading auth, please wait");
      toast.error("Still loading, please wait...");
      return;
    }
    
    if (!user) {
      console.log("PragmaticSlot: No user found, authentication required");
      toast.error("You must be logged in to play");
      return;
    }
    
    if (betAmount < config.minBet || betAmount > config.maxBet) {
      console.log("PragmaticSlot: Invalid bet amount", betAmount, config);
      toast.error(`Bet must be between ${config.minBet} and ${config.maxBet}`);
      return;
    }
    
    try {
      setLoading(true);
      setSpinning(true);
      console.log("PragmaticSlot: Starting spin with bet amount:", betAmount);
      
      // Use free spin if available, otherwise place a bet
      if (gameState.freeSpinsRemaining > 0 && gameState.isFreeSpin) {
        setGameState(prev => ({
          ...prev,
          freeSpinsRemaining: prev.freeSpinsRemaining - 1
        }));
        console.log("PragmaticSlot: Using free spin");
      } else {
        // Regular spin - place bet
        console.log("PragmaticSlot: Placing bet via userService");
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.TREASURE_OF_AZTEC);
        console.log("PragmaticSlot: Bet placed successfully");
      }
      
      // Simulate spin result (in real implementation, this would come from backend)
      setTimeout(() => {
        const newGrid = Array(6).fill(null).map(() => 
          Array(5).fill(null).map(() => {
            const symbolKeys = Object.keys(PRAGMATIC_SYMBOLS);
            const randomSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as PragmaticSymbolType;
            return PRAGMATIC_SYMBOLS[randomSymbol].symbol;
          })
        );
        
        setGameState(prev => ({
          ...prev,
          grid: newGrid
        }));
        
        setSpinning(false);
        
        // Simple win calculation for demo
        const isWin = Math.random() > 0.7;
        if (isWin) {
          const winAmount = betAmount * (Math.random() * 3 + 1);
          setGameResult({ winAmount, isWin: true });
          userService.updateBalance(winAmount, TransactionType.WIN, GameType.TREASURE_OF_AZTEC);
          toast.success(`You won ${winAmount.toFixed(0)} credits!`);
          console.log("PragmaticSlot: Win result:", winAmount);
        } else {
          setGameResult({ winAmount: 0, isWin: false });
          toast.error("Better luck next time!");
          console.log("PragmaticSlot: No win this round");
        }
      }, 2000);
      
    } catch (error) {
      console.error("PragmaticSlot: Pragmatic slot game error:", error);
      toast.error("Failed to play: " + (error as Error).message);
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  };

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
