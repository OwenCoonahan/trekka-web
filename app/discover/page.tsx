import { LayoutWrapper } from '@/components/layout-wrapper'
import { createClient } from '@/lib/supabase/server'
import { TripGrid } from '@/components/trip-grid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isUpcoming } from '@/lib/utils/dates'

export default async function DiscoverPage() {
  const supabase = await createClient()

  // Get all public upcoming trips with creator info
  const { data: trips } = await supabase
    .from('trips')
    .select(`
      *,
      creator:profiles!trips_creator_id_fkey(*)
    `)
    .eq('is_private', false)
    .order('start_date', { ascending: true })

  const upcomingTrips = (trips || []).filter((trip: any) =>
    isUpcoming(trip.start_date, trip.end_date)
  )

  // Group trips by destination for better discovery
  const tripsByDestination = upcomingTrips.reduce((acc: any, trip: any) => {
    const destination = trip.destination.split(',')[0].trim() // Get city name
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
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discover Travel Plans</CardTitle>
              <CardDescription>
                Creating serendipity and new connections between those living life to the fullest
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                All Upcoming Trips ({upcomingTrips.length})
              </TabsTrigger>
              <TabsTrigger value="popular">
                Popular Destinations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingTrips.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No upcoming public trips found. Be the first to share your travel plans!
                  </CardContent>
                </Card>
              ) : (
                <TripGrid trips={upcomingTrips} />
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              {popularDestinations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No destinations found yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {popularDestinations.map(([destination, destinationTrips]: any) => (
                    <Card key={destination}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {destination} ({destinationTrips.length} trip{destinationTrips.length !== 1 ? 's' : ''})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TripGrid trips={destinationTrips} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </LayoutWrapper>
  )
}