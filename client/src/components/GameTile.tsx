import type { Game } from "../api/types";
import { Cover } from "./Cover";
import { Rating } from "./Rating";

interface GameTileProps {
  game: Game;
  busy: boolean;
  onOpen: (game: Game) => void;
}

export function GameTile({ game, busy, onOpen }: GameTileProps) {
  return (
    <li className={busy ? "tile tile-busy" : "tile"}>
      <button type="button" className="tile-button" onClick={() => onOpen(game)} aria-busy={busy}>
        <span className="tile-art">
          <Cover src={game.coverUrl} title={game.title} className="tile-cover" />
          {game.completed && (
            <span className="seal" title="Terminé">
              <span className="sr-only">Terminé</span>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
          )}
        </span>
        <span className="tile-title">{game.title}</span>
        <span className="tile-meta">
          <span>{game.platform}</span>
          <Rating value={game.rating} />
        </span>
      </button>
    </li>
  );
}
