# Game Schedule Management App

This is a **Game Schedule Management App** built with React, TypeScript, and Vite. The app allows volunteers to claim and release games, with manager functionality behind a PIN-protected interface.

## Key Architecture Concepts

- **Database Abstraction**: Uses an `IDatabase` interface pattern for data access, implemented with `SupabaseDatabase` for PostgreSQL storage with real-time capabilities.
- **Component-based Structure**: React components organized by responsibility (GameList, GameCard, AddGameForm).
- **Material-UI Integration**: Uses MUI components with a consistent theme throughout the app.
- **Dependency Injection**: The database instance is injected into the App component via props for testability.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Supabase account (for `dev:env` mode)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd fruits-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project. You can copy the example file:

```bash
cp .env.example .env
```

Then, fill in the required values:

- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key.
- `VITE_MANAGER_PIN`: The PIN for the manager interface (defaults to `1234` if not set).

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload (using MockDatabase)
npm run dev:env          # Start dev server with Supabase environment

# Building
npm run build            # Type-check and build for production
npm run preview          # Preview production build locally

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix auto-fixable ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check if code is properly formatted
```

## Project Structure

```
src/
├── components/          # React components
│   ├── GameList.tsx    # Container for game cards
│   ├── GameCard.tsx    # Individual game display/interaction
│   └── AddGameForm.tsx # Manager-only game creation form
├── database/           # Data layer abstraction
│   ├── IDatabase.ts    # Database interface contract
│   └── MockDatabase.ts # In-memory implementation
│   └── SupabaseDatabase.ts # Supabase implementation
├── types/              # TypeScript type definitions
│   └── Game.ts         # Core Game type
└── test/               # Test utilities and setup
    └── setup.tsx       # Test configuration with MUI theme
```

## Core Types

- **Game**: `{ id: string, date: Date, opponent: string, isHome: boolean, volunteer: string | null }`
- **IDatabase**: Interface defining all data operations (getGames, addGame, claimGame, releaseGame, subscribe)

## Testing

- Uses **Vitest** with **jsdom** environment.
- **React Testing Library** for component testing.
- A custom render function in `src/test/setup.tsx` wraps components with an MUI ThemeProvider.
- Most components have corresponding `.test.tsx` files.

## Data Management

### Seeding

The application uses a mock database (`MockDatabase.ts`) by default in the standard `dev` environment, which is populated with sample data on initialization. When using the `dev:env` command with Supabase, the database should be seeded manually or via Supabase Studio's SQL editor.

### Clearing Volunteer Data

To clear all volunteer claims from the database, you can run the SQL script `clear-volunteer-data.sql` in your Supabase SQL editor. This is useful for testing or resetting the schedule's state.

```sql
-- clear-volunteer-data.sql
UPDATE games SET volunteer = NULL;
```
