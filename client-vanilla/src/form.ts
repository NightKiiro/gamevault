import type { GameInput } from "./types";

export type FormResult = { ok: true; value: GameInput } | { ok: false; errors: string[] };

function text(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(data: FormData, name: string): number | undefined | null {
  const raw = text(data, name);
  if (raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readGameForm(form: HTMLFormElement): FormResult {
  const data = new FormData(form);
  const errors: string[] = [];

  const title = text(data, "title");
  const platform = text(data, "platform");
  const genre = text(data, "genre");
  const rating = Number(text(data, "rating"));
  const releaseYear = optionalNumber(data, "releaseYear");
  const hoursPlayed = optionalNumber(data, "hoursPlayed");

  if (title === "") errors.push("Le titre est obligatoire");
  if (platform === "") errors.push("La plateforme est obligatoire");
  if (genre === "") errors.push("Le genre est obligatoire");
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) errors.push("La note doit être entre 0 et 10");
  if (releaseYear === null || (releaseYear !== undefined && !Number.isInteger(releaseYear))) {
    errors.push("L'année doit être un nombre entier");
  }
  if (hoursPlayed === null || (hoursPlayed !== undefined && hoursPlayed < 0)) {
    errors.push("Les heures jouées doivent être un nombre positif");
  }
  if (errors.length > 0) return { ok: false, errors };

  const value: GameInput = { title, platform, genre, rating, completed: data.get("completed") === "on" };
  if (typeof releaseYear === "number") value.releaseYear = releaseYear;
  if (typeof hoursPlayed === "number") value.hoursPlayed = hoursPlayed;
  return { ok: true, value };
}
