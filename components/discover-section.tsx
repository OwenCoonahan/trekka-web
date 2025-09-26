'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TripGrid } from '@/components/trip-grid'
import { DiscoverFilters } from '@/components/discover-filters'
import { Compass } from 'lucide-react'

interface DiscoverSectionProps {
  trips: any[]
  popularDestinations: [string, any[]][]
}

export function DiscoverSection({ trips, popularDestinations }: DiscoverSectionProps) {
  const [filteredTrips, setFilteredTrips] = useState(trips)
  const [showResults, setShowResults] = useState(false)

  const handleFilteredTripsChange = useCallback((newFilteredTrips: any[]) => {
    setFilteredTrips(newFilteredTrips)
    setShowResults(true)
  }, [])

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No upcoming public trips found. Be the first to share your travel plans!
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Discover Travel Plans
          </CardTitle>
          <CardDescription>
            Creating serendipity and new connections between those living life to the fullest
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <DiscoverFilters
        trips={trips}
        onFilteredTripsChange={handleFilteredTripsChange}
      />

      {/* Results */}
      <div className="space-y-6">
        {showResults ? (
          /* Filtered Results */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Search Results ({filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''})
              </h3>
            </div>
            {filteredTrips.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No trips match your filters. Try adjusting your search criteria.
                </CardContent>
              </Card>
            ) : (
              <TripGrid trips={filteredTrips} />
            )}
          </div>
        ) : (
          /* Default View */
          <>
            {/* Popular Destinations */}
            {popularDestinations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Popular Destinations</h3>
                {popularDestinations.slice(0, 3).map(([destination, destinationTrips]) => (
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

            {/* All Upcoming Trips */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Upcoming Trips</h3>
              <TripGrid trips={trips} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}