import type { Game, Platform, PlatformInput } from "../api/types";
import type { Notice } from "../lib/errors";
import { plural } from "../lib/library";
import { PlatformCard } from "./PlatformCard";
import { PlatformForm } from "./PlatformForm";

interface PlatformsPageProps {
  platforms: Platform[];
  games: Game[];
  loading: boolean;
  loadError: Notice | null;
  onReload: () => void;
  onCreate: (input: PlatformInput) => Promise<void>;
  onUpdate: (platform: Platform, input: PlatformInput) => Promise<void>;
  onDelete: (platform: Platform) => Promise<void>;
  onShowGames: (platform: Platform) => void;
}

export function PlatformsPage({
  platforms,
  games,
  loading,
  loadError,
  onReload,
  onCreate,
  onUpdate,
  onDelete,
  onShowGames,
}: PlatformsPageProps) {
  const linkedCount = games.filter((g) => g.platformId !== undefined).length;

  return (
    <section className="platforms" aria-labelledby="platforms-title">
      <div className="library-head">
        <h1 id="platforms-title" className="page-title">Plateformes</h1>
        {!loading && loadError === null && (
          <p className="library-summary">
            {plural(platforms.length, "plateforme")}, {plural(linkedCount, "jeu rangé", "jeux rangés")}
          </p>
        )}
      </div>

      {loading && <p className="loading">Chargement des plateformes…</p>}

      {!loading && loadError !== null && (
        <div className="state-panel" role="alert">
          <h2>Les plateformes ne répondent pas</h2>
          <p>{loadError.message}</p>
          <button type="button" className="btn btn-primary" onClick={onReload}>
            Réessayer
          </button>
        </div>
      )}

      {!loading && loadError === null && (
        <div className="platforms-layout">
          <aside className="panel platform-new">
            <h2>Nouvelle plateforme</h2>
            <PlatformForm others={platforms} submitLabel="Ajouter" onSubmit={onCreate} resetOnSuccess />
          </aside>

          {platforms.length === 0 ? (
            <p className="empty">Aucune plateforme pour l'instant. Ajoute la première avec le formulaire.</p>
          ) : (
            <ul className="platform-grid">
              {platforms.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  games={games.filter((g) => g.platformId === platform.id)}
                  others={platforms.filter((p) => p.id !== platform.id)}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onShowGames={onShowGames}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
