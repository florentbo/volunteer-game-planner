import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import GameList from './GameList';
import type { Game } from '../types/Game';

const mockGames: Game[] = [
  { id: '1', date: new Date(), opponent: 'A', isHome: true, volunteer: null },
  {
    id: '2',
    date: new Date(),
    opponent: 'B',
    isHome: false,
    volunteer: { parent: 'Test Parent', children: 'Test Children' },
  },
];

describe('GameList', () => {
  it('renders multiple games', () => {
    render(<GameList games={mockGames} onClaim={() => {}} />);
    expect(screen.getByText('vs A')).toBeInTheDocument();
    expect(screen.getByText('@ B')).toBeInTheDocument();
  });

  it('shows "No games" when empty', () => {
    render(<GameList games={[]} onClaim={() => {}} />);
    expect(screen.getByText('No games scheduled.')).toBeInTheDocument();
  });
});
