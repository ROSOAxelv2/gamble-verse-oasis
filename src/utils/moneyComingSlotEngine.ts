
import moneyComingConfig from '@/config/money-coming-config.json';

export interface MoneyComingSymbol {
  id: string;
  name: string;
  emoji: string;
  payout?: number[];
  substitutes?: string;
  feature?: string;
}

export interface MoneyComingGameState {
  reels: string[][];
  isSpinning: boolean;
  winningLines: WinningLine[];
  freeSpinsRemaining: number;
  isFreeSpin: boolean;
  bonusActive: boolean;
  bonusRound: number;
  totalWin: number;
  multiplier: number;
  jackpotTriggered: boolean;
  wildPositions: { reel: number; row: number }[];
  scatterCount: number;
  currentBet: number;
}

export interface WinningLine {
  line: number;
  symbols: string;
  positions: { reel: number; row: number }[];
  multiplier: number;
  payout: number;
}

export interface MoneyComingResult {
  reels: string[][];
  wins: WinningLine[];
  totalWin: number;
  freeSpinsAwarded: number;
  bonusTriggered: boolean;
  jackpotWon: boolean;
  newBalance: number;
}

export class MoneyComingSlotEngine {
  private config = moneyComingConfig;
  private allSymbols: MoneyComingSymbol[];
  private paylines: number[][];

  constructor() {
    this.allSymbols = [
      ...this.config.symbols.high,
      ...this.config.symbols.medium,
      ...this.config.symbols.low,
      ...this.config.symbols.special
    ] as MoneyComingSymbol[];
    
    // Define standard 25 paylines for 5x3 grid
    this.paylines = this.generatePaylines();
  }

  private generatePaylines(): number[][] {
    // Standard 25 paylines for 5x3 slot (simplified for demo)
    return [
      [1, 1, 1, 1, 1], // Line 1: Middle row
      [0, 0, 0, 0, 0], // Line 2: Top row
      [2, 2, 2, 2, 2], // Line 3: Bottom row
      [0, 1, 2, 1, 0], // Line 4: V shape
      [2, 1, 0, 1, 2], // Line 5: Inverted V
      [1, 0, 0, 0, 1], // Line 6: Top middle
      [1, 2, 2, 2, 1], // Line 7: Bottom middle
      [0, 0, 1, 2, 2], // Line 8: Ascending
      [2, 2, 1, 0, 0], // Line 9: Descending
      [1, 2, 1, 0, 1], // Line 10: Zigzag
      [1, 0, 1, 2, 1], // Line 11: Inverted zigzag
      [0, 1, 1, 1, 0], // Line 12: Mountain
      [2, 1, 1, 1, 2], // Line 13: Valley
      [0, 0, 2, 0, 0], // Line 14: Bottom spike
      [2, 2, 0, 2, 2], // Line 15: Top spike
      [1, 1, 0, 1, 1], // Line 16: Top dip
      [1, 1, 2, 1, 1], // Line 17: Bottom dip
      [0, 1, 0, 1, 0], // Line 18: Alternating top
      [2, 1, 2, 1, 2], // Line 19: Alternating bottom
      [1, 0, 2, 0, 2], // Line 20: Complex zigzag
      [1, 2, 0, 2, 0], // Line 21: Complex inverted
      [0, 2, 2, 1, 1], // Line 22: Stepped up
      [2, 0, 0, 1, 1], // Line 23: Stepped down
      [0, 1, 2, 2, 1], // Line 24: Wave up
      [2, 1, 0, 0, 1]  // Line 25: Wave down
    ];
  }

  generateReels(): string[][] {
    const reels: string[][] = [];
    
    for (let reel = 0; reel < this.config.gameInfo.reels; reel++) {
      const reelSymbols: string[] = [];
      
      for (let row = 0; row < this.config.gameInfo.rows; row++) {
        // Weight the symbol selection based on type
        const symbolWeights = {
          high: 0.15,
          medium: 0.25,
          low: 0.45,
          special: 0.15
        };
        
        const rand = Math.random();
        let symbolType: keyof typeof symbolWeights;
        
        if (rand < symbolWeights.special) {
          symbolType = 'special';
        } else if (rand < symbolWeights.special + symbolWeights.high) {
          symbolType = 'high';
        } else if (rand < symbolWeights.special + symbolWeights.high + symbolWeights.medium) {
          symbolType = 'medium';
        } else {
          symbolType = 'low';
        }
        
        const symbolsOfType = this.config.symbols[symbolType];
        const randomSymbol = symbolsOfType[Math.floor(Math.random() * symbolsOfType.length)];
        reelSymbols.push(randomSymbol.id);
      }
      
      reels.push(reelSymbols);
    }
    
    return reels;
  }

