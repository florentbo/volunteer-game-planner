import type { Game } from '../types/Game';
import GameCard from './GameCard';
import { Stack, Typography, Box } from '@mui/material';

type GameListProps = {
  games: Game[];
  onClaim: (gameId: string) => void;
  onRelease: (gameId: string) => void;
  currentVolunteer: string | null;
};

const GameList = ({ games, ...props }: GameListProps) => {
  if (games.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 200,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          No games scheduled.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} {...props} />
      ))}
    </Stack>
  );
};

export default GameList;
