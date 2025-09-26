'use server'

import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'

// Initialize web-push configuration only when needed
function initializeWebPush() {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return false
  }

  const vapidSubject = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https:')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'mailto:notifications@trekka.com'

  try {
    webpush.setVapidDetails(
      vapidSubject,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
    return true
  } catch (error) {
    console.error('Failed to initialize web-push:', error)
    return false
  }
}

interface PushNotificationData {
  type: 'trip_added' | 'trip_updated' | 'city_overlap' | 'follow'
  title: string
  message: string
  data: any
}

export async function sendPushNotification(userId: string, notification: PushNotificationData) {
  if (!initializeWebPush()) {
    console.warn('Web push not configured, skipping push notification')
    return
  }

  try {
    const supabase = await createClient()

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)

    if (error || !subscriptions?.length) {
      console.log('No active push subscriptions found for user:', userId)
      return
    }

    // Send push notification to all user's devices
    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            url: getNotificationUrl(notification.type, notification.data),
            type: notification.type,
            ...notification.data
          }
        })

        await webpush.sendNotification(pushSubscription, payload)
        console.log('Push notification sent successfully to:', subscription.id)
      } catch (error: any) {
        console.error('Failed to send push notification:', error)

        // If subscription is no longer valid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ active: false })
            .eq('id', subscription.id)
        }
      }
    })

    await Promise.all(pushPromises)
  } catch (error) {
    console.error('Error in sendPushNotification:', error)
  }
}

export async function subscribeToPushNotifications(subscription: {
  endpoint: string
  p256dh: string
  auth: string
}) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Store the subscription in the database
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      active: true,
      updated_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)
}

export async function unsubscribeFromPushNotifications(endpoint: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .update({ active: false })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) throw new Error(error.message)
}

function getNotificationUrl(type: string, data: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  switch (type) {
    case 'trip_added':
    case 'trip_updated':
      return `${baseUrl}/trips/${data.trip_id}`
    case 'follow':
      return `${baseUrl}/u/${data.follower_username}`
    case 'city_overlap':
      return `${baseUrl}/trips/${data.trip_id}`
    default:
      return `${baseUrl}/feed`
  }
}

// Helper function to send push notifications for new notifications
export async function sendNotificationPushes(notificationType: string, notificationData: any, recipientUserIds: string[]) {
  const notifications = recipientUserIds.map(userId => ({
    userId,
    notification: {
      type: notificationType as any,
      title: getNotificationTitle(notificationType, notificationData),
      message: getNotificationMessage(notificationType, notificationData),
      data: notificationData
    }
  }))

  // Send all push notifications
  await Promise.all(
    notifications.map(({ userId, notification }) =>
      sendPushNotification(userId, notification)
    )
  )
}

function getNotificationTitle(type: string, data: any): string {
  switch (type) {
    case 'trip_added':
      return '✈️ New Trip Added!'
    case 'trip_updated':
      return '📝 Trip Updated!'
    case 'follow':
      return '👥 New Follower!'
    case 'city_overlap':
      return '🏙️ Local Connection!'
    default:
      return '🌍 Trekka Notification'
  }
}

function getNotificationMessage(type: string, data: any): string {
  switch (type) {
    case 'trip_added':
      return `${data.creator_display_name || data.creator_username} is planning a trip to ${data.destination}`
    case 'trip_updated':
      return `${data.creator_display_name || data.creator_username} updated their trip to ${data.destination}`
    case 'follow':
      return `${data.follower_display_name || data.follower_username} started following you`
    case 'city_overlap':
      return `${data.creator_display_name || data.creator_username} is visiting your area!`
    default:
      return 'You have a new notification on Trekka'
  }
}