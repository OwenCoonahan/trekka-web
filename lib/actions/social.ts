'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'

export async function toggleFollow(followedId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Check if already following
  console.log('Checking if following user:', followedId, 'from user:', user.id)
  const { data: existing, error: checkError } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('followed_id', followedId)
    .single()

  console.log('Existing follow record:', existing)
  console.log('Check error:', checkError)

  if (existing) {
    // Unfollow
    console.log('Unfollowing user - deleting record:', existing)
    const { error, data: deletedData } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)
      .select()

    console.log('Delete result:', deletedData)
    console.log('Delete error:', error)
    if (error) throw new Error(error.message)
    return { following: false }
  } else {
    // Follow
    console.log('Attempting to follow user:', followedId, 'from user:', user.id)
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        followed_id: followedId,
      } as any)

    if (error) {
      console.error('Follow error details:', error)
      throw new Error(error.message)
    }
    return { following: true }
  }
}

export async function toggleInterest(tripId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Check if already interested
  const { data: existing } = await supabase
    .from('interests')
    .select()
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Toggle status
    const newStatus = (existing as any).status === 'interested' ? 'not_interested' : 'interested'

    const { error } = await supabase
      .from('interests')
      .update({ status: newStatus } as any)
      .eq('id', (existing as any).id)

    if (error) throw new Error(error.message)
    return { status: newStatus }
  } else {
    // Create new interest
    const { error } = await supabase
      .from('interests')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        status: 'interested',
      } as any)

    if (error) throw new Error(error.message)
    return { status: 'interested' }
  }
}

export async function getIsFollowing(followedId: string): Promise<boolean> {
  const user = await getUser()
  if (!user) return false

  const supabase = await createClient()

  const { data } = await supabase
    .from('follows')
    .select()
    .eq('follower_id', user.id)
    .eq('followed_id', followedId)
    .single()

  return !!data
}

export async function getInterestStatus(tripId: string): Promise<string | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()

  const { data } = await supabase
    .from('interests')
    .select('status')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single()

  return (data as any)?.status || null
}

export async function getFeedTrips() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Get users the current user follows
  const { data: follows } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', user.id)

  const followedIds = follows?.map((f: any) => f.followed_id) || []

  if (followedIds.length === 0) {
    return []
  }

  // Get upcoming public trips from followed users
  const { data: trips } = await supabase
    .from('trips')
    .select(`
      *,
      creator:profiles(*)
    `)
    .in('creator_id', followedIds)
    .eq('is_private', false)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  return trips || []
}