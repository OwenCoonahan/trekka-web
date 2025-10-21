import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmailNotification } from '@/lib/actions/email-notifications'

export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the notification details with user info
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles!notifications_user_id_fkey (
          id,
          username,
          display_name,
          email,
          notification_preferences (
            email_notifications
          )
        )
      `)
      .eq('id', notificationId)
      .single()

    if (notificationError || !notification) {
      console.error('Notification not found:', notificationError)
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const profile = notification.profiles as any
    const preferences = profile?.notification_preferences?.[0]

    // Only send email if user has email notifications enabled and has an email
    if (preferences?.email_notifications && profile?.email) {
      // Parse notification data based on type
      let emailData: any = notification.data || {}

      // For follow notifications, we already have the follower data
      if (notification.type === 'follow') {
        // Data is already in the right format from the trigger
      } else if (notification.type === 'trip_added' || notification.type === 'trip_updated') {
        // Get trip details
        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .select(`
            *,
            profiles!trips_creator_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('id', emailData.trip_id)
          .single()

        if (!tripError && trip) {
          emailData = {
            ...trip as any,
            creator: (trip as any).profiles
          }
        }
      }

      await sendEmailNotification({
        type: notification.type as any,
        recipientEmail: profile.email,
        recipientName: profile.display_name || profile.username,
        data: emailData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}