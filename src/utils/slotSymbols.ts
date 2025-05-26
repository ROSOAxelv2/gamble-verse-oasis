
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

// Treasure of Aztec symbols (legacy)
export const AZTEC_SYMBOLS = {
  LOW_A: "🔹",
  LOW_B: "🔸",
  LOW_C: "🟡",
  LOW_D: "🟢",
  HIGH_A: "🐆",
  HIGH_B: "🦅",
  HIGH_C: "🐍",
  HIGH_D: "🌋",
  WILD: "⭐",
  SCATTER: "🌞",
  BONUS: "🏆",
};

// PG Soft Treasures of Aztec symbols (official)
export const PG_SOFT_AZTEC_SYMBOLS = {
  BLANK: "⬛",
  CARD_10: "🔟",
  CARD_J: "🃋",
  CARD_Q: "🃝",
  CARD_K: "🃞",
  CARD_A: "🃑",
  PRIESTESS: "👸",
  JAGUAR: "🐆",
  AZTEC_IDOL: "🗿",
  GOLDEN_MASK: "👺",
  WILD_RING: "💍",
  TEMPLE_SCATTER: "🏛️",
};

// Jili Super Ace symbols
export const SUPER_ACE_SYMBOLS = {
  ACE_SPADES: "🃁",
  SPADES: "♠️",
  HEARTS: "♥️",
  DIAMONDS: "♦️",
  CLUBS: "♣️",
  KING: "🂮",
  QUEEN: "🂭",
  JACK: "🂫",
  TEN: "🂪",
  NINE: "🂩",
  EIGHT: "🂨",
  SEVEN: "🂧",
  SIX: "🂦",
  FIVE: "🂥",
  CROWN: "👑",
  DIAMOND_GEM: "💎",
  JOKER: "🃏"
};

// Type definitions to avoid TypeScript errors
export type ClassicSymbolsType = typeof CLASSIC_SYMBOLS;
export type AztecSymbolsType = typeof AZTEC_SYMBOLS;
export type PGSoftAztecSymbolsType = typeof PG_SOFT_AZTEC_SYMBOLS;
export type SuperAceSymbolsType = typeof SUPER_ACE_SYMBOLS;
export type SlotSymbolsType = ClassicSymbolsType | AztecSymbolsType | PGSoftAztecSymbolsType | SuperAceSymbolsType;

export const getSymbolsForTheme = (theme: SlotGameTheme): SlotSymbolsType => {
  switch (theme) {
    case SlotGameTheme.TREASURE_OF_AZTEC:
      return AZTEC_SYMBOLS;
    case SlotGameTheme.PRAGMATIC_AZTEC:
      return PG_SOFT_AZTEC_SYMBOLS;
    case SlotGameTheme.WILD_BOUNTY_SHOWDOWN:
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

export const getPGSoftAztecSymbol = (key: keyof PGSoftAztecSymbolsType): string => {
  return PG_SOFT_AZTEC_SYMBOLS[key];
};

export const getSuperAceSymbol = (key: keyof SuperAceSymbolsType): string => {
  return SUPER_ACE_SYMBOLS[key];
};
