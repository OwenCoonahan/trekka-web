-- Trekka Database Schema
-- Run this in the Supabase SQL editor

-- Enable RLS on all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$'),
    display_name TEXT,
    bio TEXT CHECK (char_length(bio) <= 240),
    avatar_url TEXT,
    links JSONB DEFAULT '{}',
    occupation TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create indexes on trips
CREATE INDEX idx_trips_creator_id ON trips(creator_id);
CREATE INDEX idx_trips_start_date ON trips(start_date);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id != followed_id)
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'not_interested')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- RLS Policies for trips table
CREATE POLICY "Public trips are viewable by everyone, private trips by owner only"
ON trips FOR SELECT
USING (
    is_private = false
    OR creator_id = auth.uid()
);

CREATE POLICY "Users can create their own trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own trips"
ON trips FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own trips"
ON trips FOR DELETE
USING (auth.uid() = creator_id);

-- RLS Policies for follows table
CREATE POLICY "Users can create their own follows"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON follows FOR DELETE
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view follows where they are involved"
ON follows FOR SELECT
USING (
    follower_id = auth.uid()
    OR followed_id = auth.uid()
);

-- RLS Policies for interests table
CREATE POLICY "Users can create their own interests"
ON interests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests"
ON interests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view interests on their trips or their own interests"
ON interests FOR SELECT
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM trips t
        WHERE t.id = trip_id
        AND t.creator_id = auth.uid()
    )
);

-- Storage bucket setup (execute these after creating buckets in dashboard)
-- Note: Storage buckets should be created via Supabase Dashboard, then apply these policies

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.filename(name))[1] = 'user_' || auth.uid()
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND (storage.filename(name))[1] = 'user_' || auth.uid()
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND (storage.filename(name))[1] = 'user_' || auth.uid()
);

-- Storage policies for trip-photos bucket
CREATE POLICY "Trip photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-photos');

CREATE POLICY "Users can upload photos for their trips"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'trip-photos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their trip photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'trip-photos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their trip photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'trip-photos'
    AND auth.role() = 'authenticated'
);

-- Helper functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();