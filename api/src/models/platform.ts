export interface Platform {
  id: number;
  name: string;
  manufacturer?: string;
  releaseYear?: number;
  createdAt: string;
  updatedAt: string;
}

export type PlatformInput = Omit<Platform, "id" | "createdAt" | "updatedAt">;

export type PlatformPatch = Partial<PlatformInput>;

export interface PlatformView extends Platform {
  gameCount: number;
}
