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

export type GameInput = Omit<Game, "id" | "createdAt" | "updatedAt">;
export type GamePatch = Partial<GameInput>;

export interface Platform {
  id: number;
  name: string;
  manufacturer?: string;
  releaseYear?: number;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
}

export type PlatformInput = Omit<Platform, "id" | "gameCount" | "createdAt" | "updatedAt">;

export interface CoverCandidate {
  appId: number;
  name: string;
  coverUrl: string;
  backdropUrl: string;
  thumbUrl: string;
}
