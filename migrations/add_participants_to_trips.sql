-- Add participants column to trips table
-- This will store an array of participant objects with member IDs and non-member names

ALTER TABLE trips ADD COLUMN participants JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the structure
COMMENT ON COLUMN trips.participants IS 'Array of participants: [{"type": "member", "id": "user_id", "name": "Display Name", "username": "username", "avatar_url": "url"}, {"type": "non_member", "name": "John Doe"}]';

-- Create an index on participants for better query performance when searching for specific participants
CREATE INDEX idx_trips_participants ON trips USING GIN (participants);