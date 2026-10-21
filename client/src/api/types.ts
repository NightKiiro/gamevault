export interface Game {
  id: number;
  title: string;
  platform: string;
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

export type GameInput = Omit<Game, "id" | "createdAt" | "updatedAt">;
export type GamePatch = Partial<GameInput>;

export interface CoverCandidate {
  appId: number;
  name: string;
  coverUrl: string;
  backdropUrl: string;
  thumbUrl: string;
}
