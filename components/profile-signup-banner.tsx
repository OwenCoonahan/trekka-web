'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/user-avatar'
import { X, MapPin, Sparkles } from 'lucide-react'

interface ProfileSignupBannerProps {
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  upcomingTripsCount: number
}

export function ProfileSignupBanner({ profile, upcomingTripsCount }: ProfileSignupBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem(`banner-dismissed-${profile.username}`)
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show banner after a brief delay for smooth UX
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [profile.username])

  const handleDismiss = () => {
    setIsClosing(true)
    sessionStorage.setItem(`banner-dismissed-${profile.username}`, 'true')
    setTimeout(() => {
      setIsVisible(false)
      setIsDismissed(true)
    }, 300)
  }

  const handleSignUp = () => {
    // Store the intent to follow this user after signup
    sessionStorage.setItem('follow-after-signup', profile.id)
    sessionStorage.setItem('redirect-after-signup', `/u/${profile.username}`)
    router.push('/login')
  }

  if (isDismissed) return null

  const displayName = profile.display_name || profile.username
  const tripText = upcomingTripsCount === 1 ? 'trip' : 'trips'

  return (
    <>
      {isVisible && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe transition-all duration-300 ease-out ${
            isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
          }`}
          style={{ animation: isClosing ? 'none' : 'slideUp 0.3s ease-out' }}
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-2xl backdrop-blur-sm">
            <div className="relative p-4 sm:p-6">
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Profile info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <UserAvatar
                    src={profile.avatar_url}
                    alt={displayName}
                    size="lg"
                    className="ring-2 ring-primary/20"
                  />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{displayName}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {upcomingTripsCount > 0
                          ? `${upcomingTripsCount} upcoming ${tripText}`
                          : 'Travel enthusiast'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 sm:justify-end w-full sm:w-auto">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">Get notified about their trips</span>
                  </div>
                  <Button
                    onClick={handleSignUp}
                    size="lg"
                    className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                  >
                    Sign up to follow
                  </Button>
                </div>
              </div>

              {/* Mobile tagline */}
              <div className="sm:hidden flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Get notified about their trips</span>
              </div>
            </div>
          </Card>
        </div>
      )}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
