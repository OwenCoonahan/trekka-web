'use server'

import { createClient } from '@/lib/supabase/server'
import { tripSchema } from '@/lib/utils/validation'
import { redirect } from 'next/navigation'
import { getUser } from './auth'
import { TripWithCreator, TripWithInterests } from '@/types/database'

export async function createTrip(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

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
    } as any)
    .select()
    .single()

  if (error) throw new Error(error.message)

  redirect(`/trips/${(trip as any).id}`)
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