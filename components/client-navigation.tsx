'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { NotificationBell } from '@/components/notification-bell'
import { Home, MapPin, User, LogOut, Plus, ArrowLeft, Bell } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'

export function ClientNavigation() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    loadUser()
  }, [supabase])

  if (!user) return null

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">

            <Link href="/feed" className="font-bold text-xl">
              Trekka
            </Link>

            <div className="hidden md:flex items-center gap-2 ml-8">
              <Link href="/feed">
                <Button variant={pathname === '/feed' ? 'default' : 'ghost'} size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Feed
                </Button>
              </Link>

              <Link href="/trips/new">
                <Button variant={pathname === '/trips/new' ? 'default' : 'ghost'} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </Button>
              </Link>

              {profile?.username && (
                <Link href={`/u/${profile.username}`}>
                  <Button variant={pathname === `/u/${profile.username}` ? 'default' : 'ghost'} size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />

            {profile && (
              <Link href={`/u/${profile.username}`}>
                <UserAvatar
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  size="sm"
                  className="cursor-pointer"
                />
              </Link>
            )}

            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 pb-3">
          <Link href="/feed" className="flex-1">
            <Button variant={pathname === '/feed' ? 'default' : 'outline'} size="sm" className="w-full">
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/trips/new" className="flex-1">
            <Button variant={pathname === '/trips/new' ? 'default' : 'outline'} size="sm" className="w-full">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>

          {profile?.username && (
            <Link href={`/u/${profile.username}`} className="flex-1">
              <Button variant={pathname === `/u/${profile.username}` ? 'default' : 'outline'} size="sm" className="w-full">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}