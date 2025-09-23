-- Safer notification trigger that handles missing notification_preferences
-- This version makes notification preferences optional

DROP TRIGGER IF EXISTS notify_follow_trigger ON follows;
DROP FUNCTION IF EXISTS notify_follow();

CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_profile RECORD;
  following_profile RECORD;
  wants_notifications BOOLEAN DEFAULT TRUE; -- Default to TRUE if no preferences found
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get profiles
    SELECT * INTO follower_profile FROM profiles WHERE id = NEW.follower_id;
    SELECT * INTO following_profile FROM profiles WHERE id = NEW.followed_id;

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
  AFTER INSERT OR UPDATE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow();