import type { Game, GameInput } from "../api/types";

export interface GameFormValues {
  title: string;
  platform: string;
  genre: string;
  rating: string;
  releaseYear: string;
  hoursPlayed: string;
  completed: boolean;
}

export type GameFormErrors = Partial<Record<keyof GameFormValues, string>>;

export type GameFormResult =
  | { ok: true; value: GameInput }
  | { ok: false; errors: GameFormErrors };

export const EMPTY_FORM: GameFormValues = {
  title: "",
  platform: "",
  genre: "",
  rating: "5",
  releaseYear: "",
  hoursPlayed: "",
  completed: false,
};

export function valuesFromGame(game: Game): GameFormValues {
  return {
    title: game.title,
    platform: game.platform,
    genre: game.genre,
    rating: String(game.rating),
    releaseYear: game.releaseYear === undefined ? "" : String(game.releaseYear),
    hoursPlayed: game.hoursPlayed === undefined ? "" : String(game.hoursPlayed),
    completed: game.completed,
  };
}

function optionalNumber(raw: string): number | undefined | null {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function validateGameForm(values: GameFormValues): GameFormResult {
  const errors: GameFormErrors = {};
  const title = values.title.trim();
  const platform = values.platform.trim();
  const genre = values.genre.trim();
  const rating = Number(values.rating);
  const releaseYear = optionalNumber(values.releaseYear);
  const hoursPlayed = optionalNumber(values.hoursPlayed);
  const maxYear = new Date().getFullYear() + 5;

  if (title === "") errors.title = "Le titre est obligatoire";
  else if (title.length > 100) errors.title = "100 caractères maximum";
  if (platform === "") errors.platform = "La plateforme est obligatoire";
  if (genre === "") errors.genre = "Le genre est obligatoire";
  if (values.rating.trim() === "" || !Number.isFinite(rating) || rating < 0 || rating > 10) {
    errors.rating = "Entre 0 et 10";
  }
  if (releaseYear === null || (releaseYear !== undefined && (!Number.isInteger(releaseYear) || releaseYear < 1950 || releaseYear > maxYear))) {
    errors.releaseYear = `Année entière entre 1950 et ${maxYear}`;
  }
  if (hoursPlayed === null || (hoursPlayed !== undefined && hoursPlayed < 0)) {
    errors.hoursPlayed = "Nombre positif";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const value: GameInput = { title, platform, genre, rating, completed: values.completed };
  if (typeof releaseYear === "number") value.releaseYear = releaseYear;
  if (typeof hoursPlayed === "number") value.hoursPlayed = hoursPlayed;
  return { ok: true, value };
}
