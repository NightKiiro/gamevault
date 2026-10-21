import { useState } from "react";
import type { Game } from "../api/types";

interface GameCardProps {
  game: Game;
  busy: boolean;
  onToggle: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

export function GameCard({ game, busy, onToggle, onEdit, onDelete }: GameCardProps) {
  const [confirming, setConfirming] = useState(false);

  const meta = [game.platform, game.genre];
  if (game.releaseYear !== undefined) meta.push(String(game.releaseYear));
  if (game.hoursPlayed !== undefined) meta.push(`${game.hoursPlayed} h`);

  return (
    <li className={`card${game.completed ? " card-done" : ""}${busy ? " card-busy" : ""}`} aria-busy={busy}>
      <div className="card-head">
        <h3>{game.title}</h3>
        <span className="rating">{game.rating}/10</span>
      </div>
      <p className="meta">{meta.join(" · ")}</p>
      <span className="badge">{game.completed ? "Terminé" : "En cours"}</span>

      <div className="actions">
        {confirming ? (
          <>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={() => onDelete(game)}>
              Confirmer
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setConfirming(false)}>
              Annuler
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onToggle(game)}>
              {game.completed ? "En cours" : "Terminé"}
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => onEdit(game)}>
              Modifier
            </button>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={() => setConfirming(true)}>
              Supprimer
            </button>
          </>
        )}
      </div>
    </li>
  );
}
