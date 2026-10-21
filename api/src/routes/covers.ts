import { Router } from "express";
import { CoverSearch } from "../covers/steam";
import { HttpError } from "../http/errors";

export function createCoversRouter(search: CoverSearch): Router {
  const router = Router();

  router.get("/search", async (req, res) => {
    const raw = req.query.q;
    const query = typeof raw === "string" ? raw.trim() : "";
    if (query.length < 2 || query.length > 100) {
      throw new HttpError(400, "INVALID_QUERY", "Le paramètre q doit contenir entre 2 et 100 caractères");
    }

    const results = await search(query).catch((err: unknown) => {
      console.error("[covers] recherche Steam impossible :", err);
      throw new HttpError(502, "COVER_SEARCH_FAILED", "La recherche de jaquettes sur Steam est indisponible");
    });

    res.status(200).json(results);
  });

  return router;
}
