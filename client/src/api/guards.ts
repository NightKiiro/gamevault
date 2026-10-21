import type { Game } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseGame(raw: unknown): Game | null {
  if (!isRecord(raw)) return null;
  const { id, title, platform, genre, completed, rating, releaseYear, hoursPlayed, createdAt, updatedAt } = raw;
  if (
    typeof id !== "number" || typeof title !== "string" || typeof platform !== "string" ||
    typeof genre !== "string" || typeof completed !== "boolean" || typeof rating !== "number" ||
    typeof createdAt !== "string" || typeof updatedAt !== "string"
  ) {
    return null;
  }
  const game: Game = { id, title, platform, genre, completed, rating, createdAt, updatedAt };
  if (typeof releaseYear === "number") game.releaseYear = releaseYear;
  if (typeof hoursPlayed === "number") game.hoursPlayed = hoursPlayed;
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
