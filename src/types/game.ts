export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
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
  type: 'multiple_choice' | 'true_false';
  explaination: string[];
}

export interface RoundResult {
  correctIndex: number;
  answers: Record<string, number | null>;
  scores: Record<string, number>;
  players: GamePlayer[];
}

export interface GameEndPayload {
  players: GamePlayer[];
}
