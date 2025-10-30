'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { NotificationBell } from '@/components/notification-bell'
import { Home, Compass, User, LogOut, Plus, ArrowLeft, Bell } from 'lucide-react'
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

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top Navigation - Desktop & Mobile Header */}
      <nav className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/feed" className="font-bold text-xl">
                Trekka
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2 ml-8">
                <Link href="/feed">
                  <Button variant={isActive('/feed') ? 'default' : 'ghost'} size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Feed
                  </Button>
                </Link>

                <Link href="/discover">
                  <Button variant={isActive('/discover') ? 'default' : 'ghost'} size="sm">
                    <Compass className="h-4 w-4 mr-2" />
                    Discover
                  </Button>
                </Link>

                <Link href="/trips/new">
                  <Button variant={isActive('/trips/new') ? 'default' : 'ghost'} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Trip
                  </Button>
                </Link>

                {profile?.username && (
                  <Link href={`/u/${profile.username}`}>
                    <Button variant={pathname.startsWith(`/u/${profile.username}`) ? 'default' : 'ghost'} size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - Desktop & Mobile */}
            <div className="flex items-center gap-2">
              <NotificationBell />

              {profile && (
                <Link href={`/u/${profile.username}`} className="hidden md:block">
                  <UserAvatar
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    size="sm"
                    className="cursor-pointer"
                  />
                </Link>
              )}

              {/* Desktop logout - full button with text */}
              <form action={signOut} className="hidden md:block">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>

              {/* Mobile logout - icon only */}
              <form action={signOut} className="md:hidden">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/feed" className="flex flex-col items-center justify-center flex-1 h-full">
            <div className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/feed') ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Home className={`h-5 w-5 ${isActive('/feed') ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Feed</span>
            </div>
          </Link>

          <Link href="/discover" className="flex flex-col items-center justify-center flex-1 h-full">
            <div className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/discover') ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Compass className={`h-5 w-5 ${isActive('/discover') ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">Discover</span>
            </div>
          </Link>

          <Link href="/trips/new" className="flex flex-col items-center justify-center flex-1 h-full">
            <div className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/trips/new') ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <div className={`rounded-full p-2 ${isActive('/trips/new') ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">New</span>
            </div>
          </Link>

          {profile?.username && (
            <Link href={`/u/${profile.username}`} className="flex flex-col items-center justify-center flex-1 h-full">
              <div className={`flex flex-col items-center gap-1 transition-colors ${
                pathname.startsWith(`/u/${profile.username}`) ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <User className={`h-5 w-5 ${pathname.startsWith(`/u/${profile.username}`) ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">Profile</span>
              </div>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}