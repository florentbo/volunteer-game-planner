import { describe, it, expect } from 'vitest';
import { MockDatabase } from './MockDatabase';

describe('MockDatabase', () => {
  it('getGames should return an empty array initially', async () => {
    const db = new MockDatabase();
    const games = await db.getGames();
    expect(games).toEqual([]);
  });

  it('addGame should add a game', async () => {
    const db = new MockDatabase();
    const newGameData = {
      date: new Date(),
      opponent: 'Team C',
      isHome: false,
    };
    const addedGame = await db.addGame(newGameData);
    expect(addedGame.id).toBeDefined();
    expect(addedGame.opponent).toBe('Team C');
    expect(addedGame.volunteer).toBeNull();

    const games = await db.getGames();
    expect(games).toHaveLength(1);
    expect(games[0]).toEqual(addedGame);
  });

  it('claimGame should update volunteer field', async () => {
    const db = new MockDatabase();
    const addedGame = await db.addGame({
      date: new Date(),
      opponent: 'Team D',
      isHome: true,
    });

    const claimedGame = await db.claimGame(addedGame.id, 'Florent');
    expect(claimedGame.volunteer).toBe('Florent');

    const games = await db.getGames();
    expect(games[0].volunteer).toBe('Florent');
  });

  it('claimGame should prevent double-claiming', async () => {
    const db = new MockDatabase();
    const addedGame = await db.addGame({
      date: new Date(),
      opponent: 'Team E',
      isHome: true,
    });

    await db.claimGame(addedGame.id, 'Florent');
    await expect(db.claimGame(addedGame.id, 'John')).rejects.toThrow(
      'Game already claimed'
    );
  });

  it('releaseGame should clear volunteer field', async () => {
    const db = new MockDatabase();
    const addedGame = await db.addGame({
      date: new Date(),
      opponent: 'Team F',
      isHome: false,
    });
    await db.claimGame(addedGame.id, 'Florent');

    const releasedGame = await db.releaseGame(addedGame.id);
    expect(releasedGame.volunteer).toBeNull();

    const games = await db.getGames();
    expect(games[0].volunteer).toBeNull();
  });

  it('subscribe should notify on changes', async () => {
    const db = new MockDatabase();
    let notifications = 0;
    db.subscribe(() => notifications++);

    await db.addGame({ date: new Date(), opponent: 'Team G', isHome: true });
    expect(notifications).toBe(1);

    const game = (await db.getGames())[0];
    await db.claimGame(game.id, 'Florent');
    expect(notifications).toBe(2);

    await db.releaseGame(game.id);
    expect(notifications).toBe(3);
  });

  it('unsubscribe should stop notifications', async () => {
    const db = new MockDatabase();
    let notifications = 0;
    const unsubscribe = db.subscribe(() => notifications++);

    await db.addGame({ date: new Date(), opponent: 'Team H', isHome: false });
    expect(notifications).toBe(1);

    unsubscribe();

    await db.addGame({ date: new Date(), opponent: 'Team I', isHome: true });
    expect(notifications).toBe(1);
  });
});
