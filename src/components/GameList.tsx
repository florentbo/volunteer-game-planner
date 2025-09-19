import type { Game } from '../types/Game';
import GameCard from './GameCard';

type GameListProps = {
  games: Game[];
  onClaim: (gameId: string) => void;
};

const GameList = ({ games, ...props }: GameListProps) => {
  if (games.length === 0) {
    return (
      <div className="flex min-h-[200px] w-full flex-1 items-center justify-center">
        <h2 className="text-center text-lg text-gray-500">
          No games scheduled.
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} {...props} />
      ))}
    </div>
  );
};

export default GameList;
