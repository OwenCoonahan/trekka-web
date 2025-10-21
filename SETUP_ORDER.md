# Trekka Database Setup - Correct Order

## ⚠️ IMPORTANT: Run SQL Files in This Exact Order

You need to run **4 SQL files** in Supabase to set up the complete database schema and notification system.

---

## STEP 1: Run `supabase.sql` (Base Schema)

**What it creates:**
- `profiles` table (user profiles)
- `trips` table (travel plans)
- `follows` table (user follows)
- `interests` table (trip interests/likes)
- RLS (Row Level Security) policies for all tables
- Trigger to auto-create profile when user signs up

**How to run:**
1. Open Supabase Dashboard → SQL Editor → New Query
2. Copy the **entire contents** of `supabase.sql`
3. Click "Run"

**Expected result:** "Success. No rows returned"

---

## STEP 2: Run `add-base-location.sql` (Add Base Location)

**What it does:**
- Adds `base_location` column to `profiles` table
- Needed for city overlap notifications

**How to run:**
1. SQL Editor → New Query
2. Copy contents of `add-base-location.sql`
3. Run

**Expected result:** "Success. No rows returned"

---

## STEP 3: Run `notification-system.sql` (Notification System)

**What it creates:**
- `notifications` table
- `notification_preferences` table
- Trigger functions for:
  - Follow notifications
  - Trip added notifications
  - Trip updated notifications
  - City overlap notifications
- RLS policies for notifications
- Auto-create notification preferences for new users

**How to run:**
1. SQL Editor → New Query
2. Copy the **entire contents** of `notification-system.sql`
3. Run

**Expected result:** "Success. No rows returned"

---

## STEP 4: Run `add-interest-notifications.sql` (Interest Notifications)

**What it does:**
- Adds `trip_interest` notification type
- Creates trigger for interest notifications
- Adds `trip_interest` preference column

**How to run:**
1. SQL Editor → New Query
2. Copy contents of `add-interest-notifications.sql`
3. Run

**Expected result:** "Success. No rows returned"

---

## STEP 5: Fix Username Constraint (CRITICAL!)

The base schema requires username on signup, but we need it to be optional (filled during onboarding).

**Run this SQL:**

```sql
-- Make username nullable for onboarding flow
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- Update the check constraint to allow empty string temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_username_check
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');
```

**Expected result:** "Success. No rows returned"

---

## Verification

After running all files, verify everything is set up:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ✅ profiles
- ✅ trips
- ✅ follows
- ✅ interests
- ✅ notifications
- ✅ notification_preferences

```sql
-- Check all triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

You should see triggers for:
- ✅ on_auth_user_created (on auth.users)
- ✅ create_notification_preferences_trigger (on profiles)
- ✅ follow_notification_trigger (on follows)
- ✅ trip_notification_trigger (on trips)
- ✅ interest_notification_trigger (on interests)

---

## Troubleshooting

### "Relation already exists"
- This is OK - it means that table/trigger already exists
- Continue with the next SQL file

### "Column already exists"
- This is OK - skip to the next SQL file

### "Permission denied"
- Make sure you're running SQL in Supabase SQL Editor (not locally)
- Make sure you're logged into the correct Supabase project

### "Foreign key constraint"
- You ran the files out of order
- Drop the tables and start over from STEP 1

---

## Summary

**Files to run in order:**
1. ✅ `supabase.sql` - Base tables
2. ✅ `add-base-location.sql` - Add location column
3. ✅ `notification-system.sql` - Notification system
4. ✅ `add-interest-notifications.sql` - Interest notifications
5. ✅ Run the username fix SQL above

**Total time:** ~5 minutes

After this, your database is fully set up and all notifications will work!
