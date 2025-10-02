'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isWithinInterval, isSameDay, startOfDay, addDays } from 'date-fns'
import { Trip } from '@/types/database'
import Link from 'next/link'
import { locationService } from '@/lib/services/location'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useState } from 'react'

interface TripAgendaProps {
  trips: (Trip & { creator?: any })[]
  userProfile?: {
    base_location?: string
  }
}

// Region-based color mapping
const regionColors = {
  'North America': 'bg-green-500',
  'South America': 'bg-teal-500',
  'Europe': 'bg-blue-500',
  'Africa': 'bg-yellow-500',
  'Asia': 'bg-red-500',
  'Oceania': 'bg-purple-500',
  'Caribbean': 'bg-orange-500',
  'Central America': 'bg-emerald-500',
  'Other': 'bg-gray-500'
}

export function TripAgenda({ trips, userProfile }: TripAgendaProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const nextWeekStart = addWeeks(currentWeekStart, 1)
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 0 })

  const prevWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1))
  }

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  const getTripColor = (trip: Trip) => {
    const region = locationService.getRegion(trip.destination)
    return regionColors[region as keyof typeof regionColors] || regionColors['Other']
  }

  // Group trips by week
  const thisWeekTrips = trips.filter(trip => {
    const tripStart = parseISO(trip.start_date)
    const tripEnd = parseISO(trip.end_date)
    return isWithinInterval(tripStart, { start: currentWeekStart, end: weekEnd }) ||
           isWithinInterval(tripEnd, { start: currentWeekStart, end: weekEnd }) ||
           (tripStart <= currentWeekStart && tripEnd >= weekEnd)
  })

  const nextWeekTrips = trips.filter(trip => {
    const tripStart = parseISO(trip.start_date)
    const tripEnd = parseISO(trip.end_date)
    return isWithinInterval(tripStart, { start: nextWeekStart, end: nextWeekEnd }) ||
           isWithinInterval(tripEnd, { start: nextWeekStart, end: nextWeekEnd }) ||
           (tripStart <= nextWeekStart && tripEnd >= nextWeekEnd)
  })

  // Get all days in current week with their trips
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const daysWithTrips = daysOfWeek.map(day => {
    const dayTrips = trips.filter(trip => {
      const tripStart = parseISO(trip.start_date)
      const tripEnd = parseISO(trip.end_date)
      return isWithinInterval(day, { start: tripStart, end: tripEnd })
    })
    return { day, trips: dayTrips }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Travel Schedule
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Week Header */}
        <div className="border-b pb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            {format(currentWeekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
        </div>

        {/* Days with trips */}
        {daysWithTrips.some(d => d.trips.length > 0) ? (
          <div className="space-y-3">
            {daysWithTrips.map(({ day, trips: dayTrips }) => {
              if (dayTrips.length === 0) return null

              const isToday = isSameDay(day, new Date())

              return (
                <div key={day.toISOString()} className="space-y-2">
                  {/* Day header */}
                  <div className={`flex items-baseline gap-2 ${isToday ? 'text-primary font-semibold' : ''}`}>
                    <span className="text-sm font-medium">
                      {format(day, 'EEE, MMM d')}
                    </span>
                    {isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Trips for this day */}
                  <div className="space-y-2 pl-2">
                    {dayTrips.map(trip => {
                      const tripStart = parseISO(trip.start_date)
                      const tripEnd = parseISO(trip.end_date)
                      const isStartDay = isSameDay(day, tripStart)
                      const isEndDay = isSameDay(day, tripEnd)

                      return (
                        <Link key={trip.id} href={`/trips/${trip.id}`}>
                          <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className={`w-1 h-full rounded-full flex-shrink-0 ${getTripColor(trip)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    ✈️ {trip.destination}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {isStartDay && isEndDay ? (
                                      'Day trip'
                                    ) : isStartDay ? (
                                      `Departing → ${format(tripEnd, 'MMM d')}`
                                    ) : isEndDay ? (
                                      `Returning from ${format(tripStart, 'MMM d')}`
                                    ) : (
                                      `In ${trip.destination.split(',')[0]}`
                                    )}
                                  </p>
                                  {trip.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {trip.description}
                                    </p>
                                  )}
                                </div>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${getTripColor(trip)}`} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No trips scheduled this week</p>
            {userProfile?.base_location && (
              <p className="text-xs mt-1">
                🏠 Home base: {userProfile.base_location}
              </p>
            )}
          </div>
        )}

        {/* Next week preview */}
        {nextWeekTrips.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Next Week ({format(nextWeekStart, 'MMM d')} - {format(nextWeekEnd, 'MMM d')})
            </h3>
            <div className="space-y-1">
              {nextWeekTrips.slice(0, 3).map(trip => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <div className="flex items-center gap-2 text-xs hover:opacity-80 cursor-pointer p-2 rounded hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTripColor(trip)}`} />
                    <span className="truncate flex-1">
                      {trip.destination}
                    </span>
                    <span className="text-muted-foreground text-[10px] flex-shrink-0">
                      {format(parseISO(trip.start_date), 'MMM d')}
                    </span>
                  </div>
                </Link>
              ))}
              {nextWeekTrips.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{nextWeekTrips.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Color legend */}
        {trips.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Regions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(regionColors).map(([region, color]) => {
                const hasTripsInRegion = trips.some(trip =>
                  locationService.getRegion(trip.destination) === region
                )
                if (!hasTripsInRegion) return null

                return (
                  <div key={region} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-muted-foreground">{region}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
