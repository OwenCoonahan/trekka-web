'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowLeft, Bell, Mail, MessageSquare, MapPin, User, Plus, Edit } from 'lucide-react'
import Link from 'next/link'
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/actions/notifications'
// import { PushNotificationSetup } from '@/components/push-notification-setup'

interface NotificationPreferences {
  trip_added: boolean
  trip_updated: boolean
  city_overlap: boolean
  follow: boolean
  email_notifications: boolean
  sms_notifications: boolean
  phone_number: string | null
}

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    trip_added: true,
    trip_updated: true,
    city_overlap: true,
    follow: true,
    email_notifications: false,
    sms_notifications: false,
    phone_number: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadPreferences() {
      try {
        const data = await getNotificationPreferences()
        setPreferences({
          trip_added: data.trip_added ?? true,
          trip_updated: data.trip_updated ?? true,
          city_overlap: data.city_overlap ?? true,
          follow: data.follow ?? true,
          email_notifications: data.email_notifications ?? false,
          sms_notifications: data.sms_notifications ?? false,
          phone_number: data.phone_number || null
        })
      } catch (error) {
        console.error('Failed to load preferences:', error)
        toast.error('Failed to load notification preferences')
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      await updateNotificationPreferences(formData)
      toast.success('Notification preferences updated!')
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading preferences...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/settings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>

        <div className="space-y-6">
          {/* <PushNotificationSetup /> */}

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive and how you'd like to receive them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Platform Notifications</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plus className="h-4 w-4 text-green-500" />
                      <div>
                        <Label htmlFor="trip_added" className="font-medium">Trip Added</Label>
                        <p className="text-sm text-muted-foreground">Get notified when people you follow add new trips</p>
                      </div>
                    </div>
                    <Switch
                      id="trip_added"
                      name="trip_added"
                      checked={preferences.trip_added}
                      onCheckedChange={(checked) => handleToggle('trip_added', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Edit className="h-4 w-4 text-blue-500" />
                      <div>
                        <Label htmlFor="trip_updated" className="font-medium">Trip Updated</Label>
                        <p className="text-sm text-muted-foreground">Get notified when people you follow update their trips</p>
                      </div>
                    </div>
                    <Switch
                      id="trip_updated"
                      name="trip_updated"
                      checked={preferences.trip_updated}
                      onCheckedChange={(checked) => handleToggle('trip_updated', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <div>
                        <Label htmlFor="city_overlap" className="font-medium">City Overlap</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone visits your home city</p>
                      </div>
                    </div>
                    <Switch
                      id="city_overlap"
                      name="city_overlap"
                      checked={preferences.city_overlap}
                      onCheckedChange={(checked) => handleToggle('city_overlap', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-purple-500" />
                      <div>
                        <Label htmlFor="follow" className="font-medium">New Followers</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                      </div>
                    </div>
                    <Switch
                      id="follow"
                      name="follow"
                      checked={preferences.follow}
                      onCheckedChange={(checked) => handleToggle('follow', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how you'd like to receive notifications beyond the platform
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4" />
                      <div>
                        <Label htmlFor="email_notifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email_notifications"
                      name="email_notifications"
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4" />
                      <div>
                        <Label htmlFor="sms_notifications" className="font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via text message (coming soon)</p>
                      </div>
                    </div>
                    <Switch
                      id="sms_notifications"
                      name="sms_notifications"
                      checked={preferences.sms_notifications}
                      onCheckedChange={(checked) => handleToggle('sms_notifications', checked)}
                      disabled
                    />
                  </div>

                  {preferences.sms_notifications && (
                    <div className="ml-7 pl-4 border-l">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={preferences.phone_number || ''}
                        onChange={(e) => setPreferences(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="mt-1"
                        disabled
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}