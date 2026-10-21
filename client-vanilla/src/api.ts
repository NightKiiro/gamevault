import type { Game, GameInput, GamePatch } from "./types";
import { isRecord, parseGame, parseGameList } from "./guards";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function readErrorBody(body: unknown, status: number): ApiError {
  if (isRecord(body) && isRecord(body.error) && typeof body.error.message === "string") {
    const details = Array.isArray(body.error.details)
      ? body.error.details.flatMap((d: unknown) =>
          isRecord(d) && typeof d.field === "string" && typeof d.message === "string"
            ? [`${d.field} ${d.message}`]
            : [],
        )
      : [];
    return new ApiError(status, body.error.message, details);
  }
  return new ApiError(status, `Erreur HTTP ${status}`);
}

async function request(method: string, path: string, payload?: unknown): Promise<unknown> {
  const init: RequestInit = { method };
  if (payload !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(payload);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, "Impossible de joindre l'API. Est-elle lancée ?");
  }

  const text = await res.text();
  let body: unknown = undefined;
  if (text !== "") {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, "Réponse de l'API illisible");
    }
  }

  if (!res.ok) throw readErrorBody(body, res.status);
  return body;
}

function expectGame(body: unknown): Game {
  const game = parseGame(body);
  if (game === null) throw new ApiError(0, "Jeu reçu dans un format inattendu");
  return game;
}

export async function fetchGames(): Promise<Game[]> {
  return parseGameList(await request("GET", "/games"));
}

export async function createGame(input: GameInput): Promise<Game> {
  return expectGame(await request("POST", "/games", input));
}

export async function updateGame(id: number, patch: GamePatch): Promise<Game> {
  return expectGame(await request("PUT", `/games/${id}`, patch));
}

export async function deleteGame(id: number): Promise<void> {
  await request("DELETE", `/games/${id}`);
}
