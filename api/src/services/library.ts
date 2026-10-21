import { Game, GameInput } from "../models/game";
import { Platform, PlatformInput, PlatformView } from "../models/platform";
import { GameStore } from "../store/gameStore";
import { PlatformStore } from "../store/platformStore";
import { validateGameInput, validateGamePatch } from "../validation/game";
import { validatePlatformInput, validatePlatformPatch } from "../validation/platform";
import { HttpError, gameNotFound, platformNotFound } from "../http/errors";

export interface Library {
  listGames(): Game[];
  getGame(id: number): Game;
  createGame(body: unknown): Game;
  updateGame(id: number, body: unknown): Game;
  deleteGame(id: number): void;

  listPlatforms(): PlatformView[];
  getPlatform(id: number): PlatformView;
  createPlatform(body: unknown): PlatformView;
  updatePlatform(id: number, body: unknown): PlatformView;
  deletePlatform(id: number): void;

  reconcile(): number;
}

function sameName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("fr") === b.trim().toLocaleLowerCase("fr");
}

function withoutPlatformId(input: GameInput): GameInput {
  const { platformId: _platformId, ...rest } = input;
  return rest;
}

export function createLibrary(games: GameStore, platforms: PlatformStore): Library {
  function findPlatformByName(name: string): Platform | undefined {
    return platforms.list().find((p) => sameName(p.name, name));
  }

  function countGames(platformId: number): number {
    return games.list().filter((g) => g.platformId === platformId).length;
  }

  function toView(platform: Platform): PlatformView {
    return { ...platform, gameCount: countGames(platform.id) };
  }

  function findGame(id: number): Game {
    const game = games.get(id);
    if (game === undefined) throw gameNotFound(id);
    return game;
  }

  function findPlatform(id: number): Platform {
    const platform = platforms.get(id);
    if (platform === undefined) throw platformNotFound(id);
    return platform;
  }

  /**
   * La plateforme d'un jeu a une seule source de vérité : la ressource Platform.
   * - platformId fourni : il doit exister, et le nom `platform` est recopié depuis lui ;
   * - seulement `platform` (texte) : on relie le jeu si une plateforme porte ce nom,
   *   sinon le jeu garde un texte libre, sans platformId.
   */
  function resolvePlatform(input: GameInput): GameInput {
    if (input.platformId !== undefined) {
      const platform = platforms.get(input.platformId);
      if (platform === undefined) {
        throw new HttpError(400, "UNKNOWN_PLATFORM", "La plateforme choisie n'existe pas", [
          { field: "platformId", message: `aucune plateforme avec l'id ${input.platformId}` },
        ]);
      }
      return { ...input, platformId: platform.id, platform: platform.name };
    }
    const match = findPlatformByName(input.platform);
    return match === undefined ? input : { ...input, platformId: match.id, platform: match.name };
  }

  function assertNameAvailable(name: string, exceptId?: number): void {
    const existing = findPlatformByName(name);
    if (existing !== undefined && existing.id !== exceptId) {
      throw new HttpError(409, "PLATFORM_EXISTS", `La plateforme ${existing.name} existe déjà`, [
        { field: "name", message: "est déjà utilisé par une autre plateforme" },
      ]);
    }
  }

  function renameGamesOf(platform: Platform): void {
    for (const game of games.list()) {
      if (game.platformId === platform.id && game.platform !== platform.name) {
        games.update(game.id, { platform: platform.name });
      }
    }
  }

  function savePlatform(id: number, input: PlatformInput): PlatformView {
    assertNameAvailable(input.name, id);
    const saved = platforms.replace(id, input);
    if (saved === undefined) throw platformNotFound(id);
    renameGamesOf(saved);
    return toView(saved);
  }

  return {
    listGames: () => games.list(),

    getGame: (id) => findGame(id),

    createGame(body) {
      const result = validateGameInput(body);
      if (!result.ok) {
        throw new HttpError(400, "VALIDATION_ERROR", "Le jeu envoyé est invalide", result.errors);
      }
      return games.create(resolvePlatform(result.value));
    },

    updateGame(id, body) {
      const current = findGame(id);

      const full = validateGameInput(body);
      let next: GameInput;
      if (full.ok) {
        next = full.value;
      } else {
        const partial = validateGamePatch(body);
        if (!partial.ok) {
          throw new HttpError(400, "VALIDATION_ERROR", "La mise à jour est invalide", partial.errors);
        }
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...currentInput } = current;
        const base = partial.value.platform !== undefined && partial.value.platformId === undefined
          ? withoutPlatformId(currentInput)
          : currentInput;
        next = { ...base, ...partial.value };
      }

      const saved = games.replace(id, resolvePlatform(next));
      if (saved === undefined) throw gameNotFound(id);
      return saved;
    },

    deleteGame(id) {
      if (!games.remove(id)) throw gameNotFound(id);
    },

    listPlatforms: () => platforms.list().map(toView),

    getPlatform: (id) => toView(findPlatform(id)),

    createPlatform(body) {
      const result = validatePlatformInput(body);
      if (!result.ok) {
        throw new HttpError(400, "VALIDATION_ERROR", "La plateforme envoyée est invalide", result.errors);
      }
      assertNameAvailable(result.value.name);
      const created = platforms.create(result.value);
      return toView(created);
    },

    updatePlatform(id, body) {
      const current = findPlatform(id);

      const full = validatePlatformInput(body);
      if (full.ok) return savePlatform(id, full.value);

      const partial = validatePlatformPatch(body);
      if (!partial.ok) {
        throw new HttpError(400, "VALIDATION_ERROR", "La mise à jour est invalide", partial.errors);
      }
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...currentInput } = current;
      return savePlatform(id, { ...currentInput, ...partial.value });
    },

    deletePlatform(id) {
      const platform = findPlatform(id);
      const used = countGames(id);
      if (used > 0) {
        throw new HttpError(
          409,
          "PLATFORM_IN_USE",
          `${platform.name} est utilisée par ${used} jeu${used > 1 ? "x" : ""}. Change leur plateforme avant de la supprimer.`,
        );
      }
      platforms.remove(id);
    },

    reconcile() {
      let fixed = 0;
      for (const game of games.list()) {
        const linked = game.platformId === undefined ? undefined : platforms.get(game.platformId);
        const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = game;
        const resolved = resolvePlatform(linked === undefined ? withoutPlatformId(input) : input);
        if (resolved.platformId !== game.platformId || resolved.platform !== game.platform) {
          games.replace(game.id, resolved);
          fixed += 1;
        }
      }
      return fixed;
    },
  };
}
