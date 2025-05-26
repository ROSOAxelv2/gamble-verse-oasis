import { PragmaticGameState, GiantSymbolPosition } from "../types/slots";

export interface SlotEngineConfig {
  reels: number;
  rows: number;
  adjacencyRequirement: number;
  maxCascades: number;
  wildMeterThreshold: number;
  symbols: Record<string, SymbolConfig>;
  reelStrips: {
    baseGame: string[][];
    freeSpins: string[][];
  };
}

export interface SymbolConfig {
  id: string;
  symbol: string;
  type: "blank" | "low" | "premium" | "wild" | "scatter";
  payouts: Record<number, number>;
  weight: number;
  canBeGiant: boolean;
  giantWeight?: number;
  fillsWildMeter?: boolean;
  triggersFreeSpin?: boolean;
  substitutes?: string[];
}

export interface SpinResult {
  grid: string[][];
  giantSymbols: GiantSymbolPosition[];
  wins: WinResult[];
  cascades: CascadeResult[];
  wildMeterIncrease: number;
  scatterCount: number;
  totalPayout: number;
}

export interface WinResult {
  symbol: string;
  positions: [number, number][];
  payout: number;
  adjacentCount: number;
}

export interface CascadeResult {
  cascadeNumber: number;
  removedPositions: [number, number][];
  newGrid: string[][];
  wins: WinResult[];
  wildMeterIncrease: number;
}

export class PGSoftSlotEngine {
  private config: SlotEngineConfig;
  private rng: () => number;

  constructor(config: SlotEngineConfig, rng: () => number = Math.random) {
    this.config = config;
    this.rng = rng;
  }

  /**
   * Main spin function following PG Soft's exact mechanics
   */
  spin(isFreeSpin: boolean = false): SpinResult {
    const grid = this.generateInitialGrid(isFreeSpin);
    const giantSymbols = isFreeSpin ? this.generateGiantSymbols(grid) : [];
    
    // Apply giant symbols to grid
    this.applyGiantSymbolsToGrid(grid, giantSymbols);
    
    const result: SpinResult = {
      grid: this.cloneGrid(grid),
      giantSymbols,
      wins: [],
      cascades: [],
      wildMeterIncrease: 0,
      scatterCount: 0,
      totalPayout: 0
    };

    // Initial win check
    const initialWins = this.checkAdjacencyWins(grid);
    const initialWildMeter = this.countWildMeterSymbols(grid);
    const scatterCount = this.countScatters(grid);

    result.wins = initialWins;
    result.wildMeterIncrease += initialWildMeter;
    result.scatterCount = scatterCount;
    result.totalPayout += this.calculateWinPayout(initialWins);

    // Process cascades if there are wins
    if (initialWins.length > 0) {
      result.cascades = this.processCascades(grid, giantSymbols, isFreeSpin);
      
      // Add cascade payouts and wild meter increases
      result.cascades.forEach(cascade => {
        result.totalPayout += this.calculateWinPayout(cascade.wins);
        result.wildMeterIncrease += cascade.wildMeterIncrease;
      });
    }

    return result;
  }

  /**
   * Generate initial 6x5 grid with proper symbol distribution
   */
  private generateInitialGrid(isFreeSpin: boolean): string[][] {
    const strips = isFreeSpin ? this.config.reelStrips.freeSpins : this.config.reelStrips.baseGame;
    const grid: string[][] = [];

    for (let reel = 0; reel < this.config.reels; reel++) {
      const reelStrip = strips[reel];
      const column: string[] = [];
      
      for (let row = 0; row < this.config.rows; row++) {
        const randomIndex = Math.floor(this.rng() * reelStrip.length);
        column.push(reelStrip[randomIndex]);
      }
      
      grid.push(column);
    }

    return grid;
  }

  /**
   * Generate 2x2 giant symbols during free spins
   */
  private generateGiantSymbols(grid: string[][]): GiantSymbolPosition[] {
    const giantSymbols: GiantSymbolPosition[] = [];
    const premiumSymbols = Object.values(this.config.symbols)
      .filter(s => s.canBeGiant)
      .map(s => s.symbol);

    // Try to place giant symbols on reels 1-4 (positions 0-3)
    for (let reel = 0; reel < this.config.reels - 1; reel++) {
      for (let row = 0; row < this.config.rows - 1; row++) {
        if (this.rng() < 0.15) { // 15% chance for giant symbol
          const symbolsInArea = [
            grid[reel][row],
            grid[reel + 1][row],
            grid[reel][row + 1],
            grid[reel + 1][row + 1]
          ];

          // Check if any symbol in this 2x2 area can be giant
          const giantableSymbol = symbolsInArea.find(s => premiumSymbols.includes(s));
          
          if (giantableSymbol) {
            giantSymbols.push({
              symbol: giantableSymbol,
              startRow: row,
              startCol: reel,
              width: 2,
              height: 2,
              isSticky: true
            });

            // Skip the next position to avoid overlap
            reel++;
            break;
          }
        }
      }
    }

    return giantSymbols;
  }

