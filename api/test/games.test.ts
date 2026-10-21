import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isRecord } from "../src/validation/result";
import { SEED_GAMES } from "../src/data/seed";
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

describe("GET /games", () => {
  it("renvoie 200 et la liste complète", async () => {
    const res = await request(server, "GET", "/games");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, SEED_GAMES.length);
  });

  it("chaque jeu respecte le modèle minimum", async () => {
    const res = await request(server, "GET", "/games");
    assert.ok(Array.isArray(res.body));
    for (const game of res.body) {
      assert.ok(isRecord(game));
      assert.equal(typeof game.id, "number");
      assert.equal(typeof game.title, "string");
      assert.equal(typeof game.platform, "string");
      assert.equal(typeof game.genre, "string");
      assert.equal(typeof game.completed, "boolean");
      assert.equal(typeof game.rating, "number");
    }
  });
});

describe("GET /games/:id", () => {
  it("renvoie 200 et le bon jeu", async () => {
    const res = await request(server, "GET", "/games/1");
    assert.equal(res.status, 200);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.id, 1);
  });

  it("renvoie 404 pour un id inconnu", async () => {
    const res = await request(server, "GET", "/games/9999");
    assert.equal(res.status, 404);
    assert.equal(errorCode(res.body), "GAME_NOT_FOUND");
  });

  it("renvoie 400 pour un id non numérique", async () => {
    const res = await request(server, "GET", "/games/abc");
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "INVALID_ID");
  });
});

describe("POST /games", () => {
  it("renvoie 201, génère l'id côté serveur et fixe Location", async () => {
    const res = await request(server, "POST", "/games", { json: { ...VALID_GAME, id: 999 } });
    assert.equal(res.status, 201);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.id, SEED_GAMES.length + 1);
    assert.equal(res.body.title, VALID_GAME.title);
    assert.equal(res.headers.get("location"), `/games/${SEED_GAMES.length + 1}`);
  });

  it("le jeu créé est ensuite lisible", async () => {
    const created = await request(server, "POST", "/games", { json: VALID_GAME });
    assert.ok(isRecord(created.body));
    const res = await request(server, "GET", `/games/${String(created.body.id)}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, created.body);
  });

  it("renvoie 400 avec le détail des champs invalides", async () => {
    const res = await request(server, "POST", "/games", { json: { title: "", rating: 42 } });
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "VALIDATION_ERROR");
    assert.ok(isRecord(res.body) && isRecord(res.body.error));
    assert.ok(Array.isArray(res.body.error.details));
    const fields = res.body.error.details.map((d: unknown) => (isRecord(d) ? d.field : null));
    for (const field of ["title", "platform", "genre", "completed", "rating"]) {
      assert.ok(fields.includes(field), `erreur attendue sur ${field}`);
    }
  });

  it("refuse une URL d'image en javascript:", async () => {
    const res = await request(server, "POST", "/games", {
      json: { ...VALID_GAME, coverUrl: "javascript:alert(1)" },
    });
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "VALIDATION_ERROR");
  });

  it("renvoie 400 sur un JSON malformé", async () => {
    const res = await request(server, "POST", "/games", { raw: '{"title": oups' });
    assert.equal(res.status, 400);
    assert.equal(errorCode(res.body), "MALFORMED_JSON");
  });

  it("renvoie 400 si le corps est un tableau", async () => {
    const res = await request(server, "POST", "/games", { json: [VALID_GAME] });
    assert.equal(res.status, 400);
  });

  it("renvoie 400 sans corps", async () => {
    const res = await request(server, "POST", "/games");
    assert.equal(res.status, 400);
  });

  it("ne réutilise jamais un id supprimé", async () => {
    const first = await request(server, "POST", "/games", { json: VALID_GAME });
    assert.ok(isRecord(first.body) && typeof first.body.id === "number");
    await request(server, "DELETE", `/games/${first.body.id}`);
    const second = await request(server, "POST", "/games", { json: VALID_GAME });
    assert.ok(isRecord(second.body) && typeof second.body.id === "number");
    assert.ok(second.body.id > first.body.id);
  });
});

describe("PUT /games/:id", () => {
  it("renvoie 200 et applique une mise à jour partielle", async () => {
    const res = await request(server, "PUT", "/games/2", { json: { completed: false, rating: 7 } });
    assert.equal(res.status, 200);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.completed, false);
    assert.equal(res.body.rating, 7);
    assert.equal(res.body.title, SEED_GAMES[1]?.title);
  });

  it("un PUT complet remplace le jeu et retire les champs optionnels absents", async () => {
    const res = await request(server, "PUT", "/games/1", {
      json: { title: "Hades", platform: "PC", genre: "Roguelike", completed: true, rating: 9 },
    });
    assert.equal(res.status, 200);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.rating, 9);
    assert.equal(res.body.coverUrl, undefined);
    assert.equal(res.body.releaseYear, undefined);
  });

  it("ignore l'id et createdAt envoyés par le client", async () => {
    const before = await request(server, "GET", "/games/1");
    assert.ok(isRecord(before.body));
    const res = await request(server, "PUT", "/games/1", {
      json: { id: 42, createdAt: "1999-01-01T00:00:00Z", title: "Hades II" },
    });
    assert.equal(res.status, 200);
    assert.ok(isRecord(res.body));
    assert.equal(res.body.id, 1);
    assert.equal(res.body.createdAt, before.body.createdAt);
    assert.equal(res.body.title, "Hades II");
  });

  it("renvoie 400 sur des données invalides", async () => {
    const res = await request(server, "PUT", "/games/1", { json: { rating: "dix" } });
    assert.equal(res.status, 400);
  });

  it("renvoie 400 sur un corps vide", async () => {
    const res = await request(server, "PUT", "/games/1", { json: {} });
    assert.equal(res.status, 400);
  });

  it("renvoie 404 pour un id inconnu", async () => {
    const res = await request(server, "PUT", "/games/9999", { json: { completed: true } });
    assert.equal(res.status, 404);
  });
});

describe("DELETE /games/:id", () => {
  it("renvoie 204 sans corps, puis le jeu n'existe plus", async () => {
    const res = await request(server, "DELETE", "/games/1");
    assert.equal(res.status, 204);
    assert.equal(res.body, undefined);
    const after = await request(server, "GET", "/games/1");
    assert.equal(after.status, 404);
  });

  it("renvoie 404 au second appel", async () => {
    await request(server, "DELETE", "/games/1");
    const res = await request(server, "DELETE", "/games/1");
    assert.equal(res.status, 404);
  });
});

describe("Divers", () => {
  it("route inconnue : 404 en JSON", async () => {
    const res = await request(server, "GET", "/nimporte");
    assert.equal(res.status, 404);
    assert.equal(errorCode(res.body), "ROUTE_NOT_FOUND");
  });

  it("CORS activé", async () => {
    const res = await request(server, "GET", "/games");
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
  });

  it("n'expose pas X-Powered-By", async () => {
    const res = await request(server, "GET", "/health");
    assert.equal(res.headers.get("x-powered-by"), null);
  });
});
