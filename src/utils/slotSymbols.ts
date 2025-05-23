
import { SlotGameTheme } from "../types/slots";

// Slot machine symbols for classic theme
export const CLASSIC_SYMBOLS = {
  CHERRY: "🍒",
  LEMON: "🍋",
  ORANGE: "🍊",
  PLUM: "🍇",
  BELL: "🔔",
  BAR: "7️⃣",
  SEVEN: "💰",
};

// Treasure of Aztec symbols
export const AZTEC_SYMBOLS = {
  LOW_A: "🔹", // Low value symbols
  LOW_B: "🔸",
  LOW_C: "🟡",
  LOW_D: "🟢",
  HIGH_A: "🐆", // High value symbols
  HIGH_B: "🦅",
  HIGH_C: "🐍",
  HIGH_D: "🌋",
  WILD: "⭐", // Special symbols
  SCATTER: "🌞",
  BONUS: "🏆",
};

// Type definitions to avoid TypeScript errors
export type ClassicSymbolsType = typeof CLASSIC_SYMBOLS;
export type AztecSymbolsType = typeof AZTEC_SYMBOLS;
export type SlotSymbolsType = ClassicSymbolsType | AztecSymbolsType;

export const getSymbolsForTheme = (theme: SlotGameTheme): SlotSymbolsType => {
  switch (theme) {
    case SlotGameTheme.TREASURE_OF_AZTEC:
      return AZTEC_SYMBOLS;
    case SlotGameTheme.WILD_BOUNTY_SHOWDOWN:
      // Placeholder for future game
      return CLASSIC_SYMBOLS;
    default:
      return CLASSIC_SYMBOLS;
  }
};

// Helper functions to safely get symbols based on the theme
export const getAztecSymbol = (key: keyof AztecSymbolsType): string => {
  return AZTEC_SYMBOLS[key];
};

export const getClassicSymbol = (key: keyof ClassicSymbolsType): string => {
  return CLASSIC_SYMBOLS[key];
};
