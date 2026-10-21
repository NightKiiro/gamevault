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
