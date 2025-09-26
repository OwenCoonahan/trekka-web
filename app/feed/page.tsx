import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/actions/auth'
import { getFeedTrips } from '@/lib/actions/social'
import { TripCard } from '@/components/trip-card'
import { TripGrid } from '@/components/trip-grid'
import { MonthSection } from '@/components/month-section'
import { DiscoverSection } from '@/components/discover-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Plus, Users, Compass } from 'lucide-react'
import { isUpcoming } from '@/lib/utils/dates'

export default async function FeedPage() {
  const user = await getUser()
  const profile = await getProfile()

  if (!user || !(profile as any)?.username) {
    redirect('/login')
  }

  const trips = await getFeedTrips()
  const supabase = await createClient()

  // Group trips by month
  const tripsByMonth = trips.reduce((acc, trip: any) => {
    const monthKey = format(new Date(trip.start_date), 'MMMM yyyy')
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(trip)
    return acc
  }, {} as Record<string, any[]>)

  // Get discover data
  const { data: discoverTrips } = await supabase
    .from('trips')
    .select(`
      *,
      creator:profiles!trips_creator_id_fkey(*)
    `)
    .eq('is_private', false)
    .order('start_date', { ascending: true })

  const upcomingDiscoverTrips = (discoverTrips || []).filter((trip: any) =>
    isUpcoming(trip.start_date, trip.end_date)
  )

  // Group discover trips by destination
  const tripsByDestination = upcomingDiscoverTrips.reduce((acc: any, trip: any) => {
    const destination = trip.destination.split(',')[0].trim()
    if (!acc[destination]) {
      acc[destination] = []
    }
    acc[destination].push(trip)
    return acc
  }, {})

  const popularDestinations = Object.entries(tripsByDestination)
    .sort(([,a]: any, [,b]: any) => b.length - a.length)
    .slice(0, 6)

  return (
    <LayoutWrapper>
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Feed</h1>
            <div className="flex gap-2">
              <Link href="/trips/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </Button>
              </Link>
              <Link href={`/u/${(profile as any).username}`}>
                <Button variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Feed and Discover Tabs */}
          <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="following">
                Following ({trips.length})
              </TabsTrigger>
              <TabsTrigger value="discover">
                Discover ({upcomingDiscoverTrips.length})
              </TabsTrigger>
            </TabsList>

            {/* Following Feed */}
            <TabsContent value="following" className="mt-6">
              {trips.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      No trips yet
                    </CardTitle>
                    <CardDescription>
                      Follow other users to see their upcoming public trips in your feed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by exploring profiles and following people whose travel plans interest you.
                    </p>
                    <Link href="/trips/new">
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Trip
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {Object.entries(tripsByMonth).map(([month, monthTrips]) => (
                    <MonthSection key={month} title={month}>
                      {monthTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </MonthSection>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Discover Tab */}
            <TabsContent value="discover" className="mt-6">
              <DiscoverSection
                trips={upcomingDiscoverTrips}
                popularDestinations={popularDestinations}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </LayoutWrapper>
  )
}