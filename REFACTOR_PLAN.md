# Lean Refactoring Plan

This document outlines a pragmatic, incremental refactoring plan. The goal is to improve clarity, atomicity, and testability without premature over-engineering. Each phase can be a separate pull request.

## Phase 1: Core Logic & Atomicity

This phase focuses on making the "claim" action safe from race conditions and centralizing business rules.

### 1. Define Core Domain & Errors

Create files for pure domain logic and custom error types.

**`src/domain/game.ts`**

```ts
// Defines the core Game type and pure functions for business rules.
export interface Game {
  id: string;
  date: Date;
  opponent: string;
  isHome: boolean;
  volunteer: string | null;
}

export function normalizeOpponent(raw: string): string {
  return raw.trim();
}

export function validateNewGame(d: {
  date: Date;
  opponent: string;
  isHome: boolean;
}): string[] {
  const errors: string[] = [];
  if (d.date.getTime() < Date.now()) errors.push('date_in_past');
  if (!d.opponent.trim()) errors.push('opponent_required');
  return errors;
}

export function canClaim(game: Game): boolean {
  return game.volunteer == null;
}
```

**`src/errors.ts`**

```ts
// Defines typed errors for better handling in the UI.
export class ValidationError extends Error {
  issues: string[];
  code = 'VALIDATION';
  constructor(issues: string[]) {
    super('Validation failed');
    this.issues = issues;
  }
}

export class ConflictError extends Error {
  code = 'CONFLICT';
}
export class NotFoundError extends Error {
  code = 'NOT_FOUND';
}
```

### 2. Create Repository Abstraction

Define a `GameRepository` interface (port) and implement it for Supabase, ensuring the `claim` method is atomic.

**`src/persistence/gameRepository.ts`** (Interface)

```ts
import { Game } from '../domain/game';

export interface GameRepository {
  list(): Promise<Game[]>;
  create(data: {
    date: Date;
    opponent: string;
    isHome: boolean;
  }): Promise<Game>;
  // Returns updated game if success, null if already claimed (atomic check)
  claimAtomic(gameId: string, volunteer: string): Promise<Game | null>;
  release(gameId: string): Promise<Game>;
  subscribe(onChange: (games: Game[]) => void): () => void;
}
```

**`src/persistence/supabaseGameRepository.ts`** (Implementation)

```ts
import { supabase } from '../lib/supabase';
import { Game } from '../domain/game';
import { GameRepository } from './gameRepository';

function rowToGame(r: any): Game {
  return {
    id: r.id,
    date: new Date(r.date),
    opponent: r.opponent,
    isHome: r.is_home,
    volunteer: r.volunteer,
  };
}

export class SupabaseGameRepository implements GameRepository {
  async list(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date');
    if (error) throw error;
    return data.map(rowToGame);
  }

  async create(d: {
    date: Date;
    opponent: string;
    isHome: boolean;
  }): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .insert({
        date: d.date.toISOString(),
        opponent: d.opponent,
        is_home: d.isHome,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToGame(data);
  }

  async claimAtomic(id: string, volunteer: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .update({ volunteer })
      .eq('id', id)
      .is('volunteer', null) // Ensures atomicity
      .select()
      .single();

    // Supabase returns PGRST116 error if no row is found, which is expected on conflict.
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null; // This means it was already claimed
    return rowToGame(data);
  }

  async release(id: string): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .update({ volunteer: null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToGame(data);
  }

  subscribe(onChange: (g: Game[]) => void): () => void {
    const channel = supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        async () => onChange(await this.list())
      )
      .subscribe();

    this.list().then(onChange).catch(console.error); // Initial load

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
```

## Phase 2: Service Layer & UI Integration

This phase introduces a thin service layer to orchestrate actions and connects it to the UI via hooks.

### 1. Create Service Layer

The service uses the repository and domain logic to perform use cases.

**`src/services/gameService.ts`**

