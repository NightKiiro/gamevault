import { useEffect, useState } from "react";
import type { Game } from "../api/types";
import { isAbortError } from "../api/client";
import { errorNotice } from "../lib/errors";
import type { Notice } from "../lib/errors";
import { Cover } from "./Cover";
import { Rating } from "./Rating";

interface GameDetailProps {
  game: Game;
  busy: boolean;
  onRefresh: (id: number, signal: AbortSignal) => Promise<void>;
  onToggle: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onClose: () => void;
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "date inconnue" : dateFormat.format(date);
}

export function GameDetail({ game, busy, onRefresh, onToggle, onEdit, onDelete, onClose }: GameDetailProps) {
  const [confirming, setConfirming] = useState(false);
  const [refreshError, setRefreshError] = useState<Notice | null>(null);
  const { id } = game;

  useEffect(() => {
    const controller = new AbortController();
    onRefresh(id, controller.signal).catch((err: unknown) => {
      if (!isAbortError(err)) setRefreshError(errorNotice(err));
    });
    return () => controller.abort();
  }, [id, onRefresh]);

  return (
    <article className="detail">
      <div className="detail-banner">
        <Cover src={game.backdropUrl} fallbackSrc={game.coverUrl} title={game.title} className="detail-backdrop" decorative />
        <button type="button" className="icon-btn detail-close" onClick={onClose} aria-label="Fermer la fiche">
          ✕
        </button>
      </div>

      <div className="detail-body">
        <Cover src={game.coverUrl} title={game.title} className="detail-cover" />

        <div className="detail-main">
          <h2 id="detail-title" className="detail-title">{game.title}</h2>
          <div className="detail-status">
            <Rating value={game.rating} size="lg" />
            <span className={game.completed ? "status-pill status-done" : "status-pill"}>
              {game.completed ? "Terminé" : "En cours"}
            </span>
          </div>

          {refreshError !== null && <p className="inline-error">{refreshError.message}</p>}

          <dl className="facts">
            <div><dt>Plateforme</dt><dd>{game.platform}</dd></div>
            <div><dt>Genre</dt><dd>{game.genre}</dd></div>
            <div><dt>Sortie</dt><dd>{game.releaseYear ?? "Non renseignée"}</dd></div>
            <div><dt>Temps de jeu</dt><dd>{game.hoursPlayed === undefined ? "Non renseigné" : `${game.hoursPlayed} h`}</dd></div>
            <div><dt>Ajouté le</dt><dd>{formatDate(game.createdAt)}</dd></div>
            <div><dt>Modifié le</dt><dd>{formatDate(game.updatedAt)}</dd></div>
          </dl>

          <div className="detail-actions">
            {confirming ? (
              <>
                <span className="confirm-text">Supprimer {game.title} de la bibliothèque ?</span>
                <button type="button" className="btn btn-danger" disabled={busy} onClick={() => onDelete(game)}>
                  Supprimer
                </button>
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setConfirming(false)}>
                  Garder
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onToggle(game)}>
                  {game.completed ? "Remettre en cours" : "Marquer comme terminé"}
                </button>
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onEdit(game)}>
                  Modifier
                </button>
                <button type="button" className="btn btn-ghost btn-danger-text" disabled={busy} onClick={() => setConfirming(true)}>
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
