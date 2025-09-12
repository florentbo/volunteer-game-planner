import type { Game } from '../types/Game';
import type { IDatabase } from './IDatabase';

export class MockDatabase implements IDatabase {
  private games: Game[] = [];

  async getGames(): Promise<Game[]> {
    return Promise.resolve(this.games);
  }

  private nextId = 1;

  async addGame(game: Omit<Game, 'id' | 'volunteer'>): Promise<Game> {
    const newGame: Game = {
      ...game,
      id: (this.nextId++).toString(),
      volunteer: null,
    };
    this.games.push(newGame);
    this.notifySubscribers();
    return Promise.resolve(newGame);
  }
  async claimGame(gameId: string, volunteer: string): Promise<Game> {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    if (game.volunteer) {
      throw new Error('Game already claimed');
    }
    game.volunteer = volunteer;
    this.notifySubscribers();
    return Promise.resolve(game);
  }
  async releaseGame(gameId: string): Promise<Game> {
    const game = this.games.find((g) => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    game.volunteer = null;
    this.notifySubscribers();
    return Promise.resolve(game);
  }
  private subscribers: ((games: Game[]) => void)[] = [];

  private notifySubscribers() {
    this.subscribers.forEach((cb) => cb([...this.games]));
  }

  subscribe(callback: (games: Game[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }
}
