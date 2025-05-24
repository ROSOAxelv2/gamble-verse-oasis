export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  role?: AdminRole;
  createdAt: string;
  vipStats?: VipStats;
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  GAME_MODERATOR = 'game_moderator',
}

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageGameConfigs: boolean;
  canViewAuditLogs: boolean;
  canManagePayouts: boolean;
  canModerateBalances: boolean;
  canViewAnalytics: boolean;
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
  CRASH = 'crash',
  TREASURE_OF_AZTEC = 'treasure_of_aztec', // PG Soft attribution
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

export interface CrashGameResult {
  betAmount: number;
  winAmount: number;
  cashoutMultiplier: number;
  crashPoint: number;
  isWin: boolean;
}

// PG Soft Treasure of Aztec specific types
export interface PGSoftTreasureConfig extends GameConfig {
  gameProvider: 'PG_SOFT';
  officialName: 'Treasures of Aztec';
  rtp: 96.71;
  volatility: 'High';
  gridSize: {
    rows: 6;
    reels: 5;
  };
  adjacencyRequirement: 4;
  scatterFreeSpin: {
    4: 7;
    5: 10;
    6: 12;
  };
  cascadesEnabled: true;
  wildMeterThreshold: 10;
  wildMeterMultipliers: number[];
  giantSymbolsEnabled: true;
  sourceUrl: 'https://www.slotstemple.com/us/free-slots/treasures-of-aztec/';
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

export interface CrashConfig extends GameConfig {
  houseEdge: number;
  minCrashPoint: number;
  maxPotentialMultiplier: number;
}

export interface AdminAnalytics {
  totalWagers: number;
  houseEdge: number;
  activePlayers: number;
  gamePopularity: Record<GameType, number>;
}

export interface SystemHealth {
  uptime: number;
  dbConnections: number;
  activeGames: number;
  errorRate: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
