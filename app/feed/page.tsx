import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/actions/auth'
import { getFeedTrips } from '@/lib/actions/social'
import { TripCard } from '@/components/trip-card'
import { MonthSection } from '@/components/month-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Plus, Users } from 'lucide-react'

export default async function FeedPage() {
  const user = await getUser()
  const profile = await getProfile()

  if (!user || !(profile as any)?.username) {
    redirect('/login')
  }

  const trips = await getFeedTrips()

  // Group trips by month
  const tripsByMonth = trips.reduce((acc, trip: any) => {
    const monthKey = format(new Date(trip.start_date), 'MMMM yyyy')
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(trip)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Feed</h1>
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

        {/* Feed Content */}
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
      </div>
    </div>
  )
}