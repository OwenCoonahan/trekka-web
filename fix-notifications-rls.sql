-- Fix RLS policies for notifications table
-- Add missing INSERT policy to allow triggers to create notifications

-- Create policy to allow system (triggers) to insert notifications for any user
CREATE POLICY "Allow system to insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Also ensure authenticated users can insert their own notifications (for app-generated ones)
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);