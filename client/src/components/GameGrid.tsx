import type { Game } from "../api/types";
import { GameTile } from "./GameTile";

interface GameGridProps {
  games: Game[];
  pendingIds: ReadonlySet<number>;
  onOpen: (game: Game) => void;
}

export function GameGrid({ games, pendingIds, onOpen }: GameGridProps) {
  return (
    <ul className="shelf">
      {games.map((game) => (
        <GameTile key={game.id} game={game} busy={pendingIds.has(game.id)} onOpen={onOpen} />
      ))}
    </ul>
  );
}
