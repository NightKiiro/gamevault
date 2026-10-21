import type { CoverCandidate, Game, Platform } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseGame(raw: unknown): Game | null {
  if (!isRecord(raw)) return null;
  const { id, title, platform, genre, completed, rating, createdAt, updatedAt } = raw;
  if (
    typeof id !== "number" || typeof title !== "string" || typeof platform !== "string" ||
    typeof genre !== "string" || typeof completed !== "boolean" || typeof rating !== "number" ||
    typeof createdAt !== "string" || typeof updatedAt !== "string"
  ) {
    return null;
  }
  const game: Game = { id, title, platform, genre, completed, rating, createdAt, updatedAt };
  if (typeof raw.platformId === "number") game.platformId = raw.platformId;
  if (typeof raw.releaseYear === "number") game.releaseYear = raw.releaseYear;
  if (typeof raw.hoursPlayed === "number") game.hoursPlayed = raw.hoursPlayed;
  if (typeof raw.coverUrl === "string") game.coverUrl = raw.coverUrl;
  if (typeof raw.backdropUrl === "string") game.backdropUrl = raw.backdropUrl;
  return game;
}

export function parsePlatform(raw: unknown): Platform | null {
  if (!isRecord(raw)) return null;
  const { id, name, createdAt, updatedAt } = raw;
  if (typeof id !== "number" || typeof name !== "string" || typeof createdAt !== "string" || typeof updatedAt !== "string") {
    return null;
  }
  const gameCount = typeof raw.gameCount === "number" ? raw.gameCount : 0;
  const platform: Platform = { id, name, gameCount, createdAt, updatedAt };
  if (typeof raw.manufacturer === "string") platform.manufacturer = raw.manufacturer;
  if (typeof raw.releaseYear === "number") platform.releaseYear = raw.releaseYear;
  return platform;
}

function parseList<T>(raw: unknown, parse: (item: unknown) => T | null, label: string): T[] {
  if (!Array.isArray(raw)) throw new Error(`La réponse de l'API n'est pas une liste de ${label}`);
  const items: T[] = [];
  for (const entry of raw) {
    const item = parse(entry);
    if (item === null) console.warn(`Élément ignoré (${label}), format inattendu :`, entry);
    else items.push(item);
  }
  return items;
}

export function parseGameList(raw: unknown): Game[] {
  return parseList(raw, parseGame, "jeux");
}

export function parsePlatformList(raw: unknown): Platform[] {
  return parseList(raw, parsePlatform, "plateformes");
}

export function parseCoverList(raw: unknown): CoverCandidate[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item: unknown): CoverCandidate[] => {
    if (!isRecord(item)) return [];
    const { appId, name, coverUrl, backdropUrl, thumbUrl } = item;
    if (
      typeof appId !== "number" || typeof name !== "string" || typeof coverUrl !== "string" ||
      typeof backdropUrl !== "string" || typeof thumbUrl !== "string"
    ) {
      return [];
    }
    return [{ appId, name, coverUrl, backdropUrl, thumbUrl }];
  });
}
