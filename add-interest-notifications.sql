-- Add Interest Notifications to Trekka
-- Run this in your Supabase SQL editor

-- 1. Update notification type constraint to include 'trip_interest'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('trip_added', 'trip_updated', 'city_overlap', 'follow', 'trip_interest'));

-- 2. Add trip_interest preference to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS trip_interest BOOLEAN DEFAULT TRUE;

-- 3. Create trigger function for interest notifications
CREATE OR REPLACE FUNCTION handle_interest_notifications()
RETURNS TRIGGER AS $$
DECLARE
  trip_record RECORD;
  trip_creator_profile RECORD;
  interested_user_profile RECORD;
BEGIN
  -- Only create notification when someone expresses interest (not when they remove it)
  IF (TG_OP = 'INSERT' AND NEW.status = 'interested') OR
     (TG_OP = 'UPDATE' AND OLD.status = 'not_interested' AND NEW.status = 'interested') THEN

    -- Get the trip details
    SELECT * INTO trip_record
    FROM trips
    WHERE id = NEW.trip_id;

    -- Don't notify if user is interested in their own trip
    IF trip_record.creator_id = NEW.user_id THEN
      RETURN NEW;
    END IF;

    -- Get the trip creator's profile
    SELECT * INTO trip_creator_profile
    FROM profiles
    WHERE id = trip_record.creator_id;

    -- Get the interested user's profile
    SELECT * INTO interested_user_profile
    FROM profiles
    WHERE id = NEW.user_id;

    -- Check if the trip creator wants interest notifications
    IF EXISTS (
      SELECT 1 FROM notification_preferences
      WHERE user_id = trip_record.creator_id AND trip_interest = TRUE
    ) THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        trip_record.creator_id,
        'trip_interest',
        interested_user_profile.display_name || ' is interested in your trip!',
        interested_user_profile.display_name || ' expressed interest in your trip to ' || trip_record.destination,
        jsonb_build_object(
          'trip_id', trip_record.id,
          'interested_user_id', NEW.user_id,
          'interested_user_username', interested_user_profile.username,
          'interested_user_name', interested_user_profile.display_name,
          'destination', trip_record.destination,
          'start_date', trip_record.start_date,
          'end_date', trip_record.end_date
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on interests table
DROP TRIGGER IF EXISTS interest_notification_trigger ON interests;
CREATE TRIGGER interest_notification_trigger
  AFTER INSERT OR UPDATE ON interests
  FOR EACH ROW
  EXECUTE FUNCTION handle_interest_notifications();

-- 5. Update existing notification preferences to enable trip_interest by default
UPDATE notification_preferences
SET trip_interest = TRUE
WHERE trip_interest IS NULL;
