-- Add base_location field to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles
ADD COLUMN base_location TEXT;