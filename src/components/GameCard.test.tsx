import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
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
    renderWithTheme(<GameCard game={mockGame} onClaim={() => {}} />);
    expect(screen.getByText('vs Team Opponent')).toBeInTheDocument();
    expect(screen.getByText(/Sun, Oct 26/)).toBeInTheDocument();
    expect(screen.getByText(/11:00 AM/)).toBeInTheDocument();
  });

  it('shows claim button when unclaimed', () => {
    renderWithTheme(<GameCard game={mockGame} onClaim={() => {}} />);
    expect(
      screen.getByRole('button', { name: /je m'en occupe/i })
    ).toBeInTheDocument();
  });

  it('calls onClaim when claim button is clicked', async () => {
    const onClaim = vi.fn();
    renderWithTheme(<GameCard game={mockGame} onClaim={onClaim} />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole('button', { name: /je m'en occupe/i })
      );
    });

    expect(onClaim).toHaveBeenCalledWith('1');
  });

  it('shows volunteer info when claimed', () => {
    const claimedGame = {
      ...mockGame,
      volunteer: { parent: 'Test Parent', children: 'Test Children' },
    };
    renderWithTheme(<GameCard game={claimedGame} onClaim={() => {}} />);
    expect(
      screen.getByText(/Parent: Test Parent \| Enfants: Test Children/)
    ).toBeInTheDocument();
  });

  it('does not show claim button when already claimed', () => {
    const claimedGame = {
      ...mockGame,
      volunteer: { parent: 'Test Parent', children: 'Test Children' },
    };
    renderWithTheme(<GameCard game={claimedGame} onClaim={() => {}} />);
    expect(
      screen.queryByRole('button', { name: /je m'en occupe/i })
    ).not.toBeInTheDocument();
  });
});
