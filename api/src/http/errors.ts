import { FieldError } from "../validation/result";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldError[] | undefined;

  constructor(status: number, code: string, message: string, details?: FieldError[]) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function gameNotFound(id: number): HttpError {
  return new HttpError(404, "GAME_NOT_FOUND", `Aucun jeu avec l'id ${id}`);
}

export function platformNotFound(id: number): HttpError {
  return new HttpError(404, "PLATFORM_NOT_FOUND", `Aucune plateforme avec l'id ${id}`);
}

export function parseId(raw: string): number {
  if (!/^[1-9]\d*$/.test(raw)) {
    throw new HttpError(400, "INVALID_ID", `"${raw}" n'est pas un identifiant valide`);
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id)) {
    throw new HttpError(400, "INVALID_ID", `"${raw}" est trop grand`);
  }
  return id;
}
