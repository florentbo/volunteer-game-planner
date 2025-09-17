import type { Game } from '../types/Game';
import type { IDatabase } from './IDatabase';
import { supabase } from '../lib/supabase';

export class SupabaseDatabase implements IDatabase {
  private subscribers: Array<(games: Game[]) => void> = [];

  constructor() {
    // Set up real-time subscription for the games table
    supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'games',
        },
        () => {
          // When any change happens, refetch and notify all subscribers
          this.getGames().then((games) => {
            this.subscribers.forEach((callback) => callback(games));
          });
        }
      )
      .subscribe();
  }

  async getGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch games: ${error.message}`);
    }

    // Transform Supabase data to match our Game type
    return data.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      opponent: row.opponent,
      isHome: row.is_home,
      volunteer:
        row.volunteer_parent && row.volunteer_children
          ? {
              parent: row.volunteer_parent,
              children: row.volunteer_children,
            }
          : null,
    }));
  }

  async addGame(game: Omit<Game, 'id' | 'volunteer'>): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: game.date.toISOString(),
        opponent: game.opponent,
        is_home: game.isHome,
        volunteer_parent: null,
        volunteer_children: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add game: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      opponent: data.opponent,
      isHome: data.is_home,
      volunteer: null,
    };
  }

  async claimGame(
    gameId: string,
    parent: string,
    children: string
  ): Promise<Game> {
    // First check if the game exists and is not already claimed
    const { data: existingGame, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (fetchError) {
      throw new Error(`Game not found: ${fetchError.message}`);
    }

    if (existingGame.volunteer_parent || existingGame.volunteer_children) {
      throw new Error('Game already claimed');
    }

    // Update the game with volunteer information
    const { data, error } = await supabase
      .from('games')
      .update({
        volunteer_parent: parent,
        volunteer_children: children,
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to claim game: ${error.message}`);
    }

    return {
      id: data.id,
      date: new Date(data.date),
      opponent: data.opponent,
      isHome: data.is_home,
      volunteer: {
        parent: data.volunteer_parent,
        children: data.volunteer_children,
      },
    };
  }

  subscribe(callback: (games: Game[]) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}
