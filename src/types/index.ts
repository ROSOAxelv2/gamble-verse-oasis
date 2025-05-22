
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface GameConfig {
  id: string;
  gameType: GameType;
  minBet: number;
  maxBet: number;
  payoutMultiplier: number;
  enabled: boolean;
}

export enum GameType {
  DICE = 'dice',
  PLINKO = 'plinko',
  SLOTS = 'slots',
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  gameType?: GameType;
  createdAt: string;
  balanceAfter: number;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WIN = 'win',
}

export interface DiceGameResult {
  playerNumber: number;
  actualNumber: number;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
}

export interface PlinkoGameResult {
  betAmount: number;
  winAmount: number;
  path: number[];
  finalBucket: number;
  isWin: boolean;
}

export interface SlotGameResult {
  betAmount: number;
  winAmount: number;
  reels: string[][];
  paylines: number[];
  isWin: boolean;
}

export interface PlinkoConfig extends GameConfig {
  rows: number;
  buckets: PlinkoPayoutBucket[];
}

export interface PlinkoPayoutBucket {
  position: number;
  multiplier: number;
}

export interface SlotsConfig extends GameConfig {
  reels: number;
  symbols: string[];
  paylines: SlotsPayline[];
}

export interface SlotsPayline {
  id: number;
  combination: string[];
  multiplier: number;
}

export interface AdminAnalytics {
  totalWagers: number;
  houseEdge: number;
  activePlayers: number;
  gamePopularity: Record<GameType, number>;
}
