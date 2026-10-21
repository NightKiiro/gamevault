import fs from "node:fs";
import path from "node:path";
import { Game, GameInput, GamePatch } from "../models/game";
import { isRecord } from "../validation/result";
import { validateGameInput } from "../validation/game";

export interface GameStore {
  list(): Game[];
  get(id: number): Game | undefined;
  create(input: GameInput): Game;
  update(id: number, patch: GamePatch): Game | undefined;
  replace(id: number, input: GameInput): Game | undefined;
  remove(id: number): boolean;
}

export interface GameStoreOptions {
  filePath: string | null;
  seed: GameInput[];
}

interface Snapshot {
  nextId: number;
  games: Game[];
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function parseStoredGame(raw: unknown): Game | null {
  if (!isRecord(raw)) return null;
  const { id, createdAt, updatedAt } = raw;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) return null;
  if (!isIsoDate(createdAt) || !isIsoDate(updatedAt)) return null;
  const result = validateGameInput(raw);
  if (!result.ok) return null;
  return { id, ...result.value, createdAt, updatedAt };
}

function parseSnapshot(raw: unknown): Snapshot | null {
  if (!isRecord(raw) || !Array.isArray(raw.games)) return null;
  const games: Game[] = [];
  for (const item of raw.games) {
    const game = parseStoredGame(item);
    if (game === null) {
      console.warn("[store] jeu invalide ignoré :", JSON.stringify(item));
      continue;
    }
    games.push(game);
  }
  const maxId = games.reduce((max, g) => Math.max(max, g.id), 0);
  const storedNextId = typeof raw.nextId === "number" && Number.isInteger(raw.nextId) ? raw.nextId : 0;
  return { nextId: Math.max(storedNextId, maxId + 1), games };
}

function readSnapshot(filePath: string): Snapshot | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return parseSnapshot(parsed);
  } catch (err) {
    const backup = `${filePath}.corrupt-${Date.now()}`;
    console.error(`[store] ${filePath} illisible, sauvegardé dans ${backup}, on repart du seed :`, err);
    fs.renameSync(filePath, backup);
    return null;
  }
}

function writeSnapshot(filePath: string, snapshot: Snapshot): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
}

export function createGameStore(options: GameStoreOptions): GameStore {
  const { filePath } = options;
  const games = new Map<number, Game>();
  let nextId = 1;

  function persist(): void {
    if (filePath === null) return;
    try {
      writeSnapshot(filePath, { nextId, games: [...games.values()] });
    } catch (err) {
      console.error("[store] échec de sauvegarde :", err);
    }
  }

  function insert(input: GameInput): Game {
    const now = new Date().toISOString();
    const game: Game = { id: nextId, ...input, createdAt: now, updatedAt: now };
    nextId += 1;
    games.set(game.id, game);
    return game;
  }

  const loaded = filePath === null ? null : readSnapshot(filePath);
  if (loaded !== null) {
    for (const game of loaded.games) games.set(game.id, game);
    nextId = loaded.nextId;
  } else {
    for (const input of options.seed) insert(input);
    persist();
  }

  return {
    list() {
      return [...games.values()].map((g) => structuredClone(g));
    },

    get(id) {
      const game = games.get(id);
      return game === undefined ? undefined : structuredClone(game);
    },

    create(input) {
      const game = insert(input);
      persist();
      return structuredClone(game);
    },

    update(id, patch) {
      const current = games.get(id);
      if (current === undefined) return undefined;
      const updated: Game = {
        ...current,
        ...patch,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };
      games.set(id, updated);
      persist();
      return structuredClone(updated);
    },

    replace(id, input) {
      const current = games.get(id);
      if (current === undefined) return undefined;
      const replaced: Game = {
        id: current.id,
        ...input,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };
      games.set(id, replaced);
      persist();
      return structuredClone(replaced);
    },

    remove(id) {
      const existed = games.delete(id);
      if (existed) persist();
      return existed;
    },
  };
}
