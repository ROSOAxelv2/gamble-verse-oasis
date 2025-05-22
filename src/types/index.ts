
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
