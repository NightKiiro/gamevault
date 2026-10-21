import { Game, GameInput } from "../models/game";
import { validateGameInput } from "../validation/game";
import { Collection, createCollection } from "./collection";

export type GameStore = Collection<Game>;

export interface GameStoreOptions {
  filePath: string | null;
  seed: GameInput[];
}

export function createGameStore(options: GameStoreOptions): GameStore {
  return createCollection<Game>({
    label: "games",
    filePath: options.filePath,
    seed: options.seed,
    parseInput: (raw) => {
      const result = validateGameInput(raw);
      return result.ok ? result.value : null;
    },
    build: (meta, input) => ({ ...input, ...meta }),
  });
}
