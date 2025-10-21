'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/utils/validation'
import { redirect } from 'next/navigation'
import { getUser } from './auth'

export async function updateProfile(formData: FormData) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const data = {
    username: formData.get('username') as string,
    display_name: formData.get('display_name') as string,
    bio: formData.get('bio') as string,
    occupation: formData.get('occupation') as string,
    base_location: formData.get('base_location') as string,
    links: {
      instagram: formData.get('instagram') as string,
      tiktok: formData.get('tiktok') as string,
      linkedin: formData.get('linkedin') as string,
      x: formData.get('x') as string,
      website: formData.get('website') as string,
    },
  }

  const validatedData = profileSchema.parse(data)

  // Use upsert to handle both new profiles and updates
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: validatedData.username,
      display_name: validatedData.display_name || null,
      bio: validatedData.bio || null,
      occupation: validatedData.occupation || null,
      base_location: validatedData.base_location || null,
      links: validatedData.links || {},
    } as any, {
      onConflict: 'id',
    })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Username already taken')
    }
    throw new Error(error.message)
  }

  // Use server-side redirect to ensure cache is invalidated
  redirect('/feed')
}

export async function uploadAvatar(file: File) {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  const fileName = `user_${user.id}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
    })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl } as any)
    .eq('id', user.id)

  if (updateError) throw new Error(updateError.message)

  return publicUrl
}

export async function searchProfiles(query: string) {
  if (!query || query.length < 2) {
    return []
  }

  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching profiles:', error)
    return []
  }

  return profiles || []
}