'use server'

import { createClient } from '@/lib/supabase/server'
import { tripSchema } from '@/lib/utils/validation'
import { redirect } from 'next/navigation'
import { getUser } from './auth'
import { TripWithCreator, TripWithInterests } from '@/types/database'
import { sendEmailNotification } from './email-notifications'
// import { sendPushNotification } from './push-notifications'

export async function createTrip(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const tagsString = formData.get('tags') as string
  const tags = tagsString ? JSON.parse(tagsString) : []

  const participantsString = formData.get('participants') as string
  const participants = participantsString ? JSON.parse(participantsString) : []

  const data = {
    destination: formData.get('destination') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    description: formData.get('description') as string,
    is_private: formData.get('is_private') === 'true',
  }

  const validatedData = tripSchema.parse(data)

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      creator_id: user.id,
      ...validatedData,
      tags: tags,
      participants: participants,
    } as any)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Send notifications to followers
  await sendTripNotifications('trip_added', trip as any)

  return { tripId: (trip as any).id }
}

export async function getTrip(id: string): Promise<TripWithCreator | null> {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select(`
      *,
      creator:profiles(*)
    `)
    .eq('id', id)
    .single()

  return trip as TripWithCreator | null
}

export async function getTripWithInterests(id: string): Promise<TripWithInterests | null> {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select(`
      *,
      creator:profiles(*),
      interests(
        *,
        user:profiles(*)
      )
    `)
    .eq('id', id)
    .single()

  if (!trip) return null

  const interestedCount = (trip as any).interests?.filter((i: any) => i.status === 'interested').length || 0

  return {
    ...(trip as any),
    interests_count: interestedCount,
  } as TripWithInterests
}

export async function getUserTrips(userId: string) {
  const supabase = await createClient()
  const currentUser = await getUser()

  const query = supabase
    .from('trips')
    .select('*')
    .eq('creator_id', userId)
    .order('start_date', { ascending: false })

  // If viewing another user's profile, only show public trips
  if (currentUser?.id !== userId) {
    query.eq('is_private', false)
  }

  const { data: trips } = await query

  return (trips as any) || []
}

export async function deleteTrip(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)

  if (error) throw new Error(error.message)
}

// Helper function to send notifications for trip events
async function sendTripNotifications(type: 'trip_added' | 'trip_updated', trip: any) {
  const supabase = await createClient()

  // Get the trip creator's profile
  const { data: creator } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', trip.creator_id)
    .single()

  if (!creator) return

  // Get followers with their notification preferences
  const { data: followers } = await supabase
    .from('follows')
    .select(`
      follower_id,
      follower:profiles!follows_follower_id_fkey (
        id,
        username,
        display_name,
        email
      )
    `)
    .eq('followed_id', trip.creator_id)

  if (!followers?.length) return

  const tripData = {
    ...trip,
    creator,
    creator_display_name: creator.display_name,
    creator_username: creator.username
  }

  // Send notifications to each follower
  for (const follower of followers) {
    const profile = (follower as any).follower
    if (!profile) continue

    // Get notification preferences for this user
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', profile.id)
      .single()

    // Check if user wants this type of notification
    const wantsNotification = type === 'trip_added' ? preferences?.trip_added : preferences?.trip_updated
    if (!preferences || !wantsNotification) continue

    // Send email if enabled
    if (preferences.email_notifications && profile?.email) {
      await sendEmailNotification({
        type,
        recipientEmail: profile.email,
        recipientName: profile.display_name || profile.username,
        data: tripData
      }).catch(console.error)
    }

    // Send push notification (temporarily disabled for debugging)
    // await sendPushNotification(profile.id, {
    //   type,
    //   title: type === 'trip_added' ? '✈️ New Trip Added!' : '📝 Trip Updated!',
    //   message: `${creator.display_name || creator.username} ${type === 'trip_added' ? 'is planning a trip to' : 'updated their trip to'} ${trip.destination}`,
    //   data: tripData
    // }).catch(console.error)
  }
}