-- Email Forwarding for Trip Import
-- Run this in your Supabase SQL editor

-- 1. Add unique email identifier to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_import_id TEXT UNIQUE;

-- Create function to generate unique import ID
CREATE OR REPLACE FUNCTION generate_email_import_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate 8 character random string
    new_id := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if it already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email_import_id = new_id) THEN
      done := TRUE;
    END IF;
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Generate import IDs for existing users
UPDATE profiles
SET email_import_id = generate_email_import_id()
WHERE email_import_id IS NULL;

-- 2. Create pending_trips table
CREATE TABLE IF NOT EXISTS pending_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Parsed trip data
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,

  -- Email metadata
  email_subject TEXT,
  email_from TEXT,
  email_body TEXT,
  confirmation_number TEXT,
  trip_type TEXT, -- flight, hotel, rental, train, etc.

  -- Parsing metadata
  parsed_data JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_trips_user_id ON pending_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_trips_status ON pending_trips(status);
CREATE INDEX IF NOT EXISTS idx_pending_trips_created_at ON pending_trips(created_at DESC);

-- 4. Enable RLS
ALTER TABLE pending_trips ENABLE ROW LEVEL SECURITY;

-- Users can view their own pending trips
DO $$ BEGIN
  CREATE POLICY "Users can view own pending trips"
  ON pending_trips FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Users can update their own pending trips (to confirm/reject)
DO $$ BEGIN
  CREATE POLICY "Users can update own pending trips"
  ON pending_trips FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Users can delete their own pending trips
DO $$ BEGIN
  CREATE POLICY "Users can delete own pending trips"
  ON pending_trips FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- System can insert pending trips (via service role)
DO $$ BEGIN
  CREATE POLICY "Service role can insert pending trips"
  ON pending_trips FOR INSERT
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Function to auto-generate email_import_id for new users
CREATE OR REPLACE FUNCTION set_email_import_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_import_id IS NULL THEN
    NEW.email_import_id := generate_email_import_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set email_import_id on profile creation
DROP TRIGGER IF EXISTS set_email_import_id_trigger ON profiles;
CREATE TRIGGER set_email_import_id_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_email_import_id();

-- 6. Add notification for pending trips (extends existing notification system)
-- Update notification type constraint to include 'pending_trip'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('trip_added', 'trip_updated', 'city_overlap', 'follow', 'trip_interest', 'pending_trip'));

-- 7. Create function to notify user of pending trip
CREATE OR REPLACE FUNCTION notify_pending_trip()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = NEW.user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.user_id,
    'pending_trip',
    '✈️ Trip detected from email',
    'We found a trip to ' || NEW.destination || '. Review and confirm?',
    jsonb_build_object(
      'pending_trip_id', NEW.id,
      'destination', NEW.destination,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date,
      'trip_type', NEW.trip_type
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when pending trip is created
DROP TRIGGER IF EXISTS pending_trip_notification_trigger ON pending_trips;
CREATE TRIGGER pending_trip_notification_trigger
  AFTER INSERT ON pending_trips
  FOR EACH ROW
  EXECUTE FUNCTION notify_pending_trip();
