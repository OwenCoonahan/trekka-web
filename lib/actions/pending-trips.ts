'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'
import { createTrip } from './trips'
import { revalidatePath } from 'next/cache'

export async function getPendingTrips() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: pendingTrips, error } = await supabase
    .from('pending_trips')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return pendingTrips || []
}

export async function getPendingTripById(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: pendingTrip, error } = await supabase
    .from('pending_trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return pendingTrip
}

export async function confirmPendingTrip(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const pendingTripId = formData.get('pending_trip_id') as string
  if (!pendingTripId) throw new Error('Pending trip ID is required')

  const supabase = await createClient()

  // Get the pending trip
  const { data: pendingTrip, error: fetchError } = await supabase
    .from('pending_trips')
    .select('*')
    .eq('id', pendingTripId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw new Error(fetchError.message)
  if (!pendingTrip) throw new Error('Pending trip not found')

  // Create the actual trip using existing createTrip action
  const tripFormData = new FormData()
  tripFormData.append('destination', formData.get('destination') as string || pendingTrip.destination)
  tripFormData.append('start_date', formData.get('start_date') as string || pendingTrip.start_date)
  tripFormData.append('end_date', formData.get('end_date') as string || pendingTrip.end_date)
  tripFormData.append('description', formData.get('description') as string || pendingTrip.description || '')
  tripFormData.append('is_private', formData.get('is_private') as string || 'false')

  const result = await createTrip(tripFormData)

  // Mark pending trip as confirmed
  const { error: updateError } = await supabase
    .from('pending_trips')
    .update({
      status: 'confirmed',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', pendingTripId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/trips')
  revalidatePath('/feed')

  return result
}

export async function rejectPendingTrip(pendingTripId: string) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { error } = await supabase
    .from('pending_trips')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', pendingTripId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/trips')
}

export async function getEmailImportAddress() {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email_import_id')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)

  if (!profile?.email_import_id) {
    throw new Error('Email import ID not found')
  }

  return `${profile.email_import_id}@trips.trekka.com`
}
