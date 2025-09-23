'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationList } from './notification-list'
import { getUnreadNotificationCount } from '@/lib/actions/notifications'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function loadUnreadCount() {
      try {
        const count = await getUnreadNotificationCount()
        setUnreadCount(count)
      } catch (error) {
        // Don't log error for unauthenticated users
        if (error instanceof Error && !error.message.includes('Not authenticated')) {
          console.error('Failed to load notification count:', error)
        }
      }
    }

    loadUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [mounted])

  const handleNotificationRead = () => {
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const handleAllRead = () => {
    setUnreadCount(0)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationList
          onNotificationRead={handleNotificationRead}
          onAllRead={handleAllRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}