  /**
   * Apply giant symbols to the grid
   */
  private applyGiantSymbolsToGrid(grid: string[][], giantSymbols: GiantSymbolPosition[]): void {
    giantSymbols.forEach(giant => {
      for (let r = giant.startRow; r < giant.startRow + giant.height; r++) {
        for (let c = giant.startCol; c < giant.startCol + giant.width; c++) {
          if (r < this.config.rows && c < this.config.reels) {
            grid[c][r] = giant.symbol;
          }
        }
      }
    });
  }

  /**
   * Check for adjacency wins (4+ consecutive reels from left to right)
   */
  checkAdjacencyWins(grid: string[][]): WinResult[] {
    const wins: WinResult[] = [];
    const symbolGroups = new Map<string, [number, number][]>();

    // Group adjacent symbols by type
    for (let row = 0; row < this.config.rows; row++) {
      let currentSymbol = "";
      let currentPositions: [number, number][] = [];

      for (let reel = 0; reel < this.config.reels; reel++) {
        const symbol = grid[reel][row];
        
        // Blank symbols break adjacency
        if (symbol === "⬛") {
          if (currentPositions.length >= this.config.adjacencyRequirement) {
            if (!symbolGroups.has(currentSymbol)) {
              symbolGroups.set(currentSymbol, []);
            }
            symbolGroups.get(currentSymbol)!.push(...currentPositions);
          }
          currentSymbol = "";
          currentPositions = [];
          continue;
        }

        // Check if symbol continues the current sequence or starts a new one
        if (symbol === currentSymbol || this.canSubstitute(symbol, currentSymbol)) {
          currentPositions.push([reel, row]);
        } else {
          // End current sequence if it meets minimum requirement
          if (currentPositions.length >= this.config.adjacencyRequirement) {
            if (!symbolGroups.has(currentSymbol)) {
              symbolGroups.set(currentSymbol, []);
            }
            symbolGroups.get(currentSymbol)!.push(...currentPositions);
          }
          
          // Start new sequence
          currentSymbol = symbol;
          currentPositions = [[reel, row]];
        }
      }

      // Check final sequence
      if (currentPositions.length >= this.config.adjacencyRequirement) {
        if (!symbolGroups.has(currentSymbol)) {
          symbolGroups.set(currentSymbol, []);
        }
        symbolGroups.get(currentSymbol)!.push(...currentPositions);
      }
    }

    // Convert to win results
    symbolGroups.forEach((positions, symbol) => {
      if (positions.length >= this.config.adjacencyRequirement) {
        const payout = this.getSymbolPayout(symbol, positions.length);
        wins.push({
          symbol,
          positions,
          payout,
          adjacentCount: positions.length
        });
      }
    });

    return wins;
  }

  /**
   * Process cascading wins
   */
  private processCascades(
    grid: string[][], 
    giantSymbols: GiantSymbolPosition[], 
    isFreeSpin: boolean
  ): CascadeResult[] {
    const cascades: CascadeResult[] = [];
    let cascadeCount = 0;

    while (cascadeCount < this.config.maxCascades) {
      const wins = this.checkAdjacencyWins(grid);
      if (wins.length === 0) break;

      cascadeCount++;
      
      // Remove winning symbols (but keep sticky giants during free spins)
      const removedPositions = this.removeWinningSymbols(grid, wins, giantSymbols, isFreeSpin);
      
      // Apply gravity and fill empty spaces
      this.applyGravity(grid);
      this.fillEmptySpaces(grid, isFreeSpin);
      
      // Reapply giant symbols if they're sticky
      if (isFreeSpin) {
        this.applyGiantSymbolsToGrid(grid, giantSymbols);
      }

      const wildMeterIncrease = this.countWildMeterSymbols(grid);

      cascades.push({
        cascadeNumber: cascadeCount,
        removedPositions,
        newGrid: this.cloneGrid(grid),
        wins,
        wildMeterIncrease
      });
    }

    return cascades;
  }

