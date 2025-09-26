-- Debug: Find all triggers and functions that might reference following_id

-- List all triggers on trips table
SELECT trigger_name, event_manipulation, action_statement, action_condition
FROM information_schema.triggers
WHERE event_object_table = 'trips';

-- Find all functions that reference following_id
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%following_id%';

-- Also check for any other functions that might be called by triggers
SELECT proname, prosrc
FROM pg_proc
WHERE prosrc LIKE '%following_id%';