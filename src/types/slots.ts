
import { GameType } from ".";

export enum SlotGameTheme {
  CLASSIC = "classic",
  TREASURE_OF_AZTEC = "treasure-of-aztec",
  WILD_BOUNTY_SHOWDOWN = "wild-bounty-showdown"
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
