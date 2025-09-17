import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateRange } from '@/lib/utils/dates'
import { MapPin, Calendar, Lock } from 'lucide-react'
import { Trip } from '@/types/database'

interface TripCardProps {
  trip: Trip & { creator?: any }
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {trip.destination}
            </CardTitle>
            {trip.is_private && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            {formatDateRange(trip.start_date, trip.end_date)}
          </div>
          {trip.description && (
            <CardDescription className="line-clamp-2">
              {trip.description}
            </CardDescription>
          )}
          {trip.creator && (
            <p className="text-sm text-muted-foreground mt-2">
              by @{trip.creator.username}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}