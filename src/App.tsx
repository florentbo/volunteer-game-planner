import { useState, useEffect } from 'react';
import type { Game } from './types/Game';
import type { IDatabase } from './database/IDatabase';
import GameList from './components/GameList';
import AddGameForm from './components/AddGameForm';
import ClaimGameDialog from './components/ClaimGameDialog';
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
  const [pin, setPin] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = db.subscribe(setGames);
    db.getGames().then(setGames);
    return unsubscribe;
  }, [db]);

  const handleClaimClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setClaimDialogOpen(true);
  };

  const handleClaimConfirm = (parent: string, children: string) => {
    if (selectedGameId) {
      db.claimGame(selectedGameId, parent, children);
      setClaimDialogOpen(false);
      setSelectedGameId('');
    }
  };

  const handleClaimCancel = () => {
    setClaimDialogOpen(false);
    setSelectedGameId('');
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {isManager && <AddGameForm onAdd={handleAddGame} />}
            <Box>
              <GameList games={games} onClaim={handleClaimClick} />
            </Box>
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
        <ClaimGameDialog
          open={claimDialogOpen}
          onClose={handleClaimCancel}
          onConfirm={handleClaimConfirm}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
