export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  words: string[];
  isCustom?: boolean;
}

export interface Player {
  id: number;
  name: string;
  isImposter: boolean;
  roleTitle: 'Civilian' | 'Imposter';
  word: string;
}

export type GameStage = 'SETUP' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'LAST_CHANCE' | 'RESULT';

export interface GameState {
  stage: GameStage;
  players: Player[];
  currentTurnIndex: number;
  category: Category | null;
  categories?: Category[];
  secretWord: string;
  imposterWordHint: string;
  firstSpeakerIndex: number;
  eliminatedPlayerId?: number;
  imposterWon?: boolean;
  imposterGuessedWord?: string;
  distractorWords?: string[];
}
