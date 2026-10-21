import type { CoverCandidate, Game } from "./types";

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
  if (typeof raw.releaseYear === "number") game.releaseYear = raw.releaseYear;
  if (typeof raw.hoursPlayed === "number") game.hoursPlayed = raw.hoursPlayed;
  if (typeof raw.coverUrl === "string") game.coverUrl = raw.coverUrl;
  if (typeof raw.backdropUrl === "string") game.backdropUrl = raw.backdropUrl;
  return game;
}

export function parseGameList(raw: unknown): Game[] {
  if (!Array.isArray(raw)) throw new Error("La réponse de l'API n'est pas une liste");
  const games: Game[] = [];
  for (const item of raw) {
    const game = parseGame(item);
    if (game === null) console.warn("Jeu ignoré, format inattendu :", item);
    else games.push(game);
  }
  return games;
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
