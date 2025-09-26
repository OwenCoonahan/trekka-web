-- Complete Notification System for Trekka
-- Run this in your Supabase SQL editor after adding base_location

-- 1. Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trip_added', 'trip_updated', 'city_overlap', 'follow')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Notification preferences table
CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trip_added BOOLEAN DEFAULT TRUE,
  trip_updated BOOLEAN DEFAULT TRUE,
  city_overlap BOOLEAN DEFAULT TRUE,
  follow BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- 4. RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own notification preferences
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 5. Trigger function for trip notifications
CREATE OR REPLACE FUNCTION handle_trip_notifications()
RETURNS TRIGGER AS $$
DECLARE
  follower_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  trip_creator_profile RECORD;
  overlap_user RECORD;
BEGIN
  -- Get the trip creator's profile
  SELECT * INTO trip_creator_profile
  FROM profiles
  WHERE id = COALESCE(NEW.creator_id, OLD.creator_id);

  -- Handle trip creation
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
        trip_creator_profile.display_name || ' is planning a trip to ' || NEW.destination,
        jsonb_build_object(
          'trip_id', NEW.id,
          'creator_username', trip_creator_profile.username,
          'destination', NEW.destination,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date
        )
      );
    END LOOP;

    -- Check for city overlap (someone visiting your base location)
    FOR overlap_user IN
      SELECT p.id, p.username, p.display_name, p.base_location, np.city_overlap
      FROM profiles p
      JOIN notification_preferences np ON p.id = np.user_id
      WHERE p.base_location IS NOT NULL
      AND p.id != NEW.creator_id
      AND np.city_overlap = TRUE
      AND (
        -- Check if trip destination matches someone's base location
        LOWER(NEW.destination) LIKE '%' || LOWER(SPLIT_PART(p.base_location, ',', 1)) || '%'
        OR LOWER(SPLIT_PART(p.base_location, ',', 1)) LIKE '%' || LOWER(SPLIT_PART(NEW.destination, ',', 1)) || '%'
      )
    LOOP
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        overlap_user.id,
        'city_overlap',
        'Someone is visiting your city!',
        trip_creator_profile.display_name || ' is planning a trip to ' || NEW.destination || ' during your time there',
        jsonb_build_object(
          'trip_id', NEW.id,
          'creator_username', trip_creator_profile.username,
          'visitor_name', trip_creator_profile.display_name,
          'destination', NEW.destination,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'your_location', overlap_user.base_location
        )
      );
    END LOOP;

  -- Handle trip updates
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
            'end_date', NEW.end_date,
            'old_destination', OLD.destination,
            'old_start_date', OLD.start_date,
            'old_end_date', OLD.end_date
          )
        );
      END LOOP;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger function for follow notifications
CREATE OR REPLACE FUNCTION handle_follow_notifications()
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
          'follower_name', follower_profile.display_name
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers
CREATE TRIGGER trip_notification_trigger
  AFTER INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION handle_trip_notifications();

CREATE TRIGGER follow_notification_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION handle_follow_notifications();

-- 8. Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();

-- 9. Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, updated_at = NOW()
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;