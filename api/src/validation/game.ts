import { GameInput, GamePatch, RATING_MAX, RATING_MIN } from "../models/game";
import { FieldError, ValidationResult, isRecord } from "./result";

const TEXT_MAX_LENGTH = 100;
const FIRST_YEAR = 1950;

type FieldCheck = (value: unknown) => string | null;

function text(value: unknown): string | null {
  if (typeof value !== "string") return "doit être une chaîne de caractères";
  if (value.trim() === "") return "ne doit pas être vide";
  if (value.length > TEXT_MAX_LENGTH) return `ne doit pas dépasser ${TEXT_MAX_LENGTH} caractères`;
  return null;
}

function bool(value: unknown): string | null {
  return typeof value === "boolean" ? null : "doit être un booléen";
}

function rating(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return "doit être un nombre";
  if (value < RATING_MIN || value > RATING_MAX) return `doit être compris entre ${RATING_MIN} et ${RATING_MAX}`;
  return null;
}

function releaseYear(value: unknown): string | null {
  const maxYear = new Date().getFullYear() + 5;
  if (typeof value !== "number" || !Number.isInteger(value)) return "doit être une année entière";
  if (value < FIRST_YEAR || value > maxYear) return `doit être comprise entre ${FIRST_YEAR} et ${maxYear}`;
  return null;
}

function hoursPlayed(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return "doit être un nombre";
  if (value < 0) return "ne peut pas être négatif";
  return null;
}

type RequiredField = "title" | "platform" | "genre" | "completed" | "rating";
type OptionalField = "releaseYear" | "hoursPlayed" | "coverUrl" | "backdropUrl";

const URL_MAX_LENGTH = 500;

function imageUrl(value: unknown): string | null {
  if (typeof value !== "string") return "doit être une URL";
  if (value.length > URL_MAX_LENGTH) return `ne doit pas dépasser ${URL_MAX_LENGTH} caractères`;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "doit être une URL valide";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "doit commencer par http:// ou https://";
  return null;
}

const REQUIRED: Record<RequiredField, FieldCheck> = {
  title: text,
  platform: text,
  genre: text,
  completed: bool,
  rating,
};

const OPTIONAL: Record<OptionalField, FieldCheck> = {
  releaseYear,
  hoursPlayed,
  coverUrl: imageUrl,
  backdropUrl: imageUrl,
};

function checkFields(
  body: Record<string, unknown>,
  checks: Record<string, FieldCheck>,
  required: boolean,
  errors: FieldError[],
): void {
  for (const [field, check] of Object.entries(checks)) {
    const value = body[field];
    if (value === undefined) {
      if (required) errors.push({ field, message: "est obligatoire" });
      continue;
    }
    const message = check(value);
    if (message !== null) errors.push({ field, message });
  }
}

function pickKnownFields(body: Record<string, unknown>): GamePatch {
  const patch: GamePatch = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.platform === "string") patch.platform = body.platform.trim();
  if (typeof body.genre === "string") patch.genre = body.genre.trim();
  if (typeof body.completed === "boolean") patch.completed = body.completed;
  if (typeof body.rating === "number") patch.rating = body.rating;
  if (typeof body.releaseYear === "number") patch.releaseYear = body.releaseYear;
  if (typeof body.hoursPlayed === "number") patch.hoursPlayed = body.hoursPlayed;
  if (typeof body.coverUrl === "string") patch.coverUrl = body.coverUrl;
  if (typeof body.backdropUrl === "string") patch.backdropUrl = body.backdropUrl;
  return patch;
}

export function validateGameInput(body: unknown): ValidationResult<GameInput> {
  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "doit être un objet JSON" }] };
  }
  const errors: FieldError[] = [];
  checkFields(body, REQUIRED, true, errors);
  checkFields(body, OPTIONAL, false, errors);
  if (errors.length > 0) return { ok: false, errors };

  const patch = pickKnownFields(body);
  const { title, platform, genre, completed, rating: score } = patch;
  if (title === undefined || platform === undefined || genre === undefined
      || completed === undefined || score === undefined) {
    return { ok: false, errors: [{ field: "body", message: "champs obligatoires manquants" }] };
  }
  const value: GameInput = { title, platform, genre, completed, rating: score };
  if (patch.releaseYear !== undefined) value.releaseYear = patch.releaseYear;
  if (patch.hoursPlayed !== undefined) value.hoursPlayed = patch.hoursPlayed;
  if (patch.coverUrl !== undefined) value.coverUrl = patch.coverUrl;
  if (patch.backdropUrl !== undefined) value.backdropUrl = patch.backdropUrl;
  return { ok: true, value };
}

export function validateGamePatch(body: unknown): ValidationResult<GamePatch> {
  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "doit être un objet JSON" }] };
  }
  const errors: FieldError[] = [];
  checkFields(body, REQUIRED, false, errors);
  checkFields(body, OPTIONAL, false, errors);
  if (errors.length > 0) return { ok: false, errors };

  const patch = pickKnownFields(body);
  if (Object.keys(patch).length === 0) {
    return { ok: false, errors: [{ field: "body", message: "aucun champ modifiable fourni" }] };
  }
  return { ok: true, value: patch };
}
