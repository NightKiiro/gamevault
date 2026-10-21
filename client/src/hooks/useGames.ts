import { useCallback, useEffect, useRef, useState } from "react";
import type { Game, GameInput, GamePatch } from "../api/types";
import { ApiError, createGame, deleteGame, fetchGame, fetchGames, isAbortError, updateGame } from "../api/client";
import { errorNotice } from "../lib/errors";
import type { Notice } from "../lib/errors";

export interface UseGames {
  games: Game[];
  loading: boolean;
  loadError: Notice | null;
  pendingIds: ReadonlySet<number>;
  reload: () => void;
  refreshOne: (id: number, signal?: AbortSignal) => Promise<void>;
  create: (input: GameInput) => Promise<Game>;
  update: (id: number, patch: GamePatch) => Promise<Game>;
  remove: (id: number) => Promise<void>;
}

function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export function useGames(): UseGames {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Notice | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const gamesRef = useRef<Game[]>(games);
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    fetchGames(controller.signal)
      .then((list) => setGames(list))
      .catch((err: unknown) => {
        if (!isAbortError(err)) setLoadError(errorNotice(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const markPending = useCallback((id: number, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const forget = useCallback((id: number) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const refreshOne = useCallback(async (id: number, signal?: AbortSignal) => {
    try {
      const fresh = await fetchGame(id, signal);
      setGames((prev) => prev.map((g) => (g.id === id ? fresh : g)));
    } catch (err) {
      if (isNotFound(err)) forget(id);
      throw err;
    }
  }, [forget]);

  const create = useCallback(async (input: GameInput) => {
    const created = await createGame(input);
    setGames((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: number, patch: GamePatch) => {
    const previous = gamesRef.current.find((g) => g.id === id);
    if (previous === undefined) throw new ApiError(404, "Ce jeu n'existe plus");

    const optimistic: Game = { ...previous, ...patch };
    setGames((prev) => prev.map((g) => (g.id === id ? optimistic : g)));
    markPending(id, true);

    try {
      const saved = await updateGame(id, patch);
      setGames((prev) => prev.map((g) => (g.id === id ? saved : g)));
      return saved;
    } catch (err) {
      if (isNotFound(err)) {
        forget(id);
      } else {
        setGames((prev) => prev.map((g) => (g === optimistic ? previous : g)));
      }
      throw err;
    } finally {
      markPending(id, false);
    }
  }, [markPending, forget]);

  const remove = useCallback(async (id: number) => {
    const index = gamesRef.current.findIndex((g) => g.id === id);
    const removed = gamesRef.current[index];
    if (removed === undefined) return;

    forget(id);

    try {
      await deleteGame(id);
    } catch (err) {
      if (isNotFound(err)) return;
      setGames((prev) => {
        if (prev.some((g) => g.id === id)) return prev;
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
      throw err;
    }
  }, [forget]);

  return { games, loading, loadError, pendingIds, reload, refreshOne, create, update, remove };
}
