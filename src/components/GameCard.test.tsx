import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import GameCard from './GameCard';
import type { Game } from '../types/Game';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockGame: Game = {
  id: '1',
  date: new Date('2025-10-26T10:00:00Z'),
  opponent: 'Team Opponent',
  isHome: true,
  volunteer: null,
};

describe('GameCard', () => {
  it('renders game date and opponent', () => {
    renderWithTheme(<GameCard game={mockGame} onClaim={() => {}} onRelease={() => {}} currentVolunteer={null} />);
    expect(screen.getByText('vs Team Opponent')).toBeInTheDocument();
    expect(screen.getByText(/Sun, Oct 26/)).toBeInTheDocument();
    expect(screen.getByText(/11:00 AM/)).toBeInTheDocument();
  });

  it('shows claim button when unclaimed', () => {
    renderWithTheme(<GameCard game={mockGame} onClaim={() => {}} onRelease={() => {}} currentVolunteer={null} />);
    expect(screen.getByRole('button', { name: /claim/i })).toBeInTheDocument();
  });

  it('calls onClaim when claim button is clicked', async () => {
    const onClaim = vi.fn();
    renderWithTheme(<GameCard game={mockGame} onClaim={onClaim} onRelease={() => {}} currentVolunteer={null} />);
    await userEvent.click(screen.getByRole('button', { name: /claim/i }));
    expect(onClaim).toHaveBeenCalledWith('1');
  });

  it('shows volunteer name when claimed', () => {
    const claimedGame = { ...mockGame, volunteer: 'Florent' };
    renderWithTheme(<GameCard game={claimedGame} onClaim={() => {}} onRelease={() => {}} currentVolunteer="Florent" />);
    expect(screen.getByText('Florent')).toBeInTheDocument();
  });

  it('shows release button for own claims', () => {
    const claimedGame = { ...mockGame, volunteer: 'Florent' };
    renderWithTheme(<GameCard game={claimedGame} onClaim={() => {}} onRelease={() => {}} currentVolunteer="Florent" />);
    expect(screen.getByRole('button', { name: /release/i })).toBeInTheDocument();
  });
});
