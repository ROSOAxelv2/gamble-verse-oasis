
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService, userService } from "../services/api";
import { GameType, SlotGameResult, TransactionType } from "../types";
import { GiantSymbolPosition, PragmaticGameState } from "../types/slots";
import { toast } from "sonner";
import { PRAGMATIC_SYMBOLS, DEFAULT_PRAGMATIC_CONFIG, getSymbolByChar, isSymbolType } from "../utils/pragmaticSlotSymbols";

export const usePragmaticSlot = () => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<SlotGameResult | null>(null);
  
  // Pragmatic game state
  const [gameState, setGameState] = useState<PragmaticGameState>({
    reels: [], // For compatibility with SlotGameState
    grid: Array(DEFAULT_PRAGMATIC_CONFIG.gridSize.rows).fill(null)
      .map(() => Array(DEFAULT_PRAGMATIC_CONFIG.gridSize.reels).fill(PRAGMATIC_SYMBOLS.BLANK.symbol)),
    winningLines: [],
    totalWin: 0,
    wildMeter: 0,
    currentMultiplier: 1,
    freeSpinsRemaining: 0,
    giantSymbols: [],
    cascadeCount: 0,
    isBonus: false,
    bonusType: null,
    bonusData: null,
    isFreeSpin: false
  });
  
  const [config, setConfig] = useState({
    minBet: 50,
    maxBet: 2500,
    enabled: true,
    pragmaticConfig: DEFAULT_PRAGMATIC_CONFIG
  });
  
  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const slotsConfig = await gameService.getGameConfig(GameType.SLOTS);
        setConfig(prev => ({
          ...prev,
          minBet: slotsConfig.minBet,
          maxBet: slotsConfig.maxBet,
          enabled: slotsConfig.enabled
        }));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game configuration");
      }
    };
    
    fetchGameConfig();
  }, []);

  const handleBetAmountChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  // Generate a random grid for testing/display purposes
  const generateRandomGrid = (isFreeSpin: boolean = false): string[][] => {
    const { reels, rows } = config.pragmaticConfig.gridSize;
    const grid: string[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      
      for (let j = 0; j < reels; j++) {
        // During free spins, we may generate giant symbols on reels 2-5
        if (isFreeSpin && j >= 1 && j <= 4 && i < rows - 1 && Math.random() < 0.15) {
          // Skip this cell as it will be part of a giant symbol
          // The giant symbol will be added to the giantSymbols array separately
          row.push("GIANT_PLACEHOLDER");
        } else {
          // Normal symbol generation
          const rand = Math.random();
          if (rand < 0.02) {
            row.push(PRAGMATIC_SYMBOLS.SCATTER.symbol);
          } else if (rand < 0.05) {
            row.push(PRAGMATIC_SYMBOLS.WILD.symbol);
          } else if (rand < 0.3) {
            row.push(PRAGMATIC_SYMBOLS.BLANK.symbol);
          } else if (rand < 0.4) {
            row.push(PRAGMATIC_SYMBOLS.A.symbol);
          } else if (rand < 0.5) {
            row.push(PRAGMATIC_SYMBOLS.B.symbol);
          } else if (rand < 0.6) {
            row.push(PRAGMATIC_SYMBOLS.C.symbol);
          } else if (rand < 0.7) {
            row.push(PRAGMATIC_SYMBOLS.D.symbol);
          } else if (rand < 0.8) {
            row.push(PRAGMATIC_SYMBOLS.E.symbol);
          } else if (rand < 0.9) {
            row.push(PRAGMATIC_SYMBOLS.F.symbol);
          } else if (rand < 0.95) {
            row.push(PRAGMATIC_SYMBOLS.G.symbol);
          } else {
            row.push(PRAGMATIC_SYMBOLS.H.symbol);
          }
        }
      }
      
      grid.push(row);
    }
    
    // Now add giant symbols if in free spins
    const giantSymbols: GiantSymbolPosition[] = [];
    
    if (isFreeSpin) {
      const premiumSymbols = [
        PRAGMATIC_SYMBOLS.A.symbol, 
        PRAGMATIC_SYMBOLS.B.symbol, 
        PRAGMATIC_SYMBOLS.C.symbol
      ];
      
      // Check for GIANT_PLACEHOLDER and create giant symbols
      for (let i = 0; i < rows - 1; i++) {
        for (let j = 1; j <= 4; j++) {
          if (grid[i][j] === "GIANT_PLACEHOLDER" && grid[i][j+1] === "GIANT_PLACEHOLDER" &&
              grid[i+1][j] === "GIANT_PLACEHOLDER" && grid[i+1][j+1] === "GIANT_PLACEHOLDER") {
            
            const randomPremium = premiumSymbols[Math.floor(Math.random() * premiumSymbols.length)];
            
            // Create the giant symbol
            giantSymbols.push({
              symbol: randomPremium,
              startRow: i,
              startCol: j,
              width: 2,
              height: 2,
              isSticky: Math.random() < 0.5 // 50% chance to be sticky
            });
            
            // Replace placeholders with the actual symbol
            grid[i][j] = randomPremium;
            grid[i][j+1] = randomPremium;
            grid[i+1][j] = randomPremium;
            grid[i+1][j+1] = randomPremium;
          }
        }
      }
      
      // Replace any remaining GIANT_PLACEHOLDER with regular symbols
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < reels; j++) {
          if (grid[i][j] === "GIANT_PLACEHOLDER") {
            // Generate a regular symbol
            const rand = Math.random();
            if (rand < 0.3) {
              grid[i][j] = PRAGMATIC_SYMBOLS.BLANK.symbol;
            } else if (rand < 0.4) {
              grid[i][j] = PRAGMATIC_SYMBOLS.D.symbol;
            } else if (rand < 0.5) {
              grid[i][j] = PRAGMATIC_SYMBOLS.E.symbol;
            } else if (rand < 0.6) {
              grid[i][j] = PRAGMATIC_SYMBOLS.F.symbol;
            } else if (rand < 0.8) {
              grid[i][j] = PRAGMATIC_SYMBOLS.G.symbol;
            } else {
              grid[i][j] = PRAGMATIC_SYMBOLS.H.symbol;
            }
          }
        }
      }
    }
    
    return grid;
  };
  
  // Check for adjacent wins in the grid (simplified version for now)
  const checkAdjacentWins = (grid: string[][]): { winningSymbols: Set<string>, winCount: Record<string, number> } => {
    const { reels, rows } = config.pragmaticConfig.gridSize;
    const minAdjacent = config.pragmaticConfig.adjacencyRequirement;
    const winningSymbols = new Set<string>();
    const winCount: Record<string, number> = {};
    
    // Check each symbol in the grid
    for (let i = 0; i < rows; i++) {
      let currentSymbol = grid[i][0];
      let adjacentCount = isSymbolType(currentSymbol, "blank") ? 0 : 1;
      
      // Skip if the first symbol is blank
      if (isSymbolType(currentSymbol, "blank")) continue;
      
      for (let j = 1; j < reels; j++) {
        const symbolAtPosition = grid[i][j];
        
        // If we encounter the same symbol, increment the count
        if (symbolAtPosition === currentSymbol && !isSymbolType(symbolAtPosition, "blank")) {
          adjacentCount++;
        } else {
          // Different symbol encountered, check if we have a win
          if (adjacentCount >= minAdjacent) {
            winningSymbols.add(currentSymbol);
            winCount[currentSymbol] = Math.max(winCount[currentSymbol] || 0, adjacentCount);
          }
          
          // Reset for the new symbol
          currentSymbol = symbolAtPosition;
          adjacentCount = isSymbolType(currentSymbol, "blank") ? 0 : 1;
        }
      }
      
      // Check for win at the end of the row
      if (adjacentCount >= minAdjacent) {
        winningSymbols.add(currentSymbol);
        winCount[currentSymbol] = Math.max(winCount[currentSymbol] || 0, adjacentCount);
      }
    }
    
    return { winningSymbols, winCount };
  };
  
  // Count scatters in the grid
  const countScatters = (grid: string[][]): number => {
    let scatterCount = 0;
    
    for (const row of grid) {
      for (const symbol of row) {
        if (symbol === PRAGMATIC_SYMBOLS.SCATTER.symbol) {
          scatterCount++;
        }
      }
    }
    
    return scatterCount;
  };
  
  // Count wilds in the grid and update the meter
  const processWilds = (grid: string[][]): number => {
    let wildCount = 0;
    
    for (const row of grid) {
      for (const symbol of row) {
        if (symbol === PRAGMATIC_SYMBOLS.WILD.symbol) {
          wildCount++;
        }
      }
    }
    
    return wildCount;
  };
  
  // Calculate win amount based on bet and winning symbols
  const calculateWinAmount = (
    betAmount: number, 
    winCount: Record<string, number>,
    multiplier: number = 1
  ): number => {
    let totalWin = 0;
    
    for (const [symbol, count] of Object.entries(winCount)) {
      const payout = getSymbolByChar(symbol)?.payouts[count] || 0;
      if (payout > 0) {
        totalWin += betAmount * payout;
      }
    }
    
    // Apply multiplier
    return totalWin * multiplier;
  };
  
  // Process a single spin and update game state
  const processSpin = async (isFreeSpinTrigger: boolean = false): Promise<void> => {
    const isFreeSpin = gameState.freeSpinsRemaining > 0 || isFreeSpinTrigger;
    const newGrid = generateRandomGrid(isFreeSpin);
    
    // Check for wins
    const { winningSymbols, winCount } = checkAdjacentWins(newGrid);
    
    // Count scatters
    const scatterCount = countScatters(newGrid);
    
    // Process wilds
    const newWilds = processWilds(newGrid);
    
    // Update wild meter
    let newWildMeter = gameState.wildMeter + newWilds;
    let multiplier = gameState.currentMultiplier;
    
    // Check if wild meter threshold is reached
    if (newWildMeter >= config.pragmaticConfig.wildMeterThreshold) {
      // Get a random multiplier from the configuration
      const randomMultiplierIndex = Math.floor(
        Math.random() * config.pragmaticConfig.wildMeterMultipliers.length
      );
      multiplier = config.pragmaticConfig.wildMeterMultipliers[randomMultiplierIndex];
      
      // Reset meter
      newWildMeter = 0;
      
      toast.success(`Wild meter full! Applied ${multiplier}x multiplier!`);
    }
    
    // Check for free spins trigger
    let newFreeSpins = gameState.freeSpinsRemaining;
    let isNewFreeSpinTriggered = false;
    
    if (scatterCount >= 4 && !isFreeSpin) {
      // New free spins triggered
      newFreeSpins = config.pragmaticConfig.scatterFreeSpin[Math.min(scatterCount, 6) as 4 | 5 | 6];
      isNewFreeSpinTriggered = true;
      toast.success(`${newFreeSpins} free spins triggered!`);
    } else if (scatterCount >= 3 && isFreeSpin) {
      // Free spins retrigger
      newFreeSpins += 5;
      toast.success(`+5 free spins!`);
    }
    
    // Calculate win amount
    const winAmount = calculateWinAmount(betAmount, winCount, multiplier);
    
    // Extract giant symbols if in free spins
    const giantSymbols: GiantSymbolPosition[] = [];
    
    if (isFreeSpin) {
      // Keep existing sticky giants
      const existingSticky = gameState.giantSymbols.filter(g => g.isSticky);
      
      // TODO: Properly detect giant symbols in the grid
      // For now, this is handled in generateRandomGrid
      
      // Combine existing sticky giants with any new giants
      // In a real implementation, we'd need to process the grid and identify giant symbols
    }
    
    // Update game state - FIX: Convert symbol IDs to numbers for winningLines
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      reels: [], // Not used for this game
      winningLines: Array.from(winningSymbols).map(s => {
        // Convert string identifiers to numbers for compliance with type
        const symbolInfo = getSymbolByChar(s);
        // Parse the ID as a number if possible, otherwise use a fallback index
        return symbolInfo ? parseInt(symbolInfo.id) || 0 : 0;
      }),
      totalWin: prev.totalWin + winAmount,
      wildMeter: newWildMeter,
      currentMultiplier: multiplier,
      freeSpinsRemaining: isNewFreeSpinTriggered ? newFreeSpins : prev.freeSpinsRemaining - (isFreeSpin ? 1 : 0),
      giantSymbols,
      cascadeCount: 0,
      isBonus: isFreeSpin || isNewFreeSpinTriggered,
      bonusType: isFreeSpin ? "free_spins" : null,
      bonusData: isFreeSpin ? { spinsRemaining: newFreeSpins } : null,
      isFreeSpin
    }));
    
    // Set game result for UI
    setGameResult({
      betAmount,
      winAmount,
      reels: [], // Not used for this game
      paylines: [], // Not used for this game
      isWin: winAmount > 0
    });
    
    // If there are wins, we would normally cascade here
    if (winningSymbols.size > 0 && config.pragmaticConfig.cascadesEnabled) {
      // In a real implementation, we'd trigger a cascade animation
      // For now, we'll just show a message
      toast.info("Cascade sequence would trigger here");
    }
    
    // In a real implementation, we'd have multiple states and transitions:
    // 1. Initial spin
    // 2. Win detection
    // 3. Cascades (if enabled and there are wins)
    // 4. Free spin triggers
    // 5. Wild meter updates
    
    // For this prototype, we've combined them all into a single update
    
    // Add win to balance if there's a win
    if (winAmount > 0) {
      try {
        await userService.updateBalance(winAmount, TransactionType.WIN, GameType.SLOTS);
        toast.success(`You won ${winAmount} credits!`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update balance");
      }
    }
  };
  
  // Main play function
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
      setSpinning(true);
      
      // If we're in free spins, we don't charge the player
      if (gameState.freeSpinsRemaining <= 0) {
        // Place bet - only for regular spins, not free spins
        await userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS);
      }
      
      // Process the spin
      await processSpin();
      
      // Simulate spinning animation
      setTimeout(() => {
        setSpinning(false);
      }, 1500);
      
    } catch (error) {
      console.error(error);
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
