-- Fix trip notification trigger to use correct column names
-- Replace following_id with followed_id

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
      SELECT f.follower_id, COALESCE(np.trip_added, TRUE) as wants_notification
      FROM follows f
      LEFT JOIN notification_preferences np ON f.follower_id = np.user_id
      WHERE f.followed_id = NEW.creator_id
    LOOP
      IF follower_record.wants_notification THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          follower_record.follower_id,
          'trip_added',
          COALESCE(trip_creator_profile.display_name, trip_creator_profile.username) || ' added a new trip',
          'New trip to ' || NEW.destination,
          jsonb_build_object(
            'trip_id', NEW.id,
            'creator_username', trip_creator_profile.username,
            'destination', NEW.destination,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date
          )
        );
      END IF;
    END LOOP;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Only notify if significant changes (destination or dates)
    IF OLD.destination != NEW.destination OR OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date THEN
      FOR follower_record IN
        SELECT f.follower_id, COALESCE(np.trip_updated, TRUE) as wants_notification
        FROM follows f
        LEFT JOIN notification_preferences np ON f.follower_id = np.user_id
        WHERE f.followed_id = NEW.creator_id
      LOOP
        IF follower_record.wants_notification THEN
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (
            follower_record.follower_id,
            'trip_updated',
            COALESCE(trip_creator_profile.display_name, trip_creator_profile.username) || ' updated their trip',
            'Trip to ' || NEW.destination || ' has been updated',
            jsonb_build_object(
              'trip_id', NEW.id,
              'creator_username', trip_creator_profile.username,
              'destination', NEW.destination,
              'start_date', NEW.start_date,
              'end_date', NEW.end_date
            )
          );
        END IF;
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