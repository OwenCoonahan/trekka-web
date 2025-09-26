'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'

export async function getNotifications() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return notifications || []
}

export async function getUnreadNotificationCount() {
  const user = await getUser()
  if (!user) return 0

  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) throw new Error(error.message)
  return count || 0
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .in('id', notificationIds)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

export async function markAllNotificationsAsRead() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) throw new Error(error.message)
}

export async function getNotificationPreferences() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // If no preferences exist, create default ones
    if (error.code === 'PGRST116') {
      const { data: newPreferences, error: createError } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id })
        .select()
        .single()

      if (createError) throw new Error(createError.message)
      return newPreferences
    }
    throw new Error(error.message)
  }

  return preferences
}

export async function updateNotificationPreferences(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const preferences = {
    trip_added: formData.get('trip_added') === 'on',
    trip_updated: formData.get('trip_updated') === 'on',
    city_overlap: formData.get('city_overlap') === 'on',
    follow: formData.get('follow') === 'on',
    email_notifications: formData.get('email_notifications') === 'on',
    sms_notifications: formData.get('sms_notifications') === 'on',
    phone_number: formData.get('phone_number') as string || null,
  }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)
}