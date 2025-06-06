
import moneyComingReels from '@/config/moneyComingReels.json';
import moneyComingPaytable from '@/config/moneyComingPaytable.json';
import moneyComingWheel from '@/config/moneyComingWheel.json';
import moneyComingRTPConfig from '@/config/moneyComingRTPConfig.json';

export interface JiliMoneyComingSymbol {
  id: string;
  display: string;
  type: 'number' | 'multiplier' | 'special';
}

export interface JiliSpinResult {
  mainReels: string[][];
  multiplierSymbol: string;
  centerLine: string[];
  isWin: boolean;
  baseWin: number;
  multiplier: number;
  finalWin: number;
  isRespin: boolean;
  isBonusWheel: boolean;
  respinCount: number;
}

export interface BonusWheelResult {
  selectedSegment: number;
  multiplier: number;
  finalWin: number;
  baseWin: number;
}

export interface JiliGameState {
  mainGrid: string[][];
  multiplierReel: string;
  currentBet: number;
  totalWin: number;
  respinCount: number;
  isSpinning: boolean;
  showBonusWheel: boolean;
  lastSpinResult: JiliSpinResult | null;
  bonusWheelResult: BonusWheelResult | null;
}

export class JiliMoneyComingEngine {
  private reelConfig = moneyComingReels;
  private paytable = moneyComingPaytable;
  private wheelConfig = moneyComingWheel;
  private rtpConfig = moneyComingRTPConfig;

  constructor() {
    console.log('Jili Money Coming Engine initialized with RTP target:', this.rtpConfig.targetRTP);
  }

