-- Corrected notification triggers that work with the actual database schema
-- This version handles missing notification_preferences gracefully

-- Follow notification trigger (corrected)
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_profile RECORD;
  followed_profile RECORD;
  wants_notifications BOOLEAN DEFAULT TRUE;
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
          'follower_avatar', follower_profile.avatar_url
        )
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_follow_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow();

-- Trip notification trigger (corrected)
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