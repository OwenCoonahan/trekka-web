-- Fix notification triggers for follows table
-- This fixes the "record 'new' has no field 'status'" error

-- Drop and recreate the follow notification trigger without status checks
DROP TRIGGER IF EXISTS notify_follow_trigger ON follows;
DROP FUNCTION IF EXISTS notify_follow();

CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_profile RECORD;
  following_profile RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get profiles
    SELECT * INTO follower_profile FROM profiles WHERE id = NEW.follower_id;
    SELECT * INTO following_profile FROM profiles WHERE id = NEW.followed_id;

    -- Check if the followed user wants follow notifications
    IF EXISTS (
      SELECT 1 FROM notification_preferences
      WHERE user_id = NEW.followed_id AND follow = TRUE
    ) THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        NEW.followed_id,
        'follow',
        'New follower!',
        follower_profile.display_name || ' started following you',
        jsonb_build_object(
          'follower_id', NEW.follower_id,
          'follower_username', follower_profile.username,
          'follower_avatar', follower_profile.avatar_url
        )
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_follow_trigger
  AFTER INSERT OR UPDATE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow();

-- Fix trip notification triggers to use followed_id instead of following_id
DROP TRIGGER IF EXISTS notify_trip_trigger ON trips;
DROP FUNCTION IF EXISTS notify_trip();

CREATE OR REPLACE FUNCTION notify_trip()
RETURNS TRIGGER AS $$
DECLARE
  follower_record RECORD;
  trip_creator_profile RECORD;
BEGIN
  -- Get trip creator profile
  SELECT * INTO trip_creator_profile FROM profiles WHERE id = NEW.creator_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify followers about new trip
    FOR follower_record IN
      SELECT f.follower_id, np.trip_added
      FROM follows f
      JOIN notification_preferences np ON f.follower_id = np.user_id
      WHERE f.followed_id = NEW.creator_id
      AND np.trip_added = TRUE
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        follower_record.follower_id,
        'trip_added',
        trip_creator_profile.display_name || ' added a new trip',
        'New trip to ' || NEW.destination,
        jsonb_build_object(
          'trip_id', NEW.id,
          'creator_username', trip_creator_profile.username,
          'destination', NEW.destination,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date
        )
      );
    END LOOP;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Only notify if significant changes (destination or dates)
    IF OLD.destination != NEW.destination OR OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date THEN
      FOR follower_record IN
        SELECT f.follower_id, np.trip_updated
        FROM follows f
        JOIN notification_preferences np ON f.follower_id = np.user_id
        WHERE f.followed_id = NEW.creator_id
        AND np.trip_updated = TRUE
      LOOP
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          follower_record.follower_id,
          'trip_updated',
          trip_creator_profile.display_name || ' updated their trip',
          'Trip to ' || NEW.destination || ' has been updated',
          jsonb_build_object(
            'trip_id', NEW.id,
            'creator_username', trip_creator_profile.username,
            'destination', NEW.destination,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date
          )
        );
      END LOOP;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_trip_trigger
  AFTER INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION notify_trip();