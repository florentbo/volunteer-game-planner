import type { Game } from '../types/Game';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

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
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          mb={1}
        >
          <Typography variant="body2" color="text.secondary">
            {gameDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {gameTime}
          </Typography>
        </Stack>

        <Typography variant="h6" component="div" gutterBottom>
          {game.isHome ? 'vs' : '@'} {game.opponent}
        </Typography>

        {game.volunteer ? (
          <Typography variant="body1">
            Parent: {game.volunteer.parent} | Enfants: {game.volunteer.children}
          </Typography>
        ) : (
          <Button
            variant="contained"
            onClick={() => onClaim(game.id)}
            sx={{ width: '100%' }}
          >
            Je m'en occupe
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GameCard;
