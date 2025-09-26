'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { MapPin, User, Plus, Edit, Check, CheckCheck, Bell } from 'lucide-react'
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notifications'

interface Notification {
  id: string
  type: 'trip_added' | 'trip_updated' | 'city_overlap' | 'follow'
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

interface NotificationListProps {
  onNotificationRead: () => void
  onAllRead: () => void
}

export function NotificationList({ onNotificationRead, onAllRead }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications()
        setNotifications(data)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationsAsRead([notificationId])
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      onNotificationRead()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      onAllRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trip_added':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'trip_updated':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'city_overlap':
        return <MapPin className="h-4 w-4 text-orange-500" />
      case 'follow':
        return <User className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'trip_added':
      case 'trip_updated':
      case 'city_overlap':
        return `/trips/${notification.data.trip_id}`
      case 'follow':
        return `/u/${notification.data.follower_username}`
      default:
        return '/feed'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No notifications yet
      </div>
    )
  }

  return (
    <div className="max-h-96">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-80">
        <div className="space-y-1 p-1">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification)

            return (
              <Link
                key={notification.id}
                href={link}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`block p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {!notification.read && (
                        <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {notifications.length > 10 && (
        <>
          <Separator />
          <div className="p-3 text-center">
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="text-xs">
                View all notifications
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}