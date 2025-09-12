import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MockDatabase } from './database/MockDatabase.ts';

const db = new MockDatabase();

// Sample data for demonstration - This Saturday and Next Saturday
db.addGame({
  opponent: 'Lynx',
  date: new Date('2025-09-13T18:00:00Z'), // This Saturday
  isHome: true, // Home game
});
db.addGame({
  opponent: 'Chessy',
  date: new Date('2025-09-20T15:00:00Z'), // Next Saturday
  isHome: true, // Home game
});

// Games start unclaimed - volunteers can claim them using the Claim buttons

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App db={db} />
  </StrictMode>
);
