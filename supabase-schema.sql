-- Create games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  opponent TEXT NOT NULL,
  is_home BOOLEAN NOT NULL DEFAULT false,
  volunteer_parent TEXT,
  volunteer_children TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read games
CREATE POLICY "Everyone can view games" ON games
FOR SELECT USING (true);

-- Create a policy that allows everyone to insert games (for manager functionality)
CREATE POLICY "Everyone can insert games" ON games
FOR INSERT WITH CHECK (true);

-- Create a policy that allows everyone to update games (for claiming)
CREATE POLICY "Everyone can update games" ON games
FOR UPDATE USING (true);

-- Create some sample data
INSERT INTO games (date, opponent, is_home) VALUES
  ('2025-01-25 14:00:00+00', 'Lions FC', true),
  ('2025-02-01 16:30:00+00', 'Eagles United', false),
  ('2025-02-08 15:00:00+00', 'Sharks FC', true),
  ('2025-02-15 14:00:00+00', 'Tigers Sports', false);