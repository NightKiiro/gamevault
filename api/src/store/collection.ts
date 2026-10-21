import fs from "node:fs";
import path from "node:path";
import { isRecord } from "../validation/result";

export interface Entity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type InputOf<T extends Entity> = Omit<T, keyof Entity>;

export interface Collection<T extends Entity> {
  list(): T[];
  get(id: number): T | undefined;
  create(input: InputOf<T>): T;
  update(id: number, patch: Partial<InputOf<T>>): T | undefined;
  replace(id: number, input: InputOf<T>): T | undefined;
  remove(id: number): boolean;
}

export interface CollectionOptions<T extends Entity> {
  label: string;
  filePath: string | null;
  seed: InputOf<T>[];
  parseInput: (raw: unknown) => InputOf<T> | null;
  build: (meta: Entity, input: InputOf<T>) => T;
}

interface Snapshot<T> {
  nextId: number;
  items: T[];
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function createCollection<T extends Entity>(options: CollectionOptions<T>): Collection<T> {
  const { label, filePath, parseInput, build } = options;
  const items = new Map<number, T>();
  let nextId = 1;

  function parseStored(raw: unknown): T | null {
    if (!isRecord(raw)) return null;
    const { id, createdAt, updatedAt } = raw;
    if (typeof id !== "number" || !Number.isInteger(id) || id < 1) return null;
    if (!isIsoDate(createdAt) || !isIsoDate(updatedAt)) return null;
    const input = parseInput(raw);
    return input === null ? null : build({ id, createdAt, updatedAt }, input);
  }

  function readSnapshot(file: string): Snapshot<T> | null {
    if (!fs.existsSync(file)) return null;
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (err) {
      const backup = `${file}.corrupt-${Date.now()}`;
      console.error(`[${label}] ${file} illisible, sauvegardé dans ${backup}, on repart du seed :`, err);
      fs.renameSync(file, backup);
      return null;
    }
    if (!isRecord(raw)) return null;
    const list = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.games) ? raw.games : null;
    if (list === null) return null;

    const parsed: T[] = [];
    for (const entry of list) {
      const item = parseStored(entry);
      if (item === null) console.warn(`[${label}] élément invalide ignoré :`, JSON.stringify(entry));
      else parsed.push(item);
    }
    const maxId = parsed.reduce((max, item) => Math.max(max, item.id), 0);
    const storedNextId = typeof raw.nextId === "number" && Number.isInteger(raw.nextId) ? raw.nextId : 0;
    return { nextId: Math.max(storedNextId, maxId + 1), items: parsed };
  }

  function persist(): void {
    if (filePath === null) return;
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const tmp = `${filePath}.tmp`;
      const snapshot: Snapshot<T> = { nextId, items: [...items.values()] };
      fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), "utf-8");
      fs.renameSync(tmp, filePath);
    } catch (err) {
      console.error(`[${label}] échec de sauvegarde :`, err);
    }
  }

  function insert(input: InputOf<T>): T {
    const now = new Date().toISOString();
    const item = build({ id: nextId, createdAt: now, updatedAt: now }, input);
    nextId += 1;
    items.set(item.id, item);
    return item;
  }

  function stripMeta(item: T): InputOf<T> {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = item;
    return input;
  }

  const loaded = filePath === null ? null : readSnapshot(filePath);
  if (loaded !== null) {
    for (const item of loaded.items) items.set(item.id, item);
    nextId = loaded.nextId;
  } else {
    for (const input of options.seed) insert(input);
    persist();
  }

  function replaceItem(current: T, input: InputOf<T>): T {
    const next = build({ id: current.id, createdAt: current.createdAt, updatedAt: new Date().toISOString() }, input);
    items.set(next.id, next);
    persist();
    return structuredClone(next);
  }

  return {
    list() {
      return [...items.values()].map((item) => structuredClone(item));
    },

    get(id) {
      const item = items.get(id);
      return item === undefined ? undefined : structuredClone(item);
    },

    create(input) {
      const item = insert(input);
      persist();
      return structuredClone(item);
    },

    update(id, patch) {
      const current = items.get(id);
      if (current === undefined) return undefined;
      return replaceItem(current, { ...stripMeta(current), ...patch });
    },

    replace(id, input) {
      const current = items.get(id);
      if (current === undefined) return undefined;
      return replaceItem(current, input);
    },

    remove(id) {
      const existed = items.delete(id);
      if (existed) persist();
      return existed;
    },
  };
}
