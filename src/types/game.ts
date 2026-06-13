export interface Bonuses {
  fiftyFifty: number;
  doublePoints: number;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  profileImage?: string;
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  profileImage?: string;
  bonuses: Bonuses;
}

export interface Player {
  id: string;
  score: number;
  [key: string]: any;
}

export interface QuestionPayload {
  index: number;
  total: number;
  question: string;
  options: string[];
  category: string;
  image: string;
  type: 'multiple_choice' | 'true_false' | 'numeric';
  explaination: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface RoundResult {
  correctIndex: number;
  answers: Record<string, number | null>;
  scores: Record<string, number>;
  players: GamePlayer[];
  usedBonuses?: Record<string, { fiftyFifty?: boolean; doublePoints?: boolean }>;
}

export interface GameEndPayload {
  players: GamePlayer[];
}