  /**
   * Remove winning symbols from grid
   */
  private removeWinningSymbols(
    grid: string[][], 
    wins: WinResult[], 
    giantSymbols: GiantSymbolPosition[], 
    isFreeSpin: boolean
  ): [number, number][] {
    const removedPositions: [number, number][] = [];
    
    wins.forEach(win => {
      win.positions.forEach(([reel, row]) => {
        // Don't remove if it's part of a sticky giant symbol during free spins
        if (isFreeSpin && this.isPartOfStickyGiant(reel, row, giantSymbols)) {
          return;
        }
        
        grid[reel][row] = ""; // Mark for removal
        removedPositions.push([reel, row]);
      });
    });

    return removedPositions;
  }

  /**
   * Check if position is part of a sticky giant symbol
   */
  private isPartOfStickyGiant(reel: number, row: number, giantSymbols: GiantSymbolPosition[]): boolean {
    return giantSymbols.some(giant => 
      giant.isSticky &&
      reel >= giant.startCol && reel < giant.startCol + giant.width &&
      row >= giant.startRow && row < giant.startRow + giant.height
    );
  }

  /**
   * Apply gravity to make symbols fall down
   */
  private applyGravity(grid: string[][]): void {
    for (let reel = 0; reel < this.config.reels; reel++) {
      const column = grid[reel].filter(symbol => symbol !== "");
      const emptySpaces = this.config.rows - column.length;
      
      grid[reel] = [...Array(emptySpaces).fill(""), ...column];
    }
  }

  /**
   * Fill empty spaces with new symbols
   */
  private fillEmptySpaces(grid: string[][], isFreeSpin: boolean): void {
    const strips = isFreeSpin ? this.config.reelStrips.freeSpins : this.config.reelStrips.baseGame;
    
    for (let reel = 0; reel < this.config.reels; reel++) {
      for (let row = 0; row < this.config.rows; row++) {
        if (grid[reel][row] === "") {
          const reelStrip = strips[reel];
          const randomIndex = Math.floor(this.rng() * reelStrip.length);
          grid[reel][row] = reelStrip[randomIndex];
        }
      }
    }
  }

  /**
   * Count wild symbols for meter filling
   */
  private countWildMeterSymbols(grid: string[][]): number {
    let count = 0;
    for (let reel = 0; reel < this.config.reels; reel++) {
      for (let row = 0; row < this.config.rows; row++) {
        const symbol = grid[reel][row];
        const symbolConfig = Object.values(this.config.symbols).find(s => s.symbol === symbol);
        if (symbolConfig?.fillsWildMeter) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Count scatter symbols
   */
  private countScatters(grid: string[][]): number {
    let count = 0;
    for (let reel = 0; reel < this.config.reels; reel++) {
      for (let row = 0; row < this.config.rows; row++) {
        const symbol = grid[reel][row];
        const symbolConfig = Object.values(this.config.symbols).find(s => s.symbol === symbol);
        if (symbolConfig?.type === "scatter") {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Check if one symbol can substitute for another
   */
  private canSubstitute(symbol1: string, symbol2: string): boolean {
    const wildConfig = Object.values(this.config.symbols).find(s => s.type === "wild");
    if (!wildConfig) return false;

    return (
      (symbol1 === wildConfig.symbol && wildConfig.substitutes?.includes(this.getSymbolId(symbol2))) ||
      (symbol2 === wildConfig.symbol && wildConfig.substitutes?.includes(this.getSymbolId(symbol1)))
    );
  }

  /**
   * Get symbol ID from symbol character
   */
  private getSymbolId(symbol: string): string {
    const symbolConfig = Object.values(this.config.symbols).find(s => s.symbol === symbol);
    return symbolConfig?.id || "";
  }

  /**
   * Get payout for symbol and count
   */
  private getSymbolPayout(symbol: string, count: number): number {
    const symbolConfig = Object.values(this.config.symbols).find(s => s.symbol === symbol);
    return symbolConfig?.payouts[count] || 0;
  }

  /**
   * Calculate total payout for wins
   */
  private calculateWinPayout(wins: WinResult[]): number {
    return wins.reduce((total, win) => total + win.payout, 0);
  }

  /**
   * Clone grid for immutability
   */
  private cloneGrid(grid: string[][]): string[][] {
    return grid.map(column => [...column]);
  }
}
