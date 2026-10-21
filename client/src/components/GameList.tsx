import type { Game } from "../api/types";
import { GameCard } from "./GameCard";

interface GameListProps {
  games: Game[];
  pendingIds: ReadonlySet<number>;
  onToggle: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}

export function GameList({ games, pendingIds, onToggle, onEdit, onDelete }: GameListProps) {
  if (games.length === 0) {
    return <p className="empty">Aucun jeu pour l'instant. Ajoute le premier !</p>;
  }
  return (
    <ul className="grid">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          busy={pendingIds.has(game.id)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
