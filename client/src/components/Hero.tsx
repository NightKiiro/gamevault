import type { Game } from "../api/types";
import { Cover } from "./Cover";
import { Rating } from "./Rating";

interface HeroProps {
  game: Game;
  busy: boolean;
  onOpen: (game: Game) => void;
  onToggle: (game: Game) => void;
}

export function Hero({ game, busy, onOpen, onToggle }: HeroProps) {
  const details = [game.platform, game.genre];
  if (game.releaseYear !== undefined) details.push(String(game.releaseYear));

  return (
    <section className="hero" aria-labelledby="hero-title">
      <Cover src={game.backdropUrl} fallbackSrc={game.coverUrl} title={game.title} className="hero-backdrop" decorative />
      <div className="hero-shade" />

      <div className="hero-content">
        <p className="hero-kicker">{game.completed ? "Ton jeu le mieux noté" : "Ta prochaine partie"}</p>
        <h1 id="hero-title" className="hero-title">{game.title}</h1>
        <ul className="chips">
          {details.map((d) => (
            <li key={d} className="chip">{d}</li>
          ))}
        </ul>
        <div className="hero-stats">
          <Rating value={game.rating} size="lg" />
          {game.hoursPlayed !== undefined && <span className="hero-hours">{game.hoursPlayed} h de jeu</span>}
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => onOpen(game)}>
            Voir la fiche
          </button>
          <button type="button" className="btn btn-glass" disabled={busy} onClick={() => onToggle(game)}>
            {game.completed ? "Remettre en cours" : "Marquer comme terminé"}
          </button>
        </div>
      </div>

      <div className="hero-cover-wrap">
        <Cover src={game.coverUrl} title={game.title} className="hero-cover" />
      </div>
    </section>
  );
}
