
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
  vipStats?: VipStats;
}

export interface VipStats {
  level: VipLevel;
  lifetimeWagered: number;
  currentPoints: number;
  nextLevelAt: number;
  badges: UserBadge[];
}

export enum VipLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: string;
}

export interface VipProgramConfig {
  id: string;
  levelThresholds: Record<VipLevel, number>;
  levelBenefits: Record<VipLevel, VipBenefits>;
  enabled: boolean;
}

export interface VipBenefits {
  dailyFreeSpin: number;
  cashbackPercent: number;
  badges: string[];
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
  REWARD = 'reward',
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
