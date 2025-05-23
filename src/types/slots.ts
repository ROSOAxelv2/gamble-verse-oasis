
import { GameType } from ".";

export enum SlotGameTheme {
  CLASSIC = "classic",
  TREASURE_OF_AZTEC = "treasure-of-aztec",
  WILD_BOUNTY_SHOWDOWN = "wild-bounty-showdown",
  PRAGMATIC_AZTEC = "pragmatic-aztec"
}

export interface SlotGameConfig {
  id: string;
  name: string;
  theme: SlotGameTheme;
  reels: number;
  rows: number;
  paylines: SlotPayline[];
  symbols: SlotSymbol[];
  rtp: number;
  volatility: "low" | "medium" | "high";
  minBet: number;
  maxBet: number;
  features: SlotFeature[];
  enabled: boolean;
}

export interface SlotSymbol {
  id: string;
  name: string;
  symbol: string;
  type: "regular" | "premium" | "wild" | "scatter";
  multipliers: {
    [count: number]: number;
  };
  weight: number;
}

export interface SlotPayline {
  id: number;
  positions: number[][]; // Array of [row, col] positions that make up the payline
  multiplier: number;
}

export interface SlotFeature {
  id: string;
  name: string;
  type: "free_spins" | "bonus_game" | "multiplier" | "wild_collection" | "bounty" | "wheel";
  config: Record<string, any>;
}

export interface SlotGameState {
  reels: string[][];
  winningLines: number[];
  totalWin: number;
  isBonus: boolean;
  bonusType: string | null;
  bonusData: Record<string, any> | null;
}

export interface SlotMachineProps {
  gameTheme?: SlotGameTheme;
}

// Pragmatic Aztec specific types
export interface PragmaticAztecConfig {
  gridSize: {
    reels: number;
    rows: number;
  };
  adjacencyRequirement: number;
  symbols: PragmaticSymbol[];
  wildMeterThreshold: number;
  wildMeterMultipliers: number[];
  scatterFreeSpin: Record<number, number>;
  cascadesEnabled: boolean;
  giantSymbolsEnabled: boolean;
  giantSymbolSize: {
    width: number;
    height: number;
  };
  reelStrips: string[][];
}

export interface PragmaticSymbol {
  id: string;
  name: string;
  symbol: string;
  type: "blank" | "low" | "premium" | "wild" | "scatter";
  payouts: {
    [adjacent: number]: number;
  };
  weight: number;
  canBeGiant: boolean;
}

export interface PragmaticGameState extends SlotGameState {
  grid: string[][];
  wildMeter: number;
  currentMultiplier: number;
  freeSpinsRemaining: number;
  giantSymbols: GiantSymbolPosition[];
  cascadeCount: number;
  isFreeSpin: boolean;
}

export interface GiantSymbolPosition {
  symbol: string;
  startRow: number;
  startCol: number;
  width: number;
  height: number;
  isSticky: boolean;
}
