
import { PragmaticSymbol } from "../types/slots";

// Symbol placeholders for Pragmatic Aztec clone
export const PRAGMATIC_SYMBOLS: Record<string, PragmaticSymbol> = {
  BLANK: {
    id: "blank",
    name: "Blank",
    symbol: "⬛",
    type: "blank",
    payouts: {},
    weight: 3,
    canBeGiant: false
  },
  A: {
    id: "a",
    name: "Symbol A",
    symbol: "🔴",
    type: "premium",
    payouts: {
      4: 3,
      5: 10,
      6: 25
    },
    weight: 1,
    canBeGiant: true
  },
  B: {
    id: "b",
    name: "Symbol B",
    symbol: "🔵",
    type: "premium",
    payouts: {
      4: 2,
      5: 8,
      6: 20
    },
    weight: 1,
    canBeGiant: true
  },
  C: {
    id: "c",
    name: "Symbol C",
    symbol: "🟡",
    type: "premium",
    payouts: {
      4: 2,
      5: 6,
      6: 15
    },
    weight: 1,
    canBeGiant: true
  },
  D: {
    id: "d",
    name: "Symbol D",
    symbol: "🟢",
    type: "low",
    payouts: {
      4: 1,
      5: 3,
      6: 10
    },
    weight: 2,
    canBeGiant: false
  },
  E: {
    id: "e",
    name: "Symbol E",
    symbol: "🟣",
    type: "low",
    payouts: {
      4: 1,
      5: 3,
      6: 8
    },
    weight: 2,
    canBeGiant: false
  },
  F: {
    id: "f",
    name: "Symbol F",
    symbol: "🟤",
    type: "low",
    payouts: {
      4: 0.5,
      5: 2,
      6: 6
    },
    weight: 2,
    canBeGiant: false
  },
  G: {
    id: "g",
    name: "Symbol G",
    symbol: "⚪",
    type: "low",
    payouts: {
      4: 0.5,
      5: 1.5,
      6: 5
    },
    weight: 2,
    canBeGiant: false
  },
  H: {
    id: "h",
    name: "Symbol H",
    symbol: "🔶",
    type: "low",
    payouts: {
      4: 0.2,
      5: 1,
      6: 4
    },
    weight: 3,
    canBeGiant: false
  },
  WILD: {
    id: "wild",
    name: "Wild Meter Symbol",
    symbol: "⭐",
    type: "wild",
    payouts: {},
    weight: 1,
    canBeGiant: false
  },
  SCATTER: {
    id: "scatter",
    name: "Scatter",
    symbol: "🌞",
    type: "scatter",
    payouts: {},
    weight: 1,
    canBeGiant: false
  }
};

// Default configuration for Pragmatic Aztec clone
export const DEFAULT_PRAGMATIC_CONFIG = {
  gridSize: {
    reels: 6,
    rows: 5
  },
  adjacencyRequirement: 4,
  symbols: Object.values(PRAGMATIC_SYMBOLS),
  wildMeterThreshold: 5,
  wildMeterMultipliers: [2, 3, 4, 5],
  scatterFreeSpin: {
    4: 7,
    5: 10,
    6: 12
  },
  cascadesEnabled: true,
  giantSymbolsEnabled: true,
  giantSymbolSize: {
    width: 2,
    height: 2
  },
  reelStrips: [
    // Simplified reel strips for initial implementation
    // These would need to be tuned for the target RTP
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    }),
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    }),
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    }),
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    }),
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    }),
    Array(20).fill('').map(() => {
      const rand = Math.random();
      if (rand < 0.3) return PRAGMATIC_SYMBOLS.BLANK.symbol;
      else if (rand < 0.4) return PRAGMATIC_SYMBOLS.A.symbol;
      else if (rand < 0.5) return PRAGMATIC_SYMBOLS.B.symbol;
      else if (rand < 0.6) return PRAGMATIC_SYMBOLS.C.symbol;
      else if (rand < 0.7) return PRAGMATIC_SYMBOLS.D.symbol;
      else if (rand < 0.8) return PRAGMATIC_SYMBOLS.E.symbol;
      else if (rand < 0.9) return PRAGMATIC_SYMBOLS.F.symbol;
      else if (rand < 0.95) return PRAGMATIC_SYMBOLS.G.symbol;
      else return PRAGMATIC_SYMBOLS.H.symbol;
    })
  ]
};

// Helper function to get all symbol information by symbol character
export const getSymbolByChar = (symbol: string): PragmaticSymbol | undefined => {
  return Object.values(PRAGMATIC_SYMBOLS).find(s => s.symbol === symbol);
};

// Helper function to check if a symbol is a specific type
export const isSymbolType = (symbol: string, type: PragmaticSymbol['type']): boolean => {
  const symbolInfo = getSymbolByChar(symbol);
  return symbolInfo?.type === type;
};

// Helper function to get payout for a symbol and count
export const getSymbolPayout = (symbol: string, count: number): number => {
  const symbolInfo = getSymbolByChar(symbol);
  if (!symbolInfo || !symbolInfo.payouts[count]) return 0;
  return symbolInfo.payouts[count];
};
