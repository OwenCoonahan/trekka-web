import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTripWithInterests } from '@/lib/actions/trips'
import { generateICS } from '@/lib/actions/calendar'
import { getUser } from '@/lib/actions/auth'
import { UserAvatar } from '@/components/user-avatar'
import { InterestedButton } from '@/components/interested-button'
import { CopyLinkButton } from '@/components/copy-link-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateRange } from '@/lib/utils/dates'
import { MapPin, Calendar, Lock, Download } from 'lucide-react'

export default async function TripPage({ params }: { params: { id: string } }) {
  const trip = await getTripWithInterests(params.id)
  const user = await getUser()

  if (!trip) {
    notFound()
  }

  const isOwner = user?.id === trip.creator_id
  const tripUrl = `${process.env.NEXT_PUBLIC_APP_URL}/trips/${trip.id}`


  const interestedUsers = trip.interests?.filter(i => i.status === 'interested') || []

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {trip.destination}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateRange(trip.start_date, trip.end_date)}
                </CardDescription>
              </div>
              {trip.is_private && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Creator */}
            <div className="flex items-center gap-3">
              <UserAvatar
                src={trip.creator?.avatar_url}
                alt={trip.creator?.display_name || trip.creator?.username || 'User'}
                size="md"
              />
              <div>
                <p className="font-medium">
                  {trip.creator?.display_name || trip.creator?.username}
                </p>
                <Link
                  href={`/u/${trip.creator?.username}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  @{trip.creator?.username}
                </Link>
              </div>
            </div>

            {/* Description */}
            {trip.description && (
              <div>
                <h3 className="font-semibold mb-2">About this trip</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {trip.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {user && !isOwner && (
                <InterestedButton
                  tripId={trip.id}
                  interestCount={trip.interests_count}
                />
              )}
              <CopyLinkButton url={tripUrl} />
              <Link href={`/trips/${trip.id}/download-ics`}>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </Link>
            </div>

            {/* Interested Users */}
            {interestedUsers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Interested ({interestedUsers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interestedUsers.map((interest) => (
                    <Link
                      key={interest.id}
                      href={`/u/${interest.user?.username}`}
                      className="flex items-center gap-2 hover:opacity-80"
                    >
                      <UserAvatar
                        src={interest.user?.avatar_url}
                        alt={interest.user?.display_name || interest.user?.username || 'User'}
                        size="sm"
                      />
                      <span className="text-sm">
                        @{interest.user?.username}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}