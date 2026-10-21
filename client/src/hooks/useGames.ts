import { useCallback, useEffect, useState } from "react";
import type { Game, GameInput, GamePatch } from "../api/types";
import { createGame, deleteGame, fetchGames, isAbortError, updateGame } from "../api/client";
import { errorNotice } from "../lib/errors";
import type { Notice } from "../lib/errors";

export interface UseGames {
  games: Game[];
  loading: boolean;
  loadError: Notice | null;
  pendingIds: ReadonlySet<number>;
  reload: () => void;
  create: (input: GameInput) => Promise<Game>;
  update: (id: number, patch: GamePatch) => Promise<Game>;
  remove: (id: number) => Promise<void>;
}

export function useGames(): UseGames {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Notice | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

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

  const create = useCallback(async (input: GameInput) => {
    const created = await createGame(input);
    setGames((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: number, patch: GamePatch) => {
    markPending(id, true);
    try {
      const updated = await updateGame(id, patch);
      setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } finally {
      markPending(id, false);
    }
  }, [markPending]);

  const remove = useCallback(async (id: number) => {
    markPending(id, true);
    try {
      await deleteGame(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } finally {
      markPending(id, false);
    }
  }, [markPending]);

  return { games, loading, loadError, pendingIds, reload, create, update, remove };
}
