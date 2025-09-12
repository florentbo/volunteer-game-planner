import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MockDatabase } from './database/MockDatabase.ts';

const db = new MockDatabase();

// Sample data for demonstration
db.addGame({ opponent: 'Team A', date: new Date('2025-10-12T18:00:00Z'), isHome: true });
db.addGame({ opponent: 'Team B', date: new Date('2025-10-19T15:00:00Z'), isHome: false });


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App db={db} />
  </StrictMode>
);
