-- Complete Notification System Migration for Trekka
-- Run this entire script in Supabase SQL Editor

-- 1. Add email column to profiles (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Ensure notification_preferences table exists with all columns
CREATE TABLE IF NOT EXISTS notification_preferences (
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

-- 3. Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- 5. Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can view own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON notification_preferences;

-- 7. Create RLS policies for push_subscriptions
CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for notification_preferences (if not exist)
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 9. Create default notification preferences for existing users who don't have them
INSERT INTO notification_preferences (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT DO NOTHING;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Success message
SELECT 'Notification system migration completed successfully!' as message;