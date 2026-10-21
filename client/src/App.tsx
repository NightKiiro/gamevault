import { useCallback, useMemo, useState } from "react";
import type { Game, GameInput } from "./api/types";
import { useGames } from "./hooks/useGames";
import { useTheme } from "./hooks/useTheme";
import { errorNotice, successNotice } from "./lib/errors";
import type { Notice } from "./lib/errors";
import { valuesFromGame } from "./lib/gameForm";
import { DEFAULT_VIEW, applyView, pickFeatured, platformsOf, plural, totalHours } from "./lib/library";
import type { LibraryView } from "./lib/library";
import { TopBar } from "./components/TopBar";
import { Hero } from "./components/Hero";
import { Toolbar } from "./components/Toolbar";
import { GameGrid } from "./components/GameGrid";
import { GameDetail } from "./components/GameDetail";
import { GameForm } from "./components/GameForm";
import { Modal } from "./components/Modal";
import { Toast } from "./components/Toast";

type FormState = { mode: "create" } | { mode: "edit"; game: Game } | null;

export function App() {
  const { games, loading, loadError, pendingIds, reload, refreshOne, create, update, remove } = useGames();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<LibraryView>(DEFAULT_VIEW);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const clearNotice = useCallback(() => setNotice(null), []);

  const visible = useMemo(() => applyView(games, view), [games, view]);
  const platforms = useMemo(() => platformsOf(games), [games]);
  const featured = useMemo(() => pickFeatured(games), [games]);
  const doneCount = games.filter((g) => g.completed).length;
  const counts = { all: games.length, playing: games.length - doneCount, done: doneCount };
  const detailGame = detailId === null ? undefined : games.find((g) => g.id === detailId);
  const isFiltered = view.query !== "" || view.status !== "all" || view.platform !== DEFAULT_VIEW.platform;

  async function handleCreate(input: GameInput): Promise<boolean> {
    try {
      const created = await create(input);
      setForm(null);
      setNotice(successNotice(`${created.title} a rejoint ta bibliothèque`));
      return true;
    } catch (err) {
      setNotice(errorNotice(err));
      return false;
    }
  }

  async function handleEdit(game: Game, input: GameInput): Promise<boolean> {
    try {
      const updated = await update(game.id, input);
      setForm(null);
      setNotice(successNotice(`${updated.title} a été mis à jour`));
      return true;
    } catch (err) {
      setNotice(errorNotice(err));
      return false;
    }
  }

  async function handleToggle(game: Game): Promise<void> {
    try {
      const updated = await update(game.id, { completed: !game.completed });
      setNotice(successNotice(updated.completed ? `${updated.title} est terminé, bravo` : `${updated.title} est de retour en cours`));
    } catch (err) {
      const notice = errorNotice(err);
      setNotice({ ...notice, message: `${game.title} n'a pas pu être modifié : ${notice.message}` });
    }
  }

  async function handleDelete(game: Game): Promise<void> {
    setDetailId(null);
    try {
      await remove(game.id);
      setNotice(successNotice(`${game.title} a été retiré de ta bibliothèque`));
    } catch (err) {
      const notice = errorNotice(err);
      setNotice({ ...notice, message: `${game.title} n'a pas pu être supprimé et a été remis en place : ${notice.message}` });
    }
  }

  function openEdit(game: Game) {
    setDetailId(null);
    setForm({ mode: "edit", game });
  }

  return (
    <div className="app">
      <TopBar
        query={view.query}
        onQueryChange={(query) => setView((v) => ({ ...v, query }))}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAdd={() => setForm({ mode: "create" })}
      />

      <main className="page">
        {loading && (
          <div className="skeleton" aria-live="polite">
            <div className="skeleton-hero" />
            <p className="sr-only">Chargement de la bibliothèque</p>
            <ul className="shelf">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="skeleton-tile" />
              ))}
            </ul>
          </div>
        )}

        {!loading && loadError !== null && (
          <section className="state-panel" role="alert">
            <h1>La bibliothèque ne répond pas</h1>
            <p>{loadError.message}</p>
            <p className="state-hint">Lance l'API avec <code>npm run dev</code> dans le dossier <code>api</code>, puis réessaie.</p>
            <button type="button" className="btn btn-primary" onClick={reload}>
              Réessayer
            </button>
          </section>
        )}

        {!loading && loadError === null && games.length === 0 && (
          <section className="state-panel">
            <h1>Ta vitrine est vide</h1>
            <p>Ajoute un premier jeu : cherche-le sur Steam et sa jaquette s'affiche ici.</p>
            <button type="button" className="btn btn-primary" onClick={() => setForm({ mode: "create" })}>
              Ajouter un jeu
            </button>
          </section>
        )}

        {!loading && loadError === null && games.length > 0 && (
          <>
            {featured !== undefined && !isFiltered && (
              <Hero
                game={featured}
                busy={pendingIds.has(featured.id)}
                onOpen={(g) => setDetailId(g.id)}
                onToggle={(g) => void handleToggle(g)}
              />
            )}

            <section className="library" aria-labelledby="library-title">
              <div className="library-head">
                <h2 id="library-title">Ma bibliothèque</h2>
                <p className="library-summary">
                  {plural(games.length, "jeu", "jeux")}, {plural(doneCount, "terminé")}, {totalHours(games)} h de jeu au compteur
                </p>
              </div>

              <Toolbar view={view} platforms={platforms} counts={counts} onChange={setView} />

              {visible.length > 0 ? (
                <GameGrid games={visible} pendingIds={pendingIds} onOpen={(g) => setDetailId(g.id)} />
              ) : (
                <div className="no-results">
                  <p>Aucun jeu ne correspond à ces filtres.</p>
                  <button type="button" className="btn btn-ghost" onClick={() => setView(DEFAULT_VIEW)}>
                    Effacer les filtres
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Modal open={detailGame !== undefined} onClose={() => setDetailId(null)} labelledBy="detail-title" className="modal-detail">
        {detailGame !== undefined && (
          <GameDetail
            key={detailGame.id}
            game={detailGame}
            busy={pendingIds.has(detailGame.id)}
            onRefresh={refreshOne}
            onToggle={(g) => void handleToggle(g)}
            onEdit={openEdit}
            onDelete={(g) => void handleDelete(g)}
            onClose={() => setDetailId(null)}
          />
        )}
      </Modal>

      <Modal open={form !== null} onClose={() => setForm(null)} labelledBy="form-title" className="modal-form">
        {form?.mode === "create" && (
          <GameForm key="create" heading="Ajouter un jeu" submitLabel="Ajouter à la bibliothèque" onSubmit={handleCreate} onCancel={() => setForm(null)} />
        )}
        {form?.mode === "edit" && (
          <GameForm
            key={form.game.id}
            heading={`Modifier ${form.game.title}`}
            initialValues={valuesFromGame(form.game)}
            submitLabel="Enregistrer les modifications"
            onSubmit={(input) => handleEdit(form.game, input)}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <Toast notice={notice} onClose={clearNotice} />
    </div>
  );
}
