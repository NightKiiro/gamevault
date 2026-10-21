import { Router } from "express";
import { Library } from "../services/library";
import { parseId } from "../http/errors";

export function createPlatformsRouter(library: Library): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(200).json(library.listPlatforms());
  });

  router.get("/:id", (req, res) => {
    res.status(200).json(library.getPlatform(parseId(req.params.id)));
  });

  router.post("/", (req, res) => {
    const body: unknown = req.body;
    const platform = library.createPlatform(body);
    res.status(201).location(`/platforms/${platform.id}`).json(platform);
  });

  router.put("/:id", (req, res) => {
    const body: unknown = req.body;
    res.status(200).json(library.updatePlatform(parseId(req.params.id), body));
  });

  router.delete("/:id", (req, res) => {
    library.deletePlatform(parseId(req.params.id));
    res.status(204).end();
  });

  return router;
}
