'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/actions/push-notifications'

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscriptionStatus()
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const subscribeToPush = async () => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      toast.error('Push notifications are not configured')
      return
    }

    setLoading(true)

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permission for notifications was denied')
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      // Send subscription to server
      const subscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }

      await subscribeToPushNotifications(subscriptionData)
      setIsSubscribed(true)
      toast.success('Push notifications enabled!')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to enable push notifications')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribeFromPushNotifications(subscription.endpoint)
        setIsSubscribed(false)
        toast.success('Push notifications disabled')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get instant notifications even when Trekka isn't open
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Enabled</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribeFromPush}
              disabled={loading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              {loading ? 'Disabling...' : 'Disable'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BellOff className="h-4 w-4" />
              <span className="text-sm">Disabled</span>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={subscribeToPush}
              disabled={loading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Works on desktop and mobile browsers
        </p>
      </CardContent>
    </Card>
  )
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i])
  }
  return btoa(result)
}