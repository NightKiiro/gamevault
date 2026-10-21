import type { CoverCandidate, Game, GameInput, GamePatch, Platform, PlatformInput } from "./types";
import { isRecord, parseCoverList, parseGame, parseGameList, parsePlatform, parsePlatformList } from "./guards";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 8000;

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

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function isTimeoutError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "TimeoutError";
}

function toNetworkError(err: unknown): unknown {
  if (isTimeoutError(err)) {
    return new ApiError(0, "L'API met trop de temps à répondre. Réessaie dans un instant.");
  }
  if (isAbortError(err)) return err;
  return new ApiError(0, "Impossible de joindre l'API. Est-elle lancée ?");
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

async function request(method: string, path: string, payload?: unknown, signal?: AbortSignal): Promise<unknown> {
  const signals = [AbortSignal.timeout(REQUEST_TIMEOUT_MS)];
  if (signal !== undefined) signals.push(signal);

  const init: RequestInit = { method, signal: AbortSignal.any(signals) };
  if (payload !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(payload);
  }

  let res: Response;
  let text: string;
  try {
    res = await fetch(`${API_URL}${path}`, init);
    text = await res.text();
  } catch (err) {
    throw toNetworkError(err);
  }

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

export async function fetchGames(signal?: AbortSignal): Promise<Game[]> {
  return parseGameList(await request("GET", "/games", undefined, signal));
}

export async function fetchGame(id: number, signal?: AbortSignal): Promise<Game> {
  return expectGame(await request("GET", `/games/${id}`, undefined, signal));
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

function expectPlatform(body: unknown): Platform {
  const platform = parsePlatform(body);
  if (platform === null) throw new ApiError(0, "Plateforme reçue dans un format inattendu");
  return platform;
}

export async function fetchPlatforms(signal?: AbortSignal): Promise<Platform[]> {
  return parsePlatformList(await request("GET", "/platforms", undefined, signal));
}

export async function createPlatform(input: PlatformInput): Promise<Platform> {
  return expectPlatform(await request("POST", "/platforms", input));
}

export async function updatePlatform(id: number, input: PlatformInput): Promise<Platform> {
  return expectPlatform(await request("PUT", `/platforms/${id}`, input));
}

export async function deletePlatform(id: number): Promise<void> {
  await request("DELETE", `/platforms/${id}`);
}

export async function searchCovers(query: string, signal?: AbortSignal): Promise<CoverCandidate[]> {
  const params = new URLSearchParams({ q: query });
  return parseCoverList(await request("GET", `/covers/search?${params.toString()}`, undefined, signal));
}
