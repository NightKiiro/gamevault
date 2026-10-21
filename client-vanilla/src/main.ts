import "./style.css";
import type { Game } from "./types";
import { ApiError, createGame, deleteGame, fetchGames, updateGame } from "./api";
import { readGameForm } from "./form";
import { renderGames } from "./render";
import { el, requireElement } from "./dom";

const list = requireElement("#game-list", HTMLUListElement);
const form = requireElement("#game-form", HTMLFormElement);
const status = requireElement("#status", HTMLParagraphElement);
const counter = requireElement("#counter", HTMLSpanElement);
const submit = requireElement("#submit", HTMLButtonElement);

function showStatus(message: string, kind: "info" | "error" | "success", details: string[] = []): void {
  status.className = `status status-${kind}`;
  status.replaceChildren(document.createTextNode(message));
  if (details.length > 0) {
    status.append(el("ul", {}, details.map((d) => el("li", { text: d }))));
  }
}

function clearStatus(): void {
  status.className = "status";
  status.replaceChildren();
}

function reportError(err: unknown): void {
  if (err instanceof ApiError) showStatus(err.message, "error", err.details);
  else if (err instanceof Error) showStatus(err.message, "error");
  else showStatus("Erreur inconnue", "error");
}

async function refresh(): Promise<void> {
  showStatus("Chargement…", "info");
  try {
    const games = await fetchGames();
    renderGames(list, games, { onToggle: handleToggle, onDelete: handleDelete });
    const done = games.filter((g) => g.completed).length;
    counter.textContent = `${games.length} jeux · ${done} terminés`;
    clearStatus();
  } catch (err) {
    reportError(err);
  }
}

async function handleToggle(game: Game): Promise<void> {
  try {
    await updateGame(game.id, { completed: !game.completed });
    await refresh();
  } catch (err) {
    reportError(err);
  }
}

async function handleDelete(game: Game): Promise<void> {
  try {
    await deleteGame(game.id);
    await refresh();
    showStatus(`« ${game.title} » supprimé`, "success");
  } catch (err) {
    reportError(err);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void (async () => {
    const result = readGameForm(form);
    if (!result.ok) {
      showStatus("Formulaire invalide", "error", result.errors);
      return;
    }
    submit.disabled = true;
    try {
      const created = await createGame(result.value);
      form.reset();
      await refresh();
      showStatus(`« ${created.title} » ajouté`, "success");
    } catch (err) {
      reportError(err);
    } finally {
      submit.disabled = false;
    }
  })();
});

void refresh();
