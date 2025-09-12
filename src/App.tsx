import { useState, useEffect } from 'react';
import type { Game } from './types/Game';
import type { IDatabase } from './database/IDatabase';
import GameList from './components/GameList';
import AddGameForm from './components/AddGameForm';
import {
  Container,
  Typography,
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SettingsIcon from '@mui/icons-material/Settings';

const theme = createTheme();

const MANAGER_PIN = '1234';

type AppProps = {
  db: IDatabase;
};

function App({ db }: AppProps) {
  const [games, setGames] = useState<Game[]>([]);
  const currentVolunteer = 'test-user';
  const [pin, setPin] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribe(setGames);
    db.getGames().then(setGames);
    return unsubscribe;
  }, [db]);

  const handleClaim = (gameId: string) => {
    if (currentVolunteer) {
      db.claimGame(gameId, currentVolunteer);
    }
  };

  const handleRelease = (gameId: string) => {
    db.releaseGame(gameId);
  };

  const handleAddGame = (game: Omit<Game, 'id' | 'volunteer'>) => {
    if (isManager) {
      db.addGame(game);
    }
  };

  const handlePinDialogToggle = () => {
    setPinDialogOpen(!pinDialogOpen);
    if (isManager) {
      setIsManager(false);
      setPin('');
    }
  };

  const handlePinSubmit = () => {
    if (pin === MANAGER_PIN) {
      setIsManager(true);
      setPinDialogOpen(false);
    } else {
      alert('Incorrect PIN');
    }
    setPin('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Game Schedule
            </Typography>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="manager-settings"
              onClick={handlePinDialogToggle}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md">
          <Box sx={{ my: 4 }}>
            {isManager && <AddGameForm onAdd={handleAddGame} />}
            <GameList
              games={games}
              onClaim={handleClaim}
              onRelease={handleRelease}
              currentVolunteer={currentVolunteer}
            />
          </Box>
        </Container>
        <Dialog open={pinDialogOpen} onClose={() => setPinDialogOpen(false)}>
          <DialogTitle>Manager Access</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="pin"
              label="Enter PIN"
              type="password"
              fullWidth
              variant="standard"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPinDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePinSubmit}>Login</Button>
          </DialogActions>
        </Dialog>
      </>
    </ThemeProvider>
  );
}

export default App;
