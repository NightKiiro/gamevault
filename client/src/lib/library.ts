import type { Game } from "../api/types";

export type StatusFilter = "all" | "playing" | "done";
export type SortKey = "recent" | "rating" | "title" | "hours";

export interface LibraryView {
  query: string;
  status: StatusFilter;
  platform: string;
  sort: SortKey;
}

export const ALL_PLATFORMS = "";

export const DEFAULT_VIEW: LibraryView = {
  query: "",
  status: "all",
  platform: ALL_PLATFORMS,
  sort: "recent",
};

export const SORT_LABELS: Record<SortKey, string> = {
  recent: "Ajout récent",
  rating: "Meilleure note",
  title: "Titre (A à Z)",
  hours: "Temps de jeu",
};

export function isSortKey(value: string): value is SortKey {
  return value in SORT_LABELS;
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
}

function matchesStatus(game: Game, status: StatusFilter): boolean {
  if (status === "done") return game.completed;
  if (status === "playing") return !game.completed;
  return true;
}

const COMPARATORS: Record<SortKey, (a: Game, b: Game) => number> = {
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title, "fr"),
  title: (a, b) => a.title.localeCompare(b.title, "fr"),
  hours: (a, b) => (b.hoursPlayed ?? 0) - (a.hoursPlayed ?? 0),
};

export function applyView(games: Game[], view: LibraryView): Game[] {
  const query = normalize(view.query.trim());
  return games
    .filter((g) => matchesStatus(g, view.status))
    .filter((g) => view.platform === ALL_PLATFORMS || g.platform === view.platform)
    .filter((g) => query === "" || normalize(`${g.title} ${g.genre} ${g.platform}`).includes(query))
    .sort(COMPARATORS[view.sort]);
}

export function platformsOf(games: Game[]): string[] {
  return [...new Set(games.map((g) => g.platform))].sort((a, b) => a.localeCompare(b, "fr"));
}

export function pickFeatured(games: Game[]): Game | undefined {
  const byRating = [...games].sort(COMPARATORS.rating);
  return byRating.find((g) => !g.completed) ?? byRating[0];
}

export function totalHours(games: Game[]): number {
  return games.reduce((sum, g) => sum + (g.hoursPlayed ?? 0), 0);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}
