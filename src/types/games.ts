
export interface GameConfig {
  id: string;
  name: string;
  iconUrl: string;
  route: string;
  description: string;
  minBet: number;
  maxBet: number;
  category: 'classic' | 'arcade' | 'slots' | 'multiplier';
}

export interface GamesConfig {
  games: GameConfig[];
}
