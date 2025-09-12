import { describe, it, expect } from 'vitest';
import type { Game } from './Game';

describe('Game type', () => {
  it('should have the required fields', () => {
    const game: Game = {
      id: '1',
      date: new Date(),
      opponent: 'Team B',
      isHome: true,
      volunteer: null,
    };

    expect(game.id).toBe('1');
    expect(game.date).toBeInstanceOf(Date);
    expect(game.opponent).toBe('Team B');
    expect(game.isHome).toBe(true);
    expect(game.volunteer).toBeNull();
  });
});
