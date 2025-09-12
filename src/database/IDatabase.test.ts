import { describe, it, expect } from 'vitest';
import type { IDatabase } from './IDatabase';
import type { Game } from '../types/Game';

describe('IDatabase interface', () => {
  it('should compile with a class that implements it', () => {
    class MockDb implements IDatabase {
      getGames(): Promise<Game[]> {
        return Promise.resolve([]);
      }
      addGame(game: Omit<Game, 'id' | 'volunteer'>): Promise<Game> {
        const newGame: Game = {
          ...game,
          id: '1',
          volunteer: null,
        };
        return Promise.resolve(newGame);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // @ts-ignore
      claimGame(gameId: string, volunteer: string): Promise<Game> {
        throw new Error('Method not implemented.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // @ts-ignore
      releaseGame(gameId: string): Promise<Game> {
        throw new Error('Method not implemented.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // @ts-ignore
      subscribe(callback: (games: Game[]) => void): () => void {
        throw new Error('Method not implemented.');
      }
    }
    expect(new MockDb()).toBeInstanceOf(MockDb);
  });
});