```ts
import { GameRepository } from '../persistence/gameRepository';
import { ValidationError, ConflictError, NotFoundError } from '../errors';
import { validateNewGame } from '../domain/game';

export class GameService {
  constructor(private repo: GameRepository) {}

  listGames() {
    return this.repo.list();
  }

  async addGame(input: { date: Date; opponent: string; isHome: boolean }) {
    const issues = validateNewGame(input);
    if (issues.length) throw new ValidationError(issues);
    return this.repo.create(input);
  }

  async claimGame(id: string, volunteer: string) {
    const updated = await this.repo.claimAtomic(id, volunteer.trim());
    if (!updated) {
      // Optional: Check if the game exists to return a more specific error.
      const games = await this.repo.list();
      if (!games.some((g) => g.id === id))
        throw new NotFoundError('Game not found');
      throw new ConflictError('Already claimed');
    }
    return updated;
  }

  async releaseGame(id: string) {
    return this.repo.release(id);
  }

  subscribe(cb: (games: any[]) => void) {
    return this.repo.subscribe(cb);
  }
}
```

### 2. Create Provider and Hooks

Use React Context to provide the service and create hooks for easy component access.

**`src/context/GameServiceProvider.tsx`**

```tsx
import { createContext, useContext, useMemo } from 'react';
import { GameService } from '../services/gameService';
import { SupabaseGameRepository } from '../persistence/supabaseGameRepository';

const GameServiceContext = createContext<GameService | null>(null);

export function GameServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const service = useMemo(() => {
    const repo = new SupabaseGameRepository();
    return new GameService(repo);
  }, []);
  return (
    <GameServiceContext.Provider value={service}>
      {children}
    </GameServiceContext.Provider>
  );
}

export function useGameService() {
  const svc = useContext(GameServiceContext);
  if (!svc)
    throw new Error('useGameService must be used within a GameServiceProvider');
  return svc;
}
```

**`src/hooks/useGames.ts`**

```ts
import { useEffect, useState } from 'react';
import { useGameService } from '../context/GameServiceProvider';
import { Game } from '../domain/game';

export function useGames() {
  const service = useGameService();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = service.subscribe((updatedGames) => {
      setGames(updatedGames);
      setLoading(false);
    });

    // Handle initial error if subscription fails to load
    service.listGames().catch((e) => {
      setError(e);
      setLoading(false);
    });

    return unsubscribe;
  }, [service]);

  return { games, loading, error };
}
```

**`src/hooks/useClaimGame.ts`**

```ts
import { useState } from 'react';
import { useGameService } from '../context/GameServiceProvider';
import { ConflictError } from '../errors';

export function useClaimGame() {
  const service = useGameService();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const claim = async (gameId: string, volunteer: string) => {
    setIsPending(true);
    setError(null);
    try {
      await service.claimGame(gameId, volunteer);
    } catch (e: any) {
      setError(e);
      // Re-throw for component-level handling if needed
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return {
    claim,
    isPending,
    error,
    isConflict: error instanceof ConflictError,
  };
}
```

## Phase 3: Component Refactoring

Update the UI to use the new hooks and handle errors gracefully.

### Checklist:

1.  **Wrap App:** In `src/main.tsx` or `src/App.tsx`, wrap your main component tree with `<GameServiceProvider>`.
    ```tsx
    // src/main.tsx
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <GameServiceProvider>
          <App />
        </GameServiceProvider>
      </React.StrictMode>
    );
    ```
2.  **Refactor `GameList.tsx`:**
    - Remove the `db` prop.
    - Use `const { games, loading, error } = useGames();` to fetch data.
    - Render loading and error states.
3.  **Refactor `GameCard.tsx`:**
    - Remove the `db` prop.
    - Use `const { claim, isPending, isConflict } = useClaimGame();` for the claim action.
    - In the handler, call `claim(game.id, volunteerName)`.
    - Show a toast/snackbar if `isConflict` is true (e.g., "Game already claimed!").
    - Disable the button when `isPending` is true.
4.  **Refactor `AddGameForm.tsx`:**
    - Remove the `db` prop.
    - Use `useGameService()` to get the service instance.
    - Call `service.addGame(...)` and handle `ValidationError` to show field-specific errors.
5.  **Cleanup:**
    - Delete the old `src/database/IDatabase.ts` and `MockDatabase.ts` files.
    - Remove all `console.log` statements.
    - Remove any manual data refetching after a claim/release, as the real-time subscription now handles this automatically.
