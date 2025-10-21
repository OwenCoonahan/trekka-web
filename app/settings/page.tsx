'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { updateProfile, uploadAvatar } from '@/lib/actions/profile'
import { getEmailImportAddress } from '@/lib/actions/pending-trips'
import { profileSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, ArrowLeft, Bell, Plane, Mail, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { z } from 'zod'

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [profile, setProfile] = useState<any>(null)
  const [emailImportAddress, setEmailImportAddress] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      display_name: '',
      bio: '',
      occupation: '',
      base_location: '',
      links: {
        instagram: '',
        tiktok: '',
        linkedin: '',
        x: '',
        website: '',
      },
    },
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setAvatarUrl(profile.avatar_url || '')
        form.reset({
          username: profile.username || '',
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          occupation: profile.occupation || '',
          base_location: profile.base_location || '',
          links: profile.links || {},
        })
      }
    }

    loadProfile()
    loadEmailAddress()
  }, [supabase, router, form])

  async function loadEmailAddress() {
    try {
      const address = await getEmailImportAddress()
      setEmailImportAddress(address)
    } catch (error) {
      console.error('Failed to load email import address:', error)
    }
  }

  function copyEmailAddress() {
    navigator.clipboard.writeText(emailImportAddress)
    setCopied(true)
    toast.success('Email address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
      toast.success('Avatar uploaded successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('username', values.username)
    formData.append('display_name', values.display_name || '')
    formData.append('bio', values.bio || '')
    formData.append('occupation', values.occupation || '')
    formData.append('base_location', values.base_location || '')
    formData.append('instagram', values.links?.instagram || '')
    formData.append('tiktok', values.links?.tiktok || '')
    formData.append('linkedin', values.links?.linkedin || '')
    formData.append('x', values.links?.x || '')
    formData.append('website', values.links?.website || '')

    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
      router.push(`/u/${values.username}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href={profile ? `/u/${profile.username}` : '/feed'}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Change Avatar</span>
                      </Button>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </Label>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Digital Nomad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="base_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Base</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input placeholder="New York, NY or Fully Nomadic" {...field} />
                          <Button
                            type="button"
                            variant={field.value?.toLowerCase() === 'fully nomadic' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange(field.value?.toLowerCase() === 'fully nomadic' ? '' : 'Fully Nomadic')}
                            className="w-full"
                          >
                            <Plane className="h-4 w-4 mr-2" />
                            Set as Fully Nomadic
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter your home city or select "Fully Nomadic" if you don't have a fixed base
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Social Links</h3>

                  <FormField
                    control={form.control}
                    name="links.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="links.tiktok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="links.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="links.x"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X (Twitter)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://x.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="links.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">📧 Email Import</h3>
                      <Link href="/trips/pending">
                        <Button variant="ghost" size="sm">
                          View Pending
                        </Button>
                      </Link>
                    </div>
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Forward flight and hotel confirmations to automatically create trips
                      </p>
                      {emailImportAddress && (
                        <div className="flex gap-2">
                          <div className="flex-1 p-2 bg-background rounded border font-mono text-sm break-all">
                            {emailImportAddress}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyEmailAddress}
                          >
                            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>How it works:</p>
                        <ol className="list-decimal list-inside space-y-0.5 ml-2">
                          <li>Forward your booking email to the address above</li>
                          <li>We'll extract the trip details with AI</li>
                          <li>Review and confirm the trip in one click</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Link href="/notifications/preferences">
                    <Button variant="outline" className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Preferences
                    </Button>
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}