import { useState } from 'react';
import type { Game } from '../types/Game';

type AddGameFormProps = {
  onAdd: (game: Omit<Game, 'id' | 'volunteer'>) => void;
};

const AddGameForm = ({ onAdd }: AddGameFormProps) => {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [isHome, setIsHome] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim() || !date) {
      setError('Opponent and date are required');
      return;
    }
    onAdd({
      opponent,
      date: new Date(date),
      isHome,
    });
    setOpponent('');
    setDate('');
    setIsHome(false);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add a New Game</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label
          htmlFor="opponent"
          className="block text-sm font-medium text-gray-700"
        >
          Opponent
        </label>
        <input
          id="opponent"
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Date
        </label>
        <input
          id="date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          id="isHome"
          type="checkbox"
          checked={isHome}
          onChange={(e) => setIsHome(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isHome" className="ml-2 block text-sm text-gray-900">
          Home Game
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Add Game
      </button>
    </form>
  );
};

export default AddGameForm;
