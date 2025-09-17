# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Game Schedule Management App** built with React, TypeScript, and Vite. The app allows volunteers to claim and release games, with manager functionality behind a PIN-protected interface (PIN: 1234).

### Key Architecture Concepts

- **Database Abstraction**: Uses an `IDatabase` interface pattern for data access, implemented with `SupabaseDatabase` for PostgreSQL storage with real-time capabilities
- **Component-based Structure**: React components organized by responsibility (GameList, GameCard, AddGameForm)
- **Material-UI Integration**: Uses MUI components with a consistent theme throughout the app
- **Dependency Injection**: The database instance is injected into App component via props for testability

## Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload

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
├── types/              # TypeScript type definitions
│   └── Game.ts         # Core Game type
└── test/               # Test utilities and setup
    └── setup.tsx       # Test configuration with MUI theme
```

## Core Types

- **Game**: `{ id: string, date: Date, opponent: string, isHome: boolean, volunteer: string | null }`
- **IDatabase**: Interface defining all data operations (getGames, addGame, claimGame, releaseGame, subscribe)

## Testing Setup

- Uses **Vitest** with **jsdom** environment
- **React Testing Library** for component testing
- Custom render function in `src/test/setup.tsx` that wraps components with MUI ThemeProvider
- All components have corresponding `.test.tsx` files

## Development Notes

- Pre-build hooks run linting and formatting checks automatically
- Pre-test hooks run linting to catch issues early
- Database operations are Promise-based for future async implementation
- Manager functionality requires PIN authentication (currently hardcoded as '1234')
- Sample data is populated on app initialization with mock games