  calculateWins(reels: string[][], betAmount: number, isFreeSpin: boolean = false): {
    wins: WinningLine[];
    totalWin: number;
    scatterCount: number;
  } {
    const wins: WinningLine[] = [];
    let totalWin = 0;
    let scatterCount = 0;

    // Count scatters across all reels
    reels.forEach(reel => {
      reel.forEach(symbol => {
        if (symbol === 'scatter') scatterCount++;
      });
    });

    // Check each payline
    this.paylines.forEach((payline, lineIndex) => {
      const lineSymbols: string[] = [];
      const positions: { reel: number; row: number }[] = [];

      // Get symbols on this payline
      payline.forEach((row, reel) => {
        const symbol = reels[reel][row];
        lineSymbols.push(symbol);
        positions.push({ reel, row });
      });

      // Check for winning combinations
      const winResult = this.checkLineWin(lineSymbols, positions, betAmount, isFreeSpin);
      if (winResult) {
        wins.push({
          line: lineIndex + 1,
          symbols: winResult.symbol,
          positions: winResult.positions,
          multiplier: winResult.multiplier,
          payout: winResult.payout
        });
        totalWin += winResult.payout;
      }
    });

    return { wins, totalWin, scatterCount };
  }

  private checkLineWin(
    symbols: string[], 
    positions: { reel: number; row: number }[], 
    betAmount: number, 
    isFreeSpin: boolean
  ): { symbol: string; positions: { reel: number; row: number }[]; multiplier: number; payout: number } | null {
    // Check for consecutive matching symbols from left to right
    let consecutiveCount = 1;
    let winSymbol = symbols[0];
    let winPositions = [positions[0]];

    // Handle wild substitution
    if (winSymbol === 'wild') {
      // Find first non-wild symbol
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] !== 'wild' && symbols[i] !== 'scatter') {
          winSymbol = symbols[i];
          break;
        }
      }
    }

    // Count consecutive symbols (including wilds)
    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = symbols[i];
      
      if (currentSymbol === winSymbol || currentSymbol === 'wild') {
        consecutiveCount++;
        winPositions.push(positions[i]);
      } else {
        break;
      }
    }

    // Check if we have a winning combination (minimum 3 symbols)
    if (consecutiveCount >= 3) {
      const symbolData = this.allSymbols.find(s => s.id === winSymbol);
      if (symbolData && symbolData.payout) {
        const basePayout = symbolData.payout[consecutiveCount - 1] || 0;
        const lineMultiplier = isFreeSpin ? this.config.features.freeSpins.multiplier : 1;
        const totalPayout = (basePayout * betAmount / this.config.paylines) * lineMultiplier;

        return {
          symbol: winSymbol,
          positions: winPositions.slice(0, consecutiveCount),
          multiplier: lineMultiplier,
          payout: totalPayout
        };
      }
    }

    return null;
  }

  checkBonusFeatures(reels: string[][], scatterCount: number): {
    freeSpinsAwarded: number;
    bonusTriggered: boolean;
    jackpotWon: boolean;
  } {
    let freeSpinsAwarded = 0;
    let bonusTriggered = false;
    let jackpotWon = false;

    // Check free spins trigger (3+ scatters)
    if (scatterCount >= 3) {
      const freeSpinAwards = this.config.features.freeSpins.awards as Record<string, number>;
      freeSpinsAwarded = freeSpinAwards[scatterCount.toString()] || 0;
    }

    // Check bonus game trigger (3+ bonus symbols)
    let bonusCount = 0;
    reels.forEach(reel => {
      reel.forEach(symbol => {
        if (symbol === 'bonus') bonusCount++;
      });
    });

    if (bonusCount >= 3) {
      bonusTriggered = true;
    }

    // Check jackpot (5 money bags on a payline)
    const jackpotTrigger = this.config.features.jackpot.trigger;
    if (jackpotTrigger === '5_money_bags') {
      // Check if any payline has 5 money bags
      for (const payline of this.paylines) {
        const lineSymbols = payline.map((row, reel) => reels[reel][row]);
        if (lineSymbols.every(symbol => symbol === 'money_bag' || symbol === 'wild')) {
          jackpotWon = true;
          break;
        }
      }
    }

    return { freeSpinsAwarded, bonusTriggered, jackpotWon };
  }

  simulateBonusGame(): number {
    const prizes = this.config.features.bonusGame.prizes;
    const multipliers = this.config.features.bonusGame.multipliers;
    
    // Simple bonus simulation - player picks 3 items
    let totalBonus = 0;
    for (let i = 0; i < 3; i++) {
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      totalBonus += prize * multiplier;
    }
    
    return totalBonus;
  }

  getSymbolByID(id: string): MoneyComingSymbol | undefined {
    return this.allSymbols.find(symbol => symbol.id === id);
  }

  getGameInfo() {
    return this.config.gameInfo;
  }

  getBetLevels() {
    return this.config.betLevels;
  }
}