  private getRandomSymbol(reel: 'main' | 'multiplier'): string {
    if (reel === 'main') {
      const symbols = Object.keys(this.reelConfig.symbolWeights);
      const weights = Object.values(this.reelConfig.symbolWeights);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
      let random = Math.random() * totalWeight;
      for (let i = 0; i < symbols.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return symbols[i];
        }
      }
      return symbols[0];
    } else {
      const symbols = Object.keys(this.reelConfig.multiplierWeights);
      const weights = Object.values(this.reelConfig.multiplierWeights);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      
      let random = Math.random() * totalWeight;
      for (let i = 0; i < symbols.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return symbols[i];
        }
      }
      return symbols[0];
    }
  }

  spinMainReels(): string[][] {
    const reels: string[][] = [];
    
    // Generate 3 reels, each with 3 symbols
    for (let reel = 0; reel < 3; reel++) {
      const reelSymbols: string[] = [];
      for (let position = 0; position < 3; position++) {
        reelSymbols.push(this.getRandomSymbol('main'));
      }
      reels.push(reelSymbols);
    }
    
    return reels;
  }

  spinMultiplierReel(): string {
    return this.getRandomSymbol('multiplier');
  }

  checkCenterLineWin(mainReels: string[][]): { isWin: boolean; winningSymbol: string; baseWin: number } {
    // Extract center line (middle row) - positions [1,1,1] from each reel
    const centerLine = [mainReels[0][1], mainReels[1][1], mainReels[2][1]];
    
    // Check if all three symbols match
    const firstSymbol = centerLine[0];
    const isWin = centerLine.every(symbol => symbol === firstSymbol);
    
    if (isWin) {
      const payoutKey = `${firstSymbol}-${firstSymbol}-${firstSymbol}`;
      const baseWin = this.paytable.payouts[payoutKey] || 0;
      return { isWin: true, winningSymbol: firstSymbol, baseWin };
    }
    
    return { isWin: false, winningSymbol: '', baseWin: 0 };
  }

  calculateFinalWin(baseWin: number, multiplierSymbol: string): { finalWin: number; multiplier: number } {
    if (baseWin === 0) {
      return { finalWin: 0, multiplier: 1 };
    }

    if (multiplierSymbol.startsWith('x')) {
      const multiplier = parseInt(multiplierSymbol.substring(1));
      return { finalWin: baseWin * multiplier, multiplier };
    }
    
    return { finalWin: baseWin, multiplier: 1 };
  }

  performSpin(betAmount: number, respinCount: number = 0): JiliSpinResult {
    const mainReels = this.spinMainReels();
    const multiplierSymbol = this.spinMultiplierReel();
    const centerLine = [mainReels[0][1], mainReels[1][1], mainReels[2][1]];
    
    const winCheck = this.checkCenterLineWin(mainReels);
    const { finalWin, multiplier } = this.calculateFinalWin(winCheck.baseWin * betAmount, multiplierSymbol);
    
    const isRespin = winCheck.isWin && multiplierSymbol === 'respin' && respinCount < this.rtpConfig.maxConsecutiveRespins;
    const isBonusWheel = winCheck.isWin && multiplierSymbol === 'bonus_wheel';
    
    return {
      mainReels,
      multiplierSymbol,
      centerLine,
      isWin: winCheck.isWin,
      baseWin: winCheck.baseWin * betAmount,
      multiplier,
      finalWin,
      isRespin,
      isBonusWheel,
      respinCount
    };
  }

  handleRespin(betAmount: number, respinCount: number): JiliSpinResult {
    console.log(`Performing respin ${respinCount + 1}/${this.rtpConfig.maxConsecutiveRespins}`);
    return this.performSpin(betAmount, respinCount + 1);
  }

  launchBonusWheel(baseWin: number): BonusWheelResult {
    const segments = this.wheelConfig.segments;
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    
    let random = Math.random() * totalWeight;
    let selectedSegment = segments[0];
    
    for (const segment of segments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedSegment = segment;
        break;
      }
    }
    
    const finalWin = baseWin * selectedSegment.multiplier;
    
    console.log(`Bonus wheel landed on segment ${selectedSegment.id}: x${selectedSegment.multiplier}`);
    
    return {
      selectedSegment: selectedSegment.id,
      multiplier: selectedSegment.multiplier,
      finalWin,
      baseWin
    };
  }

  getSymbolDisplay(symbolId: string): string {
    const symbolMap: Record<string, string> = {
      '0': '0️⃣',
      '1': '1️⃣',
      '5': '5️⃣',
      '10': '🔟',
      '00': '💰',
      'x2': '✖️2️⃣',
      'x3': '✖️3️⃣',
      'x4': '✖️4️⃣',
      'x5': '✖️5️⃣',
      'x6': '✖️6️⃣',
      'x7': '✖️7️⃣',
      'x8': '✖️8️⃣',
      'x9': '✖️9️⃣',
      'x10': '✖️🔟',
      'respin': '🔄',
      'bonus_wheel': '🎡'
    };
    
    return symbolMap[symbolId] || '❓';
  }

  getGameInfo() {
    return {
      name: 'Money Coming',
      provider: 'Jili',
      reels: 3,
      rows: 3,
      paylines: 1,
      rtp: this.rtpConfig.targetRTP,
      volatility: this.rtpConfig.volatility,
      maxRespins: this.rtpConfig.maxConsecutiveRespins,
      features: ['multiplier_reel', 'respin', 'bonus_wheel']
    };
  }

  getBetLevels() {
    return {
      minimum: 25,
      maximum: 2500,
      increments: [25, 50, 100, 250, 500, 1000, 2500]
    };
  }

  // Testing utilities
  simulateSpins(count: number, betAmount: number): {
    totalSpins: number;
    totalWagered: number;
    totalWon: number;
    rtp: number;
    hitFrequency: number;
    bonusWheelHits: number;
    respinHits: number;
  } {
    let totalWagered = 0;
    let totalWon = 0;
    let wins = 0;
    let bonusWheelHits = 0;
    let respinHits = 0;

    for (let i = 0; i < count; i++) {
      totalWagered += betAmount;
      let spinResult = this.performSpin(betAmount);
      
      if (spinResult.isWin) {
        wins++;
        
        if (spinResult.isBonusWheel) {
          bonusWheelHits++;
          const wheelResult = this.launchBonusWheel(spinResult.baseWin);
          totalWon += wheelResult.finalWin;
        } else if (spinResult.isRespin) {
          respinHits++;
          let respinCount = 0;
          let currentResult = spinResult;
          
          while (currentResult.isRespin && respinCount < this.rtpConfig.maxConsecutiveRespins) {
            currentResult = this.handleRespin(betAmount, respinCount);
            respinCount++;
            
            if (currentResult.isWin && !currentResult.isRespin && !currentResult.isBonusWheel) {
              totalWon += currentResult.finalWin;
            } else if (currentResult.isBonusWheel) {
              const wheelResult = this.launchBonusWheel(currentResult.baseWin);
              totalWon += wheelResult.finalWin;
            }
          }
        } else {
          totalWon += spinResult.finalWin;
        }
      }
    }

    return {
      totalSpins: count,
      totalWagered,
      totalWon,
      rtp: (totalWon / totalWagered) * 100,
      hitFrequency: wins / count,
      bonusWheelHits,
      respinHits
    };
  }
}
