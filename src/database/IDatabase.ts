import type { Game } from '../types/Game';

export interface IDatabase {
  getGames(): Promise<Game[]>;
  addGame(game: Omit<Game, 'id' | 'volunteer'>): Promise<Game>;
  claimGame(gameId: string, parent: string, children: string): Promise<Game>;
  subscribe(callback: (games: Game[]) => void): () => void;
}
