-- Clear Volunteer Data Script
-- This script removes all volunteer assignments from games, making all games available for claiming again

UPDATE games
SET
  volunteer_parent = NULL,
  volunteer_children = NULL
WHERE
  volunteer_parent IS NOT NULL
  OR volunteer_children IS NOT NULL;

-- Optional: Show the updated games to verify the changes
SELECT
  id,
  date,
  opponent,
  is_home,
  volunteer_parent,
  volunteer_children
FROM games
ORDER BY date ASC;