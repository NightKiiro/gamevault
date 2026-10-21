import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { CoverCandidate, CoverSearch } from "../src/covers/steam";
import { isRecord } from "../src/validation/result";
import { TestServer, request, startTestServer } from "./helpers";

const HADES: CoverCandidate = {
  appId: 1145360,
  name: "Hades",
  coverUrl: "https://example.com/cover.jpg",
  backdropUrl: "https://example.com/hero.jpg",
  thumbUrl: "https://example.com/header.jpg",
};

let server: TestServer | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe("GET /covers/search", () => {
  it("renvoie les résultats de la recherche et nettoie la requête", async () => {
    const received: string[] = [];
    const search: CoverSearch = async (query) => {
      received.push(query);
      return [HADES];
    };
    server = await startTestServer({ coverSearch: search });

    const res = await request(server, "GET", "/covers/search?q=%20hades%20");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, [HADES]);
    assert.deepEqual(received, ["hades"]);
  });

  it("renvoie 400 sans paramètre q ou avec un q trop court", async () => {
    server = await startTestServer({ coverSearch: async () => [] });
    assert.equal((await request(server, "GET", "/covers/search")).status, 400);
    assert.equal((await request(server, "GET", "/covers/search?q=a")).status, 400);
  });

  it("renvoie 502 quand Steam est indisponible", async () => {
    server = await startTestServer({
      coverSearch: async () => {
        throw new Error("timeout");
      },
    });
    const res = await request(server, "GET", "/covers/search?q=hades");
    assert.equal(res.status, 502);
    assert.ok(isRecord(res.body) && isRecord(res.body.error));
    assert.equal(res.body.error.code, "COVER_SEARCH_FAILED");
  });
});
