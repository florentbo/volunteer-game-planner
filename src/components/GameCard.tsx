import type { Game } from '../types/Game';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

type GameCardProps = {
  game: Game;
  onClaim: (gameId: string) => void;
  onRelease: (gameId: string) => void;
  currentVolunteer: string | null;
};

const GameCard = ({ game, onClaim, onRelease, currentVolunteer }: GameCardProps) => {
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
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {gameDate}
          </Typography>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {gameTime}
          </Typography>
        </Box>
        <Typography variant="h5" component="div">
          {game.isHome ? 'vs' : '@'} {game.opponent}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {game.volunteer ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1">{game.volunteer}</Typography>
              {game.volunteer === currentVolunteer && (
                <Button size="small" variant="outlined" onClick={() => onRelease(game.id)}>
                  Release
                </Button>
              )}
            </Box>
          ) : (
            <Button variant="contained" onClick={() => onClaim(game.id)}>
              Claim
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GameCard;
