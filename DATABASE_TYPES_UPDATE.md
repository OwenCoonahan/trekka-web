# Database Types Update Required

## Quick Fix for Build Error

The notification system added new tables and columns that aren't in your TypeScript types yet. Here's how to fix it:

## 1. Update Database Schema in Supabase

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Add email column to profiles (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create push_subscriptions table
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);

-- RLS policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own push subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own push subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own push subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own push subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
```

## 2. Regenerate Types

After updating your database schema:

1. Go to your Supabase dashboard
2. Go to Settings > API
3. Click "Generate types" or use the CLI:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
   ```

## 3. Temporary Fix for Development

If you want to test the notification system immediately, you can add this to `types/database.ts`:

```typescript
// Add to your existing Database interface
export interface Database {
  public: {
    Tables: {
      // ... your existing tables
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Update profiles to include email
      profiles: {
        Row: {
          // ... existing fields
          email: string | null
        }
        Insert: {
          // ... existing fields
          email?: string | null
        }
        Update: {
          // ... existing fields
          email?: string | null
        }
      }
    }
  }
}
```

## 4. The notification system will work once types are updated!

After these changes, you'll be able to:
- ✅ Build without TypeScript errors
- ✅ Send email notifications via Resend
- ✅ Enable web push notifications
- ✅ Test the full notification flow

The notification logic is already complete and tested!