import { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../http/errors";
import { FieldError, isRecord } from "../validation/result";

interface ErrorBody {
  error: { code: string; message: string; details?: FieldError[] };
}

function errorBody(code: string, message: string, details?: FieldError[]): ErrorBody {
  return details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } };
}

function fromBodyParser(err: unknown): HttpError | null {
  if (!isRecord(err) || typeof err.type !== "string") return null;
  switch (err.type) {
    case "entity.parse.failed":
      return new HttpError(400, "MALFORMED_JSON", "Le corps de la requête n'est pas du JSON valide");
    case "entity.too.large":
      return new HttpError(413, "PAYLOAD_TOO_LARGE", "Le corps de la requête est trop volumineux");
    default:
      return null;
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json(errorBody("ROUTE_NOT_FOUND", `${req.method} ${req.path} n'existe pas`));
};

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const httpError = err instanceof HttpError ? err : fromBodyParser(err);

  if (httpError !== null) {
    res.status(httpError.status).json(errorBody(httpError.code, httpError.message, httpError.details));
    return;
  }

  console.error("[api] erreur inattendue :", err);
  res.status(500).json(errorBody("INTERNAL_ERROR", "Erreur interne du serveur"));
};
