import type { Game } from '../types/Game';
import type { IDatabase } from './IDatabase';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

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
    logger.log('🔍 SupabaseDatabase.getGames() called');
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true });

    logger.log('📊 Supabase response:', { data, error });

    if (error) {
      logger.error('❌ Supabase error:', error);
      throw new Error(`Failed to fetch games: ${error.message}`);
    }

    logger.log('🗃️ Raw data from Supabase:', data);

    // Transform Supabase data to match our Game type
    const transformedGames = data.map((row) => ({
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

    logger.log('🎮 Transformed games:', transformedGames);
    return transformedGames;
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
    // Atomic claim: only update if volunteer_parent is null (game not claimed)
    const { data, error } = await supabase
      .from('games')
      .update({
        volunteer_parent: parent,
        volunteer_children: children,
      })
      .eq('id', gameId)
      .is('volunteer_parent', null) // Atomic condition: only claim if not already claimed
      .select()
      .single();

    if (error) {
      // Handle the specific case where the game was already claimed
      if (error.code === 'PGRST116') {
        throw new Error('Game already claimed');
      }
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
