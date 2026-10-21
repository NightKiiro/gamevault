import { isRecord } from "../validation/result";

export interface CoverCandidate {
  appId: number;
  name: string;
  coverUrl: string;
  backdropUrl: string;
  thumbUrl: string;
}

export type CoverSearch = (query: string) => Promise<CoverCandidate[]>;

const STEAM_CDN = "https://cdn.akamai.steamstatic.com/steam/apps";
const STEAM_SEARCH = "https://store.steampowered.com/api/storesearch/";
const MAX_RESULTS = 8;
const TIMEOUT_MS = 5000;

export function steamArt(appId: number): { coverUrl: string; backdropUrl: string } {
  return {
    coverUrl: `${STEAM_CDN}/${appId}/library_600x900.jpg`,
    backdropUrl: `${STEAM_CDN}/${appId}/library_hero.jpg`,
  };
}

function toCandidate(item: unknown): CoverCandidate | null {
  if (!isRecord(item)) return null;
  const { id, name, type } = item;
  if (typeof id !== "number" || !Number.isInteger(id) || typeof name !== "string") return null;
  if (type !== undefined && type !== "app") return null;
  return { appId: id, name, ...steamArt(id), thumbUrl: `${STEAM_CDN}/${id}/header.jpg` };
}

export const searchSteamCovers: CoverSearch = async (query) => {
  const url = new URL(STEAM_SEARCH);
  url.searchParams.set("term", query);
  url.searchParams.set("l", "french");
  url.searchParams.set("cc", "FR");

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Steam a répondu ${res.status}`);

  const body: unknown = await res.json();
  if (!isRecord(body) || !Array.isArray(body.items)) return [];

  const candidates: CoverCandidate[] = [];
  for (const item of body.items) {
    const candidate = toCandidate(item);
    if (candidate !== null) candidates.push(candidate);
    if (candidates.length >= MAX_RESULTS) break;
  }
  return candidates;
};
