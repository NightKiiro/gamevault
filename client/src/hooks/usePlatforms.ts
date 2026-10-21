import { useCallback, useEffect, useState } from "react";
import type { Platform, PlatformInput } from "../api/types";
import { createPlatform, deletePlatform, fetchPlatforms, isAbortError, updatePlatform } from "../api/client";
import { errorNotice } from "../lib/errors";
import type { Notice } from "../lib/errors";

export interface UsePlatforms {
  platforms: Platform[];
  loading: boolean;
  loadError: Notice | null;
  reload: () => void;
  create: (input: PlatformInput) => Promise<Platform>;
  update: (id: number, input: PlatformInput) => Promise<Platform>;
  remove: (id: number) => Promise<void>;
}

function byName(a: Platform, b: Platform): number {
  return a.name.localeCompare(b.name, "fr");
}

export function usePlatforms(): UsePlatforms {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Notice | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    fetchPlatforms(controller.signal)
      .then((list) => setPlatforms([...list].sort(byName)))
      .catch((err: unknown) => {
        if (!isAbortError(err)) setLoadError(errorNotice(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const create = useCallback(async (input: PlatformInput) => {
    const created = await createPlatform(input);
    setPlatforms((prev) => [...prev, created].sort(byName));
    return created;
  }, []);

  const update = useCallback(async (id: number, input: PlatformInput) => {
    const saved = await updatePlatform(id, input);
    setPlatforms((prev) => prev.map((p) => (p.id === id ? saved : p)).sort(byName));
    return saved;
  }, []);

  const remove = useCallback(async (id: number) => {
    await deletePlatform(id);
    setPlatforms((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { platforms, loading, loadError, reload, create, update, remove };
}
