import { useState, useEffect } from 'react';
import type { Game } from './types/Game';
import type { IDatabase } from './database/IDatabase';
import GameList from './components/GameList';
import AddGameForm from './components/AddGameForm';
import ClaimGameDialog from './components/ClaimGameDialog';

const MANAGER_PIN = import.meta.env.VITE_MANAGER_PIN || '1234';

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
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = db.subscribe(setGames);
    db.getGames().then(setGames);
    return unsubscribe;
  }, [db]);

  const handleClaimClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setClaimDialogOpen(true);
  };

  const handleClaimConfirm = async (parent: string, children: string) => {
    if (!selectedGameId) {
      return;
    }

    try {
      setErrorMessage(''); // Clear any previous errors
      await db.claimGame(selectedGameId, parent, children);
      // Immediately refresh the games list for instant UI update
      const updatedGames = await db.getGames();
      setGames(updatedGames);
      // On success, close dialog and reset state
      setClaimDialogOpen(false);
      setSelectedGameId('');
    } catch (error) {
      // Show user-friendly error message
      const message =
        error instanceof Error ? error.message : 'Une erreur est survenue';
      setErrorMessage(message);
      // Keep dialog open so user can try again
    }
  };

  const handleClaimCancel = () => {
    setClaimDialogOpen(false);
    setSelectedGameId('');
    setErrorMessage('');
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

  const handlePinDialogClose = () => {
    setPinDialogOpen(false);
  };

  const handlePinBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handlePinDialogClose();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Qui apporte les fruits ?</h1>
            <button
              onClick={handlePinDialogToggle}
              className="rounded-md p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="manager-settings"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4">
        <div className="space-y-4">
          {isManager && <AddGameForm onAdd={handleAddGame} />}
          <GameList games={games} onClaim={handleClaimClick} />
        </div>
      </main>

      {/* PIN Dialog */}
      {pinDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handlePinBackdropClick}
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Manager Access</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handlePinDialogClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <ClaimGameDialog
        open={claimDialogOpen}
        onClose={handleClaimCancel}
        onConfirm={handleClaimConfirm}
        errorMessage={errorMessage}
      />
    </div>
  );
}

export default App;
