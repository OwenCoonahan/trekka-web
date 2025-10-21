# Trekka Notification System - Status & Setup

## Current Status

### ✅ Working Notifications

The following notifications are **fully functional** (assuming database triggers are set up):

1. **Follow Notifications** - When someone follows you
2. **Trip Added** - When someone you follow adds a new trip
3. **Trip Updated** - When someone you follow updates a trip (destination/dates changed)
4. **City Overlap** - When someone plans a trip to your home city

### ⚠️ NEW: Interest Notifications (Requires Database Migration)

I've just added support for **Trip Interest notifications**, but it requires running a SQL migration in Supabase.

**What it does:** When someone clicks the heart/interest button on your trip, you'll receive a notification.

## Required Actions

### 1. Run SQL Migration in Supabase

You **MUST** run the following SQL file in your Supabase SQL Editor to enable interest notifications:

**File:** `add-interest-notifications.sql`

This migration will:
- Add `trip_interest` as a valid notification type
- Add `trip_interest` preference column to `notification_preferences` table
- Create trigger function to send notifications when someone expresses interest in a trip
- Create trigger on the `interests` table
- Set default preferences for existing users

### 2. Verify Existing Triggers Are Installed

Make sure you've already run `notification-system.sql` in Supabase. This contains:
- Notifications table
- Notification preferences table
- Triggers for follow, trip_added, trip_updated, and city_overlap

If you haven't run this yet, run `notification-system.sql` FIRST, then run `add-interest-notifications.sql`.

## Notification Types Summary

| Type | Trigger | Recipient | Preference Setting |
|------|---------|-----------|-------------------|
| `follow` | User A follows User B | User B | `follow` |
| `trip_added` | User A adds a trip | Followers of User A | `trip_added` |
| `trip_updated` | User A updates trip (destination/dates) | Followers of User A | `trip_updated` |
| `city_overlap` | User A plans trip to City X | Users with home base in City X | `city_overlap` |
| `trip_interest` | User A clicks interest on User B's trip | User B (trip creator) | `trip_interest` |

## Code Changes Made

### Frontend Changes
✅ Updated notification preferences UI to include trip interest toggle
✅ Added Heart icon for interest notifications
✅ Updated TypeScript interfaces

### Backend Changes
✅ Updated `updateNotificationPreferences` to handle `trip_interest`
✅ Updated database types to include `trip_interest` field
✅ Created SQL migration for interest notifications

### Database Changes Needed
⚠️ **YOU NEED TO RUN**: `add-interest-notifications.sql` in Supabase

## Testing Notifications

Once you run the SQL migration, test the system:

1. **Follow Notification:**
   - User A follows User B
   - User B should see notification: "User A started following you"

2. **Trip Added Notification:**
   - User A adds a new trip
   - User B (who follows User A) should see: "User A added a new trip to [destination]"

3. **Trip Interest Notification:** (NEW)
   - User A clicks the heart button on User B's trip
   - User B should see: "User A is interested in your trip to [destination]"

4. **City Overlap:**
   - User A has home base = "New York, NY"
   - User B plans a trip to "New York"
   - User A should see: "User B is visiting your city!"

## Notification Preferences

Users can control notifications in `/notifications/preferences`:
- ✅ Trip Added
- ✅ Trip Updated
- ✅ City Overlap
- ✅ New Followers
- ✅ Trip Interest (NEW!)
- Email Notifications (toggle)
- SMS Notifications (coming soon - disabled)

## Next Steps

1. **Open Supabase SQL Editor**
2. **Run `add-interest-notifications.sql`**
3. **Test each notification type** by performing actions in the app
4. **Check notification bell** to see if notifications appear
5. **Verify notification preferences** page works correctly

## Troubleshooting

### Notifications not appearing?
1. Check that triggers exist in Supabase:
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   ```

2. Check notification preferences are enabled for that user

3. Check notifications table for new rows:
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
   ```

### Interest notifications specifically not working?
- Make sure you ran `add-interest-notifications.sql`
- Check that the `trip_interest` column exists in `notification_preferences`
- Verify the `interest_notification_trigger` exists on the `interests` table
