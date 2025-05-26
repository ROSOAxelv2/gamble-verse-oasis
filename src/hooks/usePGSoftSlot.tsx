
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService, userService } from "../services/api";
import { GameType, SlotGameResult, TransactionType } from "../types";
import { PragmaticGameState } from "../types/slots";
import { toast } from "sonner";
import { PGSoftSlotEngine, SlotEngineConfig } from "../utils/pgSoftSlotEngine";

// Load official configuration
import officialConfig from "../config/pgsoft-treasures-aztec-official.json";

export const usePGSoftSlot = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [cascading, setCascading] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  const [config, setConfig] = useState<{ minBet: number; maxBet: number; enabled: boolean }>({
    minBet: 50,
    maxBet: 2500,
    enabled: true
  });

  // Game state following PG Soft mechanics
  const [gameState, setGameState] = useState<PragmaticGameState>({
    reels: [],
    winningLines: [],
    totalWin: 0,
    isBonus: false,
    bonusType: null,
    bonusData: null,
    grid: Array(6).fill(null).map(() => Array(5).fill("⬛")),
    wildMeter: 0,
    currentMultiplier: 1,
    freeSpinsRemaining: 0,
    giantSymbols: [],
    cascadeCount: 0,
    isFreeSpin: false
  });

  // Initialize slot engine
  const [slotEngine] = useState(() => {
    const engineConfig: SlotEngineConfig = {
      reels: 6,
      rows: 5,
      adjacencyRequirement: 4,
      maxCascades: 50,
      wildMeterThreshold: 6,
      symbols: {},
      reelStrips: {
        baseGame: [
          officialConfig.reelStrips.baseGame.reel1,
          officialConfig.reelStrips.baseGame.reel2,
          officialConfig.reelStrips.baseGame.reel3,
          officialConfig.reelStrips.baseGame.reel4,
          officialConfig.reelStrips.baseGame.reel5,
          officialConfig.reelStrips.baseGame.reel6
        ],
        freeSpins: [
          officialConfig.reelStrips.freeSpins.reel1,
          officialConfig.reelStrips.freeSpins.reel2,
          officialConfig.reelStrips.freeSpins.reel3,
          officialConfig.reelStrips.freeSpins.reel4,
          officialConfig.reelStrips.freeSpins.reel5,
          officialConfig.reelStrips.freeSpins.reel6
        ]
      }
    };

    // Flatten symbols from config with proper type handling
    Object.values(officialConfig.symbols).forEach(category => {
      if (typeof category === "object" && category !== null) {
        Object.values(category as Record<string, any>).forEach(symbol => {
          if (symbol && typeof symbol === "object" && "id" in symbol) {
            engineConfig.symbols[symbol.id as string] = symbol as any;
          }
        });
      }
    });

    return new PGSoftSlotEngine(engineConfig);
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotsConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig({
          minBet: slotsConfig.minBet || 50,
          maxBet: slotsConfig.maxBet || 2500,
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

  const triggerFreeSpins = useCallback((scatterCount: number) => {
    const spinMap = officialConfig.freeSpinConfiguration.triggerScatters;
    const scatterKey = scatterCount.toString() as keyof typeof spinMap;
    const spins = spinMap[scatterKey] || 0;
    
    setGameState(prev => ({
      ...prev,
      isFreeSpin: true,
      freeSpinsRemaining: spins,
      cascadeCount: 0
    }));

    toast.success(`🏛️ FREE SPINS TRIGGERED! ${spins} spins awarded!`);
  }, []);

  const triggerWildMeterBonus = useCallback(() => {
    const multipliers = officialConfig.wildMeterConfiguration.multipliers;
    const randomMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    
    setGameState(prev => ({
      ...prev,
      currentMultiplier: randomMultiplier,
      wildMeter: 0 // Reset meter
    }));

    toast.success(`💍 WILD METER FULL! ${randomMultiplier}x Multiplier activated!`);
  }, []);

  const animateSpinSequence = useCallback(async (result: any) => {
    setSpinning(true);
    setCascading(false);
    setGameState(prev => ({ ...prev, cascadeCount: 0 }));

    // Spin animation following PG Soft timing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set initial result
    setGameState(prev => ({
      ...prev,
      grid: result.grid,
      giantSymbols: result.giantSymbols,
      wildMeter: Math.min(prev.wildMeter + result.wildMeterIncrease, 6)
    }));

    setSpinning(false);

    // Process cascades with delays
    if (result.cascades.length > 0) {
      for (let i = 0; i < result.cascades.length; i++) {
        const cascade = result.cascades[i];
        
        setCascading(true);
        setGameState(prev => ({ ...prev, cascadeCount: cascade.cascadeNumber }));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setGameState(prev => ({
          ...prev,
          grid: cascade.newGrid,
          wildMeter: Math.min(prev.wildMeter + cascade.wildMeterIncrease, 6)
        }));
        
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      setCascading(false);
    }

    // Check for bonus triggers
    if (result.wildMeterIncrease > 0 && gameState.wildMeter + result.wildMeterIncrease >= 6) {
      setTimeout(triggerWildMeterBonus, 500);
    }

    if (result.scatterCount >= 4 && !gameState.isFreeSpin) {
      setTimeout(() => triggerFreeSpins(result.scatterCount), 1000);
    }

  }, [gameState.wildMeter, gameState.isFreeSpin, triggerWildMeterBonus, triggerFreeSpins]);

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
      if (gameState.freeSpinsRemaining > 0 && gameState.isFreeSpin) {
        setGameState(prev => ({ ...prev, freeSpinsRemaining: prev.freeSpinsRemaining - 1 }));
      } else {
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS);
      }

      // Get spin result from engine
      const spinResult = slotEngine.spin(gameState.isFreeSpin);
      
      // Calculate final payout with multiplier
      let finalPayout = spinResult.totalPayout * betAmount;
      if (gameState.currentMultiplier > 1) {
        finalPayout *= gameState.currentMultiplier;
      }

      // Create game result with betAmount included
      const result: SlotGameResult = {
        reels: spinResult.grid,
        isWin: finalPayout > 0,
        winAmount: finalPayout,
        paylines: finalPayout > 0 ? [1] : [],
        betAmount: betAmount
      };

      setGameResult(result);

      // Animate the spin sequence
      await animateSpinSequence(spinResult);

      // Process winnings
      if (result.isWin) {
        await userService.updateBalance(result.winAmount, TransactionType.WIN, GameType.SLOTS);
        toast.success(`You won ${result.winAmount.toFixed(2)} credits!`);
      }

      // Check if free spins ended
      if (gameState.freeSpinsRemaining === 1 && gameState.isFreeSpin) {
        setGameState(prev => ({
          ...prev,
          isFreeSpin: false,
          currentMultiplier: 1,
          giantSymbols: []
        }));
        toast.info("Free spins round ended");
      }

    } catch (error) {
      console.error("PG Soft slot error:", error);
      toast.error("Failed to play: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, betAmount, config, gameState, slotEngine, animateSpinSequence]);

  return {
    betAmount,
    loading,
    spinning,
    cascading,
    gameResult,
    gameState,
    config,
    handleBetAmountChange,
    playSlots
  };
};
