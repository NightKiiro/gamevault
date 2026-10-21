export interface Game {
  id: number;
  title: string;
  platform: string;
  genre: string;
  completed: boolean;
  rating: number;
  releaseYear?: number;
  hoursPlayed?: number;
  createdAt: string;
  updatedAt: string;
}

export type GameInput = Omit<Game, "id" | "createdAt" | "updatedAt">;
export type GamePatch = Partial<GameInput>;
