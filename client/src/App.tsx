import { useState } from "react";
import type { Game, GameInput } from "./api/types";
import { useGames } from "./hooks/useGames";
import { errorNotice, successNotice } from "./lib/errors";
import type { Notice } from "./lib/errors";
import { valuesFromGame } from "./lib/gameForm";
import { GameForm } from "./components/GameForm";
import { GameList } from "./components/GameList";
import { NoticeBanner } from "./components/NoticeBanner";

export function App() {
  const { games, loading, loadError, pendingIds, reload, create, update, remove } = useGames();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editing, setEditing] = useState<Game | null>(null);

  const doneCount = games.filter((g) => g.completed).length;

  async function handleCreate(input: GameInput): Promise<boolean> {
    try {
      const created = await create(input);
      setNotice(successNotice(`« ${created.title} » ajouté`));
      return true;
    } catch (err) {
      setNotice(errorNotice(err));
      return false;
    }
  }

  async function handleEdit(input: GameInput): Promise<boolean> {
    if (editing === null) return false;
    try {
      const updated = await update(editing.id, input);
      setNotice(successNotice(`« ${updated.title} » modifié`));
      setEditing(null);
      return true;
    } catch (err) {
      setNotice(errorNotice(err));
      return false;
    }
  }

  async function handleToggle(game: Game): Promise<void> {
    try {
      await update(game.id, { completed: !game.completed });
    } catch (err) {
      setNotice(errorNotice(err));
    }
  }

  async function handleDelete(game: Game): Promise<void> {
    try {
      await remove(game.id);
      if (editing?.id === game.id) setEditing(null);
      setNotice(successNotice(`« ${game.title} » supprimé`));
    } catch (err) {
      setNotice(errorNotice(err));
    }
  }

  return (
    <>
      <header className="header">
        <h1>🎮 GameVault</h1>
        {!loading && loadError === null && (
          <span className="counter">
            {games.length} jeux · {doneCount} terminés
          </span>
        )}
      </header>

      <main className="layout">
        <section className="panel">
          <h2>{editing === null ? "Ajouter un jeu" : `Modifier « ${editing.title} »`}</h2>
          {editing === null ? (
            <GameForm key="create" submitLabel="Ajouter" onSubmit={handleCreate} />
          ) : (
            <GameForm
              key={editing.id}
              initialValues={valuesFromGame(editing)}
              submitLabel="Enregistrer"
              onSubmit={handleEdit}
              onCancel={() => setEditing(null)}
            />
          )}
        </section>

        <section className="panel panel-wide">
          <NoticeBanner notice={notice} onClose={() => setNotice(null)} />

          {loading && <p className="loading">Chargement de la bibliothèque…</p>}

          {!loading && loadError !== null && (
            <div className="load-error">
              <NoticeBanner notice={loadError} />
              <button type="button" className="btn btn-primary" onClick={reload}>
                Réessayer
              </button>
            </div>
          )}

          {!loading && loadError === null && (
            <GameList
              games={games}
              pendingIds={pendingIds}
              onToggle={(g) => void handleToggle(g)}
              onEdit={setEditing}
              onDelete={(g) => void handleDelete(g)}
            />
          )}
        </section>
      </main>
    </>
  );
}
