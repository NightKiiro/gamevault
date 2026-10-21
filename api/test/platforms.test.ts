import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isRecord } from "../src/validation/result";
import { SEED_PLATFORMS } from "../src/data/platformSeed";
import { TestServer, VALID_GAME, request, startTestServer } from "./helpers";

let server: TestServer;

beforeEach(async () => {
  server = await startTestServer();
});

afterEach(async () => {
  await server.close();
});

function errorCode(body: unknown): unknown {
  return isRecord(body) && isRecord(body.error) ? body.error.code : undefined;
}

async function platformIdByName(name: string): Promise<number> {
  const res = await request(server, "GET", "/platforms");
  assert.ok(Array.isArray(res.body));
  const found = res.body.find((p: unknown) => isRecord(p) && p.name === name);
  assert.ok(isRecord(found) && typeof found.id === "number", `plateforme ${name} introuvable`);
  return found.id;
}

describe("CRUD /platforms", () => {
  it("GET renvoie 200, toutes les plateformes et leur nombre de jeux", async () => {
    const res = await request(server, "GET", "/platforms");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, SEED_PLATFORMS.length);
    const pc = res.body.find((p: unknown) => isRecord(p) && p.name === "PC");
    assert.ok(isRecord(pc));
    assert.equal(pc.gameCount, 3);
  });

  it("GET /:id renvoie 200, puis 404 pour un id inconnu", async () => {
    assert.equal((await request(server, "GET", "/platforms/1")).status, 200);
    const missing = await request(server, "GET", "/platforms/999");
    assert.equal(missing.status, 404);
    assert.equal(errorCode(missing.body), "PLATFORM_NOT_FOUND");
  });

  it("POST renvoie 201 avec un id généré par le serveur", async () => {
    const res = await request(server, "POST", "/platforms", {
      json: { id: 77, name: "Steam Deck", manufacturer: "Valve", releaseYear: 2022 },
    });
    assert.equal(res.status, 201);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.id, SEED_PLATFORMS.length + 1);
    assert.equal(res.body.gameCount, 0);
    assert.equal(res.headers.get("location"), `/platforms/${SEED_PLATFORMS.length + 1}`);
  });

  it("POST renvoie 400 si le nom manque", async () => {
    const res = await request(server, "POST", "/platforms", { json: { manufacturer: "Sega" } });
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "VALIDATION_ERROR");
  });

  it("POST renvoie 409 si le nom existe déjà, sans tenir compte de la casse", async () => {
    const res = await request(server, "POST", "/platforms", { json: { name: "  switch " } });
    assert.equal(res.status, 409);
    assert.equal(errorCode(res.body), "PLATFORM_EXISTS");
  });

  it("PUT renomme la plateforme et répercute le nom sur ses jeux", async () => {
    const id = await platformIdByName("PS5");
    const res = await request(server, "PUT", `/platforms/${id}`, { json: { name: "PlayStation 5" } });
    assert.equal(res.status, 200);
    const games = await request(server, "GET", "/games");
    assert.ok(Array.isArray(games.body));
    const eldenRing = games.body.find((g: unknown) => isRecord(g) && g.title === "Elden Ring");
    assert.ok(isRecord(eldenRing));
    assert.equal(eldenRing.platform, "PlayStation 5");
    assert.equal(eldenRing.platformId, id);
  });

  it("DELETE renvoie 409 si des jeux utilisent la plateforme", async () => {
    const res = await request(server, "DELETE", `/platforms/${await platformIdByName("PC")}`);
    assert.equal(res.status, 409);
    assert.equal(errorCode(res.body), "PLATFORM_IN_USE");
  });

  it("DELETE renvoie 204 pour une plateforme inutilisée, puis 404", async () => {
    const id = await platformIdByName("Xbox Series");
    assert.equal((await request(server, "DELETE", `/platforms/${id}`)).status, 204);
    assert.equal((await request(server, "DELETE", `/platforms/${id}`)).status, 404);
  });
});

describe("Relation Game ↔ Platform", () => {
  it("les jeux du seed sont reliés à leur plateforme", async () => {
    const res = await request(server, "GET", "/games");
    assert.ok(Array.isArray(res.body));
    for (const game of res.body) {
      assert.ok(isRecord(game));
      assert.equal(typeof game.platformId, "number");
    }
  });

  it("un jeu créé avec platformId reçoit le nom de la plateforme", async () => {
    const id = await platformIdByName("Switch");
    const res = await request(server, "POST", "/games", { json: { ...VALID_GAME, platform: "n'importe quoi", platformId: id } });
    assert.equal(res.status, 201);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.platform, "Switch");
    assert.equal(res.body.platformId, id);
  });

  it("un jeu créé avec seulement un nom connu est relié automatiquement", async () => {
    const res = await request(server, "POST", "/games", { json: { ...VALID_GAME, platform: "pc" } });
    assert.equal(res.status, 201);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.platform, "PC");
    assert.equal(res.body.platformId, await platformIdByName("PC"));
  });

  it("un nom de plateforme inconnu reste un texte libre", async () => {
    const res = await request(server, "POST", "/games", { json: { ...VALID_GAME, platform: "Game Boy" } });
    assert.equal(res.status, 201);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.platform, "Game Boy");
    assert.equal(res.body.platformId, undefined);
  });

  it("un platformId inexistant renvoie 400 UNKNOWN_PLATFORM", async () => {
    const res = await request(server, "POST", "/games", { json: { ...VALID_GAME, platformId: 999 } });
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "UNKNOWN_PLATFORM");
  });

  it("changer le texte de la plateforme d'un jeu le détache de l'ancienne", async () => {
    const res = await request(server, "PUT", "/games/1", { json: { platform: "Game Boy" } });
    assert.equal(res.status, 200);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.platform, "Game Boy");
    assert.equal(res.body.platformId, undefined);
  });
});
