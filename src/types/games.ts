
export interface GameFeatures {
  mobileCurrencyBar?: boolean;
  exitConfirmation?: boolean;
  autoPlay?: boolean;
  turboMode?: boolean;
  bonusRounds?: boolean;
  progressiveFeatures?: boolean;
  goldenFeatures?: boolean;
  respinFeature?: boolean;
}

export interface GameConfig {
  id: string;
  name: string;
  iconUrl: string;
  route?: string; // Made optional since it's not in games.json
  description: string;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: string;
  category: string;
  features?: GameFeatures;
  status?: string;
}

export interface GamesConfig {
  games: GameConfig[];
}
