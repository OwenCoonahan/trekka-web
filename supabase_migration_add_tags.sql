-- Add tags column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index on tags for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_tags ON trips USING GIN(tags);