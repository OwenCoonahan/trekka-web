'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import { Trip } from '@/types/database'
import Link from 'next/link'

interface TripCalendarProps {
  trips: (Trip & { creator?: any })[]
  userProfile?: {
    base_location?: string
  }
}

const tripColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
]

export function TripCalendar({ trips, userProfile }: TripCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay()

  // Create array with leading empty cells for proper week alignment
  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth
  ]

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const getTripsForDay = (day: Date) => {
    return trips.filter(trip => {
      const tripStart = parseISO(trip.start_date)
      const tripEnd = parseISO(trip.end_date)
      return isWithinInterval(day, { start: tripStart, end: tripEnd })
    })
  }

  const getTripColor = (tripId: string) => {
    // Use trip ID to consistently assign colors
    const index = parseInt(tripId.slice(-2), 16) % tripColors.length
    return tripColors[index]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-20" />
            }

            const dayTrips = getTripsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`p-2 h-36 border rounded-sm relative ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <div className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </div>

                {/* Trip indicators and home base */}
                <div className="absolute inset-x-2 top-7 bottom-2 space-y-1">
                  {dayTrips.length > 0 ? (
                    <>
                      {dayTrips.slice(0, 3).map((trip, tripIndex) => (
                        <Link key={trip.id} href={`/trips/${trip.id}`}>
                          <div
                            className={`h-5 rounded text-[11px] text-white px-2 truncate cursor-pointer hover:opacity-80 flex items-center ${getTripColor(trip.id)}`}
                            title={trip.destination}
                          >
                            <span className="text-[11px] font-medium">
                              {trip.destination.split(',')[0]}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {dayTrips.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{dayTrips.length - 3} more
                        </div>
                      )}
                    </>
                  ) : (
                    // Show home base when no trips
                    userProfile?.base_location && (
                      <div
                        className="h-5 rounded text-[11px] bg-gray-200 text-gray-700 px-2 truncate flex items-center border border-gray-300"
                        title={`Home: ${userProfile.base_location}`}
                      >
                        <span className="text-[10px]">
                          🏠 {userProfile.base_location.split(',')[0]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        {trips.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Trips this month</h4>
            <div className="space-y-1">
              {trips
                .filter(trip => {
                  const tripStart = parseISO(trip.start_date)
                  const tripEnd = parseISO(trip.end_date)
                  return isWithinInterval(monthStart, { start: tripStart, end: tripEnd }) ||
                         isWithinInterval(monthEnd, { start: tripStart, end: tripEnd }) ||
                         (tripStart <= monthStart && tripEnd >= monthEnd)
                })
                .slice(0, 5)
                .map(trip => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <div className="flex items-center gap-2 text-sm hover:opacity-80 cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${getTripColor(trip.id)}`} />
                      <span className="truncate">
                        {trip.destination} • {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}
                      </span>
                    </div>
                  </Link>
                ))
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}