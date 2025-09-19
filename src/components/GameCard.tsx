import type { Game } from '../types/Game';

type GameCardProps = {
  game: Game;
  onClaim: (gameId: string) => void;
};

const GameCard = ({ game, onClaim }: GameCardProps) => {
  const gameDate = game.date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const gameTime = game.date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row">
        <span className="text-sm text-gray-500">{gameDate}</span>
        <span className="text-sm text-gray-500">{gameTime}</span>
      </div>

      <h3 className="mb-2 text-lg font-semibold">
        {game.isHome ? 'vs' : '@'} {game.opponent}
      </h3>

      {game.volunteer ? (
        <p className="text-sm">
          Parent: {game.volunteer.parent} | Enfants: {game.volunteer.children}
        </p>
      ) : (
        <button
          onClick={() => onClaim(game.id)}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Je m'en occupe
        </button>
      )}
    </div>
  );
};

export default GameCard;
