-- Remove ALL triggers and functions related to follows table
-- This will completely clean up any problematic triggers

-- Drop all possible trigger variations
DROP TRIGGER IF EXISTS notify_follow_trigger ON follows;
DROP TRIGGER IF EXISTS follow_notification_trigger ON follows;
DROP TRIGGER IF EXISTS follows_trigger ON follows;
DROP TRIGGER IF EXISTS notify_follows_trigger ON follows;

-- Drop all possible function variations
DROP FUNCTION IF EXISTS notify_follow();
DROP FUNCTION IF EXISTS notify_follow_change();
DROP FUNCTION IF EXISTS handle_follow_notification();
DROP FUNCTION IF EXISTS follows_notification();

-- List all triggers on follows table to make sure we got them all
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'follows';