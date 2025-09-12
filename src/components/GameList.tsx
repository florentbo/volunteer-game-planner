import type { Game } from '../types/Game';
import GameCard from './GameCard';
import { Box, Typography } from '@mui/material';

type GameListProps = {
  games: Game[];
  onClaim: (gameId: string) => void;
  onRelease: (gameId: string) => void;
  currentVolunteer: string | null;
};

const GameList = ({ games, ...props }: GameListProps) => {
  if (games.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">No games scheduled.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} {...props} />
      ))}
    </Box>
  );
};

export default GameList;
