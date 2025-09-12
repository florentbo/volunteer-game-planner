/* eslint-disable @typescript-eslint/no-unused-vars */
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
      // @ts-expect-error - Test implementation, parameters unused intentionally
      claimGame(gameId: string, volunteer: string): Promise<Game> {
        // Test implementation - method signature required by interface
        throw new Error('Method not implemented.');
      }
      // @ts-expect-error - Test implementation, parameters unused intentionally
      releaseGame(gameId: string): Promise<Game> {
        // Test implementation - method signature required by interface
        throw new Error('Method not implemented.');
      }
      // @ts-expect-error - Test implementation, parameters unused intentionally
      subscribe(callback: (games: Game[]) => void): () => void {
        // Test implementation - method signature required by interface
        throw new Error('Method not implemented.');
      }
    }
    expect(new MockDb()).toBeInstanceOf(MockDb);
  });
});
