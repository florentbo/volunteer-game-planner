import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import GameList from './GameList';
import type { Game } from '../types/Game';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockGames: Game[] = [
  { id: '1', date: new Date(), opponent: 'A', isHome: true, volunteer: null },
  { id: '2', date: new Date(), opponent: 'B', isHome: false, volunteer: 'Florent' },
];

describe('GameList', () => {
  it('renders multiple games', () => {
    renderWithTheme(<GameList games={mockGames} onClaim={() => {}} onRelease={() => {}} currentVolunteer="Florent" />);
    expect(screen.getByText('vs A')).toBeInTheDocument();
    expect(screen.getByText('@ B')).toBeInTheDocument();
  });

  it('shows "No games" when empty', () => {
    renderWithTheme(<GameList games={[]} onClaim={() => {}} onRelease={() => {}} currentVolunteer={null} />);
    expect(screen.getByText('No games scheduled.')).toBeInTheDocument();
  });
});
