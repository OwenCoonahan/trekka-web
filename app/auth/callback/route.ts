import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth callback - user:', user?.id)

      if (user) {
        // Add a small delay to ensure database trigger has completed
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()

        console.log('Auth callback - profile:', profile, 'error:', profileError)

        // Handle profile query errors
        if (profileError) {
          console.log('Profile query error, redirecting to onboarding:', profileError)
          // If profile doesn't exist or error occurred, redirect to onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        if ((profile as any)?.username) {
          // User has completed onboarding, redirect to feed
          console.log('Redirecting to /feed')
          return NextResponse.redirect(`${origin}/feed`)
        } else {
          // User needs to complete onboarding
          console.log('Redirecting to /onboarding')
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}