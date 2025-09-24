import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { createClient } from '@/lib/supabase/server'
import { getUserTrips } from '@/lib/actions/trips'
import { getUser } from '@/lib/actions/auth'
import { UserAvatar } from '@/components/user-avatar'
import { TripGrid } from '@/components/trip-grid'
import { TripCalendar } from '@/components/trip-calendar'
import { FollowButton } from '@/components/follow-button'
import { CopyLinkButton } from '@/components/copy-link-button'
import { SocialLinks } from '@/components/social-links'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, MapPin } from 'lucide-react'
import { isUpcoming, isPast } from '@/lib/utils/dates'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const currentUser = await getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  const typedProfile = profile as any

  if (!typedProfile) {
    notFound()
  }

  const trips = await getUserTrips(typedProfile.id)
  const upcomingTrips = trips.filter((trip: any) => isUpcoming(trip.start_date, trip.end_date))
  const pastTrips = trips.filter((trip: any) => isPast(trip.start_date, trip.end_date))

  const isOwnProfile = currentUser?.id === typedProfile.id
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/u/${username}`

  return (
    <LayoutWrapper>
      <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={typedProfile.avatar_url}
                  alt={typedProfile.display_name || typedProfile.username}
                  size="xl"
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {typedProfile.display_name || typedProfile.username}
                  </h1>
                  <p className="text-muted-foreground">@{typedProfile.username}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {typedProfile.occupation && (
                      <Badge variant="secondary">
                        {typedProfile.occupation}
                      </Badge>
                    )}
                    {typedProfile.base_location && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {typedProfile.base_location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="flex-1 min-w-0">
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </Link>
                ) : (
                  currentUser && <FollowButton userId={typedProfile.id} />
                )}
                <CopyLinkButton url={profileUrl} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {typedProfile.bio && (
              <CardDescription className="text-base">
                {typedProfile.bio}
              </CardDescription>
            )}
            {typedProfile.links && Object.keys(typedProfile.links).length > 0 && (
              <SocialLinks links={typedProfile.links as any} />
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastTrips.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <TripGrid trips={upcomingTrips} />
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <TripGrid trips={pastTrips} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <TripCalendar trips={trips} userProfile={typedProfile} />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </LayoutWrapper>
  )
}