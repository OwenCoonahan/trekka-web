import { TripCard } from './trip-card'
import { Trip } from '@/types/database'

interface TripGridProps {
  trips: (Trip & { creator?: any })[]
}

export function TripGrid({ trips }: TripGridProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trips found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}