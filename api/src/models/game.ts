export const RATING_MIN = 0;
export const RATING_MAX = 10;

export interface Game {
  id: number;
  title: string;
  platform: string;
  platformId?: number;
  genre: string;
  completed: boolean;
  rating: number;
  releaseYear?: number;
  hoursPlayed?: number;
  coverUrl?: string;
  backdropUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServerManagedField = "id" | "createdAt" | "updatedAt";

export type GameInput = Omit<Game, ServerManagedField>;

export type GamePatch = Partial<GameInput>;
