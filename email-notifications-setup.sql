-- Email notification setup for Trekka
-- This extends the existing notification system to send emails

-- First, ensure we have the email column in profiles table
-- (Skip if this column already exists)
DO $$
BEGIN
  BEGIN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Create a function that will be called by our triggers to send emails
-- This calls our Next.js API endpoint asynchronously
CREATE OR REPLACE FUNCTION send_notification_email(notification_id UUID)
RETURNS void AS $$
DECLARE
  api_url TEXT;
BEGIN
  -- Only attempt to send emails if we have the notification
  IF notification_id IS NOT NULL THEN
    -- This would be better with a queue system, but for MVP we'll call directly
    -- In production, consider using pg_cron or a job queue like Inngest
    PERFORM pg_notify('notification_email', notification_id::text);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing notification triggers to also send emails
-- We'll modify the existing functions to call our email function

-- Update follow notification trigger
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_profile RECORD;
  followed_profile RECORD;
  wants_notifications BOOLEAN DEFAULT TRUE;
  new_notification_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get profiles
    SELECT * INTO follower_profile FROM profiles WHERE id = NEW.follower_id;
    SELECT * INTO followed_profile FROM profiles WHERE id = NEW.followed_id;

    -- Check if the followed user wants follow notifications (default to TRUE if no record)
    SELECT COALESCE(follow, TRUE) INTO wants_notifications
    FROM notification_preferences
    WHERE user_id = NEW.followed_id;

    -- If no record found, wants_notifications remains TRUE (default)
    IF wants_notifications THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        NEW.followed_id,
        'follow',
        'New follower!',
        COALESCE(follower_profile.display_name, follower_profile.username, 'Someone') || ' started following you',
        jsonb_build_object(
          'follower_id', NEW.follower_id,
          'follower_username', follower_profile.username,
          'follower_display_name', follower_profile.display_name,
          'follower_avatar', follower_profile.avatar_url,
          'follower', jsonb_build_object(
            'id', follower_profile.id,
            'username', follower_profile.username,
            'display_name', follower_profile.display_name,
            'avatar_url', follower_profile.avatar_url
          )
        )
      ) RETURNING id INTO new_notification_id;

      -- Trigger email sending
      PERFORM send_notification_email(new_notification_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update trip notification trigger
CREATE OR REPLACE FUNCTION notify_trip()
RETURNS TRIGGER AS $$
DECLARE
  follower_record RECORD;
  trip_creator_profile RECORD;
  new_notification_id UUID;
BEGIN
  -- Get trip creator profile
  SELECT * INTO trip_creator_profile FROM profiles WHERE id = NEW.creator_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify followers about new trip
    FOR follower_record IN
      SELECT f.follower_id, p.username, p.display_name, p.email,
             COALESCE(np.trip_added, TRUE) as wants_trip_notifications
      FROM follows f
      JOIN profiles p ON f.follower_id = p.id
      LEFT JOIN notification_preferences np ON f.follower_id = np.user_id
      WHERE f.followed_id = NEW.creator_id
        AND COALESCE(np.trip_added, TRUE) = TRUE
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        follower_record.follower_id,
        'trip_added',
        'New trip added!',
        COALESCE(trip_creator_profile.display_name, trip_creator_profile.username, 'Someone') || ' added a trip to ' || NEW.destination,
        jsonb_build_object(
          'trip_id', NEW.id,
          'creator_id', NEW.creator_id,
          'creator_username', trip_creator_profile.username,
          'creator_display_name', trip_creator_profile.display_name,
          'destination', NEW.destination,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'description', NEW.description
        )
      ) RETURNING id INTO new_notification_id;

      -- Trigger email sending
      PERFORM send_notification_email(new_notification_id);
    END LOOP;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Notify followers about trip updates (only if significant fields changed)
    IF OLD.destination != NEW.destination OR
       OLD.start_date != NEW.start_date OR
       OLD.end_date != NEW.end_date THEN

      FOR follower_record IN
        SELECT f.follower_id, p.username, p.display_name, p.email,
               COALESCE(np.trip_updated, TRUE) as wants_update_notifications
        FROM follows f
        JOIN profiles p ON f.follower_id = p.id
        LEFT JOIN notification_preferences np ON f.follower_id = np.user_id
        WHERE f.followed_id = NEW.creator_id
          AND COALESCE(np.trip_updated, TRUE) = TRUE
      LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          follower_record.follower_id,
          'trip_updated',
          'Trip updated!',
          COALESCE(trip_creator_profile.display_name, trip_creator_profile.username, 'Someone') || ' updated their trip to ' || NEW.destination,
          jsonb_build_object(
            'trip_id', NEW.id,
            'creator_id', NEW.creator_id,
            'creator_username', trip_creator_profile.username,
            'creator_display_name', trip_creator_profile.display_name,
            'destination', NEW.destination,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date,
            'description', NEW.description
          )
        ) RETURNING id INTO new_notification_id;

        -- Trigger email sending
        PERFORM send_notification_email(new_notification_id);
      END LOOP;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers to use updated functions
DROP TRIGGER IF EXISTS notify_follow_trigger ON follows;
DROP TRIGGER IF EXISTS notify_trip_trigger ON trips;

CREATE TRIGGER notify_follow_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow();

CREATE TRIGGER notify_trip_trigger
  AFTER INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION notify_trip();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;