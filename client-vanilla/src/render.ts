import type { Game } from "./types";
import { el } from "./dom";

export interface GameCardHandlers {
  onToggle: (game: Game) => void;
  onDelete: (game: Game) => void;
}

function gameCard(game: Game, handlers: GameCardHandlers): HTMLElement {
  const meta: string[] = [game.platform, game.genre];
  if (game.releaseYear !== undefined) meta.push(String(game.releaseYear));
  if (game.hoursPlayed !== undefined) meta.push(`${game.hoursPlayed} h`);

  const toggle = el("button", {
    className: "btn btn-ghost",
    text: game.completed ? "Marquer en cours" : "Marquer terminé",
  });
  toggle.type = "button";
  toggle.addEventListener("click", () => handlers.onToggle(game));

  const remove = el("button", { className: "btn btn-danger", text: "Supprimer" });
  remove.type = "button";
  remove.addEventListener("click", () => handlers.onDelete(game));

  return el("li", { className: game.completed ? "card card-done" : "card" }, [
    el("div", { className: "card-head" }, [
      el("h3", { text: game.title }),
      el("span", { className: "rating", text: `${game.rating}/10` }),
    ]),
    el("p", { className: "meta", text: meta.join(" · ") }),
    el("span", { className: "badge", text: game.completed ? "Terminé" : "En cours" }),
    el("div", { className: "actions" }, [toggle, remove]),
  ]);
}

export function renderGames(list: HTMLUListElement, games: Game[], handlers: GameCardHandlers): void {
  if (games.length === 0) {
    list.replaceChildren(el("li", { className: "empty", text: "Aucun jeu pour l'instant." }));
    return;
  }
  list.replaceChildren(...games.map((g) => gameCard(g, handlers)));
}
