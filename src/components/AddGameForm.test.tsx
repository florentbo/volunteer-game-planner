import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { render } from '@testing-library/react';
import AddGameForm from './AddGameForm';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}><CssBaseline />{component}</ThemeProvider>);
};

describe('AddGameForm', () => {
  it('renders form fields', () => {
    renderWithTheme(<AddGameForm onAdd={() => {}} />);
    expect(screen.getByLabelText(/opponent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/home/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add game/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const onAdd = vi.fn();
    renderWithTheme(<AddGameForm onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: /add game/i }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(await screen.findByText(/Opponent and date are required/i)).toBeInTheDocument();
  });

  it('calls onAdd with game data', async () => {
    const onAdd = vi.fn();
    renderWithTheme(<AddGameForm onAdd={onAdd} />);

    await userEvent.type(screen.getByLabelText(/opponent/i), 'New Team');
    await userEvent.type(screen.getByLabelText(/date/i), '2025-11-15T14:00');
    await userEvent.click(screen.getByLabelText(/home/i));
    await userEvent.click(screen.getByRole('button', { name: /add game/i }));

    expect(onAdd).toHaveBeenCalledWith({
      opponent: 'New Team',
      date: new Date('2025-11-15T14:00'),
      isHome: true,
    });
  });
});
