import { PlatformInput, PlatformPatch } from "../models/platform";
import { FieldError, ValidationResult, isRecord } from "./result";

const NAME_MAX_LENGTH = 50;
const FIRST_YEAR = 1970;

function name(value: unknown): string | null {
  if (typeof value !== "string") return "doit être une chaîne de caractères";
  if (value.trim() === "") return "ne doit pas être vide";
  if (value.length > NAME_MAX_LENGTH) return `ne doit pas dépasser ${NAME_MAX_LENGTH} caractères`;
  return null;
}

function releaseYear(value: unknown): string | null {
  const maxYear = new Date().getFullYear() + 5;
  if (typeof value !== "number" || !Number.isInteger(value)) return "doit être une année entière";
  if (value < FIRST_YEAR || value > maxYear) return `doit être comprise entre ${FIRST_YEAR} et ${maxYear}`;
  return null;
}

function collectErrors(body: Record<string, unknown>, requireName: boolean): FieldError[] {
  const errors: FieldError[] = [];
  const checks: [string, (v: unknown) => string | null, boolean][] = [
    ["name", name, requireName],
    ["manufacturer", name, false],
    ["releaseYear", releaseYear, false],
  ];
  for (const [field, check, required] of checks) {
    const value = body[field];
    if (value === undefined) {
      if (required) errors.push({ field, message: "est obligatoire" });
      continue;
    }
    const message = check(value);
    if (message !== null) errors.push({ field, message });
  }
  return errors;
}

function pickKnownFields(body: Record<string, unknown>): PlatformPatch {
  const patch: PlatformPatch = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.manufacturer === "string") patch.manufacturer = body.manufacturer.trim();
  if (typeof body.releaseYear === "number") patch.releaseYear = body.releaseYear;
  return patch;
}

export function validatePlatformInput(body: unknown): ValidationResult<PlatformInput> {
  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "doit être un objet JSON" }] };
  }
  const errors = collectErrors(body, true);
  if (errors.length > 0) return { ok: false, errors };

  const patch = pickKnownFields(body);
  if (patch.name === undefined) {
    return { ok: false, errors: [{ field: "name", message: "est obligatoire" }] };
  }
  const value: PlatformInput = { name: patch.name };
  if (patch.manufacturer !== undefined) value.manufacturer = patch.manufacturer;
  if (patch.releaseYear !== undefined) value.releaseYear = patch.releaseYear;
  return { ok: true, value };
}

export function validatePlatformPatch(body: unknown): ValidationResult<PlatformPatch> {
  if (!isRecord(body)) {
    return { ok: false, errors: [{ field: "body", message: "doit être un objet JSON" }] };
  }
  const errors = collectErrors(body, false);
  if (errors.length > 0) return { ok: false, errors };

  const patch = pickKnownFields(body);
  if (Object.keys(patch).length === 0) {
    return { ok: false, errors: [{ field: "body", message: "aucun champ modifiable fourni" }] };
  }
  return { ok: true, value: patch };
}
