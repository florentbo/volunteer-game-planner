import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SupabaseDatabase } from './database/SupabaseDatabase.ts';

const db = new SupabaseDatabase();

// No need for sample data - it's now stored in Supabase!
// The database will be populated via the SQL script you ran earlier

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App db={db} />
  </StrictMode>
);
