import { useState } from 'react';
import type { Game } from '../types/Game';
import { TextField, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

type AddGameFormProps = {
  onAdd: (game: Omit<Game, 'id' | 'volunteer'>) => void;
};

const AddGameForm = ({ onAdd }: AddGameFormProps) => {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [isHome, setIsHome] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim() || !date) {
      setError('Opponent and date are required');
      return;
    }
    onAdd({
      opponent,
      date: new Date(date),
      isHome,
    });
    setOpponent('');
    setDate('');
    setIsHome(false);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h6">Add a New Game</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Opponent"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          required
        />
        <TextField
          label="Date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isHome}
              onChange={(e) => setIsHome(e.target.checked)}
            />
          }
          label="Home Game"
        />
        <Button type="submit" variant="contained">
          Add Game
        </Button>
      </Stack>
    </form>
  );
};

export default AddGameForm;
