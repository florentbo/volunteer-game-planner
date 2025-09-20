# Game Schedule Management App

This is a **Game Schedule Management App** built with React, TypeScript, and Vite. It helps manage volunteer tasks for a kids' team, allowing parents to sign up for games.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Features

- 📅 **Game Schedule View** - Browse upcoming games and volunteer opportunities
- ✋ **Claim Tasks** - Sign up to volunteer for specific games
- 👨‍💼 **Manager Portal** - PIN-protected interface for adding new games
- 🔄 **Real-time Updates** - Live synchronization with Supabase backend
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time)
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier

## What It Does

This application helps manage volunteer tasks for a kids' team. Parents can view a schedule of games and sign up ("claim a task") for specific games they can help with. A manager can add new games to the schedule through a PIN-protected interface.

## How It Works: Claiming a Task

The core functionality allows a parent to volunteer for a game:

1.  **Trigger**: A parent clicks the "Je m'en occupe" ("I'll take care of it") button on an available game.
2.  **Dialog**: A form appears, asking for the parent's name and the child's/children's names.
3.  **Confirm**: After filling the form, the parent confirms.
4.  **Database Update**: The system calls `claimGame()` to assign the volunteer to the game.
5.  **UI Update**: The game card updates to show the volunteer's information.

This ensures every game task is clearly assigned.

## Manager Access

To access manager-only features (like adding new games), click the "Manager" button and enter the configured PIN (see environment setup).

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Supabase account (for `dev:env` mode)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd volunteer-game-planner
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Setup

Instead of a `.env` file, this project uses a shell script to configure environment variables for development.

1.  Copy the template script:
    ```bash
    cp scripts/set-dev-env.sh.template scripts/set-dev-env.sh
    ```
2.  **Edit `scripts/set-dev-env.sh`** and fill in your Supabase project URL and anonymous key.

3.  Load the environment variables into your shell session before running the app:
    ```bash
    source scripts/set-dev-env.sh
    ```

Now you can start the development server with `npm run dev:env`.

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
├── assets/             # Static assets
├── components/         # React components
│   ├── AddGameForm.tsx
│   ├── ClaimGameDialog.tsx
│   ├── GameCard.tsx
│   └── GameList.tsx
├── database/           # Data layer abstraction
│   ├── IDatabase.ts
│   ├── MockDatabase.ts
│   └── SupabaseDatabase.ts
├── lib/                # Utility libraries
│   ├── logger.ts
│   └── supabase.ts
├── types/              # TypeScript type definitions
│   └── Game.ts
└── test/               # Test utilities and setup
    └── setup.tsx

doc/                    # Documentation files
```

## Deployment

For production deployment instructions, see [doc/DEPLOYMENT.md](./doc/DEPLOYMENT.md).

## Architecture

This project uses a database abstraction layer to decouple the application from a specific database implementation.

- **`IDatabase.ts`**: This interface defines the contract for all database operations (e.g., `getGames`, `addGame`).
- **`MockDatabase.ts`**: An in-memory mock implementation used for local development (`npm run dev`) and testing. It requires no setup.
- **`SupabaseDatabase.ts`**: The production implementation that connects to a Supabase PostgreSQL database. It's used when running in `dev:env` mode.

This approach makes the application more modular, easier to test, and flexible enough to swap out the database backend in the future.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
