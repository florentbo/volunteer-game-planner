import { describe, it, expect } from 'vitest';
import { MockDatabase } from './MockDatabase';
import type { Game } from '../types/Game';

describe('MockDatabase', () => {
  it('getGames should return empty array initially', async () => {
    const db = new MockDatabase();
    const games = await db.getGames();
    expect(games).toEqual([]);
  });

  it('addGame should add a game with null volunteer', async () => {
    const db = new MockDatabase();
    const game = await db.addGame({
      date: new Date(),
      opponent: 'Team A',
      isHome: true,
    });

    expect(game.id).toBe('1');
    expect(game.volunteer).toBeNull();

    const games = await db.getGames();
    expect(games).toHaveLength(1);
    expect(games[0]).toEqual(game);
  });

  it('claimGame should set volunteer info', async () => {
    const db = new MockDatabase();
    const addedGame = await db.addGame({
      date: new Date(),
      opponent: 'Team D',
      isHome: true,
    });

    const claimedGame = await db.claimGame(
      addedGame.id,
      'Test Parent',
      'Test Children'
    );
    expect(claimedGame.volunteer).toEqual({
      parent: 'Test Parent',
      children: 'Test Children',
    });

    const games = await db.getGames();
    expect(games[0].volunteer).toEqual({
      parent: 'Test Parent',
      children: 'Test Children',
    });
  });

  it('claimGame should prevent double-claiming', async () => {
    const db = new MockDatabase();
    const addedGame = await db.addGame({
      date: new Date(),
      opponent: 'Team E',
      isHome: true,
    });

    await db.claimGame(addedGame.id, 'Test Parent', 'Test Children');
    await expect(
      db.claimGame(addedGame.id, 'Other Parent', 'Other Children')
    ).rejects.toThrow('Game already claimed');
  });

  it('claimGame should throw error for non-existent game', async () => {
    const db = new MockDatabase();
    await expect(
      db.claimGame('nonexistent', 'Test Parent', 'Test Children')
    ).rejects.toThrow('Game not found');
  });

  it('subscribe should notify of changes', async () => {
    const db = new MockDatabase();
    let receivedGames: Game[] = [];

    const unsubscribe = db.subscribe((games) => {
      receivedGames = games;
    });

    expect(receivedGames).toEqual([]);

    await db.addGame({
      date: new Date(),
      opponent: 'Team F',
      isHome: false,
    });

    expect(receivedGames).toHaveLength(1);
    expect(receivedGames[0].opponent).toBe('Team F');

    unsubscribe();
  });
});
