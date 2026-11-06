export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot';

export type BotDifficulty = 'casual' | 'tactical' | 'master';

export type BoardTheme = 'classic' | 'royal' | 'neon';

export interface GridCoord {
  r: number; // 0 to 14
  c: number; // 0 to 14
}

export interface Token {
  id: number; // 0..3
  color: PlayerColor;
  step: number; // -1 = in yard, 0 = at start tile, 1..50 = on track, 51..55 = home stretch, 56 = in home
  isHome: boolean;
  inYard: boolean;
}

export interface Player {
  id: PlayerColor;
  name: string;
  type: PlayerType;
  botDifficulty?: BotDifficulty;
  avatar: string;
  tokens: Token[];
  hasWon: boolean;
  rank?: number; // 1, 2, 3, 4
  stats: {
    sixesRolled: number;
    tokensCaptured: number;
    tokensLost: number;
    tokensHome: number;
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  fastMode: boolean;
  theme: BoardTheme;
  autoRollBot: boolean;
  consecutiveSixLimit: boolean; // if true, 3rd six passes turn
}

export type GamePhase = 'MENU' | 'SETUP' | 'PLAYING' | 'VICTORY' | 'RULES';

export interface MoveStep {
  fromCoord: GridCoord;
  toCoord: GridCoord;
}
