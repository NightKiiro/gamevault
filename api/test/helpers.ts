import http from "node:http";
import { AppOptions, createApp } from "../src/app";
import { createGameStore } from "../src/store/gameStore";
import { createPlatformStore } from "../src/store/platformStore";
import { createLibrary } from "../src/services/library";
import { SEED_GAMES } from "../src/data/seed";
import { SEED_PLATFORMS } from "../src/data/platformSeed";

export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export function createTestLibrary() {
  const library = createLibrary(
    createGameStore({ filePath: null, seed: SEED_GAMES }),
    createPlatformStore({ filePath: null, seed: SEED_PLATFORMS }),
  );
  library.reconcile();
  return library;
}

export async function startTestServer(options: AppOptions = {}): Promise<TestServer> {
  const app = createApp(createTestLibrary(), { logRequests: false, ...options });
  const server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Adresse du serveur de test inattendue");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

export interface ApiResponse {
  status: number;
  headers: Headers;
  body: unknown;
}

export interface RequestOptions {
  json?: unknown;
  raw?: string;
}

export async function request(
  server: TestServer,
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse> {
  const init: RequestInit = { method, headers: {} };
  if (options.json !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(options.json);
  } else if (options.raw !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = options.raw;
  }

  const res = await fetch(`${server.baseUrl}${path}`, init);
  const text = await res.text();
  const body: unknown = text === "" ? undefined : JSON.parse(text);
  return { status: res.status, headers: res.headers, body };
}

export const VALID_GAME = {
  title: "Outer Wilds",
  platform: "PC",
  genre: "Exploration",
  completed: false,
  rating: 10,
} as const;
