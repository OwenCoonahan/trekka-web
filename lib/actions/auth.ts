'use server'

import { createClient } from '@/lib/supabase/server'
import { emailSchema } from '@/lib/utils/validation'
import { redirect } from 'next/navigation'

export async function signIn(email: string) {
  const validatedEmail = emailSchema.parse(email)
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: validatedEmail,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Supabase auth error:', error)
    throw new Error(`Database error: ${error.message} (${error.status})`)
  }

  return { success: true, message: 'Check your email for a magic link!' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as any
}