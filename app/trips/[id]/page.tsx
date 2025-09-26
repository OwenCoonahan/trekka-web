import { notFound } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import Link from 'next/link'
import { getTripWithInterests } from '@/lib/actions/trips'
import { generateICS } from '@/lib/actions/calendar'
import { getUser } from '@/lib/actions/auth'
import { UserAvatar } from '@/components/user-avatar'
import { InterestedButton } from '@/components/interested-button'
import { CopyLinkButton } from '@/components/copy-link-button'
import { BackButton } from '@/components/back-button'
import { DestinationWithFlag } from '@/components/destination-with-flag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateRange } from '@/lib/utils/dates'
import { MapPin, Calendar, Lock, Download, Edit } from 'lucide-react'

// Tag configuration for colors and icons
const getTagConfig = (tag: string) => {
  const tagLower = tag.toLowerCase()

  const configs: Record<string, { icon: string; className: string }> = {
    work: { icon: '💼', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    business: { icon: '💼', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    exploring: { icon: '🗺️', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    adventure: { icon: '🏔️', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
    social: { icon: '🎉', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    friends: { icon: '👥', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    family: { icon: '👨‍👩‍👧‍👦', className: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
    sports: { icon: '⚽', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    fitness: { icon: '💪', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    culture: { icon: '🎭', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' },
    food: { icon: '🍴', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    relaxation: { icon: '🧘', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
    beach: { icon: '🏖️', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
    skiing: { icon: '⛷️', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' },
    conference: { icon: '📊', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300' },
    wedding: { icon: '💒', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' }
  }

  return configs[tagLower] || { icon: '🏷️', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' }
}

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await getTripWithInterests(id)
  const user = await getUser()

  if (!trip) {
    notFound()
  }

  const isOwner = user?.id === trip.creator_id
  const tripUrl = `${process.env.NEXT_PUBLIC_APP_URL}/trips/${trip.id}`


  const interestedUsers = trip.interests?.filter(i => i.status === 'interested') || []

  return (
    <LayoutWrapper>
      <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <DestinationWithFlag destination={trip.destination} />
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

            {/* Trip Tags */}
            {trip.tags && trip.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => {
                  const tagConfig = getTagConfig(tag)
                  return (
                    <Badge key={tag} variant="secondary" className={tagConfig.className}>
                      {tagConfig.icon} {tag}
                    </Badge>
                  )
                })}
              </div>
            )}

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
              {isOwner && (
                <Link href={`/trips/${trip.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Trip
                  </Button>
                </Link>
              )}
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
    </LayoutWrapper>
  )
}