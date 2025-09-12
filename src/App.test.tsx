import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CssBaseline from '@mui/material/CssBaseline';
import { render } from '@testing-library/react';
import App from './App';
import { MockDatabase } from './database/MockDatabase';
import type { Game } from './types/Game';

vi.mock('./database/MockDatabase');

vi.mock('@mui/icons-material/Settings', () => ({
  default: () => <div>Settings</div>,
}));

describe('App', () => {
  let db: MockDatabase;
  let games: Game[];

  beforeEach(() => {
    db = new MockDatabase();
    games = [
      { id: '1', opponent: 'Test Team', date: new Date(), isHome: true, volunteer: null },
      { id: '2', opponent: 'Claim Team', date: new Date(), isHome: false, volunteer: null },
      { id: '3', opponent: 'Release Team', date: new Date(), isHome: true, volunteer: 'test-user' },
    ];
    vi.spyOn(db, 'getGames').mockResolvedValue(games);
    vi.spyOn(db, 'subscribe').mockImplementation((cb) => {
      cb(games);
      return () => {};
    });
    vi.spyOn(db, 'claimGame').mockImplementation(async (gameId, volunteer) => {
      const game = games.find(g => g.id === gameId)!;
      game.volunteer = volunteer;
      return game;
    });
    vi.spyOn(db, 'releaseGame').mockImplementation(async (gameId) => {
      const game = games.find(g => g.id === gameId)!;
      game.volunteer = null;
      return game;
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<><CssBaseline />{component}</>);
  };

  it('shows games list', async () => {
    renderWithTheme(<App db={db} />);
    expect(await screen.findByText(/Test Team/)).toBeInTheDocument();
  });

  it('can claim a game', async () => {
    renderWithTheme(<App db={db} />);

    const claimButton = (await screen.findAllByRole('button', { name: /claim/i }))[0];

    await act(async () => {
      await userEvent.click(claimButton);
    });

    expect(db.claimGame).toHaveBeenCalledWith('1', expect.any(String));
  });

  it('can release own game', async () => {
    renderWithTheme(<App db={db} />);

    const releaseButton = await screen.findByRole('button', { name: /release/i });

    await act(async () => {
      await userEvent.click(releaseButton);
    });

    expect(db.releaseGame).toHaveBeenCalledWith('3');
  });
});

describe('App Manager Mode', () => {
  let db: MockDatabase;
  let games: Game[];

  beforeEach(() => {
    db = new MockDatabase();
    games = [];
    vi.spyOn(db, 'getGames').mockResolvedValue(games);
    vi.spyOn(db, 'subscribe').mockImplementation((cb) => {
      cb(games);
      return () => {};
    });
    vi.spyOn(db, 'addGame').mockImplementation(async (game) => {
      const newGame = { ...game, id: '4', volunteer: null };
      games.push(newGame);
      return newGame;
    });
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<><CssBaseline />{component}</>);
  };

  const openPinDialog = async () => {
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /manager-settings/i }));
    });
    expect(await screen.findByText(/Manager Access/)).toBeInTheDocument();
  };

  const loginAsManager = async () => {
    await openPinDialog();
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/Enter PIN/i), '1234');
      await userEvent.click(screen.getByRole('button', { name: /Login/i }));
    });
  };

  it('PIN entry shows manager view', async () => {
    renderWithTheme(<App db={db} />);
    await loginAsManager();
    expect(await screen.findByText(/add a new game/i)).toBeInTheDocument();
  });

  it('wrong PIN does not allow access', async () => {
    renderWithTheme(<App db={db} />);
    await openPinDialog();

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/Enter PIN/i), '0000');
      await userEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    expect(window.alert).toHaveBeenCalledWith('Incorrect PIN');
    expect(screen.queryByText(/add a new game/i)).not.toBeInTheDocument();
  });

  it('manager can add games', async () => {
    renderWithTheme(<App db={db} />);
    await loginAsManager();

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/opponent/i), 'Manager Team');
      await userEvent.type(screen.getByLabelText(/date/i), '2025-12-01T12:00');
      await userEvent.click(screen.getByRole('button', { name: /add game/i }));
    });

    expect(db.addGame).toHaveBeenCalledWith({
      opponent: 'Manager Team',
      date: new Date('2025-12-01T12:00'),
      isHome: false,
    });
  });
});

describe('App Real-time Updates', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<><CssBaseline />{component}</>);
  };

  it('subscribe updates game list', async () => {
    const db = new MockDatabase();
    let callback: (games: Game[]) => void = () => {};
    vi.spyOn(db, 'subscribe').mockImplementation((cb) => {
      callback = cb;
      return () => {};
    });
    vi.spyOn(db, 'getGames').mockResolvedValue([]);

    renderWithTheme(<App db={db} />);
    expect(await screen.findByText(/no games/i)).toBeInTheDocument();

    await act(async () => {
      callback([{ id: '1', opponent: 'Real-time Team', date: new Date(), isHome: true, volunteer: null }]);
    });

    expect(await screen.findByText(/real-time team/i)).toBeInTheDocument();
  });
});
