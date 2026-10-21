import { Router } from "express";
import { Game } from "../models/game";
import { GameStore } from "../store/gameStore";
import { validateGameInput, validateGamePatch } from "../validation/game";
import { HttpError, gameNotFound } from "../http/errors";

function parseId(raw: string): number {
  if (!/^[1-9]\d*$/.test(raw)) {
    throw new HttpError(400, "INVALID_ID", `"${raw}" n'est pas un identifiant valide`);
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id)) {
    throw new HttpError(400, "INVALID_ID", `"${raw}" est trop grand`);
  }
  return id;
}

function findOrThrow(store: GameStore, id: number): Game {
  const game = store.get(id);
  if (game === undefined) throw gameNotFound(id);
  return game;
}

export function createGamesRouter(store: GameStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(200).json(store.list());
  });

  router.get("/:id", (req, res) => {
    const id = parseId(req.params.id);
    res.status(200).json(findOrThrow(store, id));
  });

  router.post("/", (req, res) => {
    const body: unknown = req.body;
    const result = validateGameInput(body);
    if (!result.ok) {
      throw new HttpError(400, "VALIDATION_ERROR", "Le jeu envoyé est invalide", result.errors);
    }
    const game = store.create(result.value);
    res.status(201).location(`/games/${game.id}`).json(game);
  });

  router.put("/:id", (req, res) => {
    const id = parseId(req.params.id);
    findOrThrow(store, id);

    const body: unknown = req.body;
    const result = validateGamePatch(body);
    if (!result.ok) {
      throw new HttpError(400, "VALIDATION_ERROR", "La mise à jour est invalide", result.errors);
    }
    const updated = store.update(id, result.value);
    if (updated === undefined) throw gameNotFound(id);
    res.status(200).json(updated);
  });

  router.delete("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (!store.remove(id)) throw gameNotFound(id);
    res.status(204).end();
  });

  return router;
}
