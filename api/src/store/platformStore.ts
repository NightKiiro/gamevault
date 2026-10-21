import { Platform, PlatformInput } from "../models/platform";
import { validatePlatformInput } from "../validation/platform";
import { Collection, createCollection } from "./collection";

export type PlatformStore = Collection<Platform>;

export interface PlatformStoreOptions {
  filePath: string | null;
  seed: PlatformInput[];
}

export function createPlatformStore(options: PlatformStoreOptions): PlatformStore {
  return createCollection<Platform>({
    label: "platforms",
    filePath: options.filePath,
    seed: options.seed,
    parseInput: (raw) => {
      const result = validatePlatformInput(raw);
      return result.ok ? result.value : null;
    },
    build: (meta, input) => ({ ...input, ...meta }),
  });
}
