import { ApiError } from "../api/client";

export interface Notice {
  kind: "success" | "error";
  message: string;
  details: string[];
}

export function errorNotice(err: unknown): Notice {
  if (err instanceof ApiError) return { kind: "error", message: err.message, details: err.details };
  if (err instanceof Error) return { kind: "error", message: err.message, details: [] };
  return { kind: "error", message: "Erreur inconnue", details: [] };
}

export function successNotice(message: string): Notice {
  return { kind: "success", message, details: [] };
}
