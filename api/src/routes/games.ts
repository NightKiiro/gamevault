import { Router } from "express";
import { Library } from "../services/library";
import { parseId } from "../http/errors";

export function createGamesRouter(library: Library): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(200).json(library.listGames());
  });

  router.get("/:id", (req, res) => {
    res.status(200).json(library.getGame(parseId(req.params.id)));
  });

  router.post("/", (req, res) => {
    const body: unknown = req.body;
    const game = library.createGame(body);
    res.status(201).location(`/games/${game.id}`).json(game);
  });

  router.put("/:id", (req, res) => {
    const body: unknown = req.body;
    res.status(200).json(library.updateGame(parseId(req.params.id), body));
  });

  router.delete("/:id", (req, res) => {
    library.deleteGame(parseId(req.params.id));
    res.status(204).end();
  });

  return router;
}
