import type { Game } from '../types/Game';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

type GameCardProps = {
  game: Game;
  onClaim: (gameId: string) => void;
  onRelease: (gameId: string) => void;
  currentVolunteer: string | null;
};

const GameCard = ({
  game,
  onClaim,
  onRelease,
  currentVolunteer,
}: GameCardProps) => {
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
          >
            <Typography variant="body1">{game.volunteer}</Typography>
            {game.volunteer === currentVolunteer && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onRelease(game.id)}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Release
              </Button>
            )}
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={() => onClaim(game.id)}
            sx={{ width: '100%' }}
          >
            Claim
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GameCard;
