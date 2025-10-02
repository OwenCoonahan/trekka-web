'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import { Trip } from '@/types/database'
import Link from 'next/link'
import { locationService } from '@/lib/services/location'
import { TripAgenda } from './trip-agenda'

interface TripCalendarProps {
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


export function TripCalendar({ trips, userProfile }: TripCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const getTripColor = (trip: Trip) => {
    const region = locationService.getRegion(trip.destination)
    return regionColors[region as keyof typeof regionColors] || regionColors['Other']
  }

  const getTripsForDay = (day: Date) => {
    return trips.filter(trip => {
      const tripStart = parseISO(trip.start_date)
      const tripEnd = parseISO(trip.end_date)
      return isWithinInterval(day, { start: tripStart, end: tripEnd })
    })
  }

  // Show agenda view on mobile, calendar on desktop
  if (isMobile) {
    return <TripAgenda trips={trips} userProfile={userProfile} />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-1 md:gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-1 md:p-2 text-center text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-[2px] md:p-2 h-24 md:h-36" />
            }

            const dayTrips = getTripsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`p-[2px] md:p-2 h-24 md:h-36 border rounded-sm relative ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <div className={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </div>

                {/* Trip blocks or home base for this day */}
                <div className="mt-1 space-y-[2px]">
                  {dayTrips.length > 0 ? (
                    <>
                      {dayTrips.slice(0, 1).map((trip, tripIndex) => {
                        const destination = trip.destination.split(',')[0]
                        const shortDestination = destination.length > 8 ? destination.slice(0, 6) + '..' : destination
                        return (
                          <Link key={trip.id} href={`/trips/${trip.id}`}>
                            <div
                              className={`h-5 md:h-6 rounded-sm text-white px-1 cursor-pointer hover:opacity-80 flex items-center ${getTripColor(trip)}`}
                              title={`${trip.destination} - ${format(parseISO(trip.start_date), 'MMM d')} to ${format(parseISO(trip.end_date), 'MMM d')}`}
                            >
                              <span className="text-[10px] md:text-[11px] font-semibold truncate w-full text-center">
                                <span className="hidden md:inline">✈️ {destination}</span>
                                <span className="md:hidden">{shortDestination}</span>
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                      {dayTrips.slice(1, 2).map((trip, tripIndex) => {
                        const destination = trip.destination.split(',')[0]
                        const shortDestination = destination.length > 8 ? destination.slice(0, 6) + '..' : destination
                        return (
                          <Link key={trip.id} href={`/trips/${trip.id}`}>
                            <div
                              className={`h-5 md:h-6 rounded-sm text-white px-1 cursor-pointer hover:opacity-80 flex items-center md:mt-1 ${getTripColor(trip)}`}
                              title={`${trip.destination} - ${format(parseISO(trip.start_date), 'MMM d')} to ${format(parseISO(trip.end_date), 'MMM d')}`}
                            >
                              <span className="text-[10px] md:text-[11px] font-semibold truncate w-full text-center">
                                <span className="hidden md:inline">✈️ {destination}</span>
                                <span className="md:hidden">{shortDestination}</span>
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                      {dayTrips.length > 2 && (
                        <div className="h-4 md:h-5 rounded-sm bg-gray-400 text-white px-1 flex items-center justify-center md:mt-1">
                          <span className="text-[9px] md:text-[10px] font-medium">+{dayTrips.length - 2}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    userProfile?.base_location && (
                      <div
                        className="h-5 md:h-6 rounded-sm bg-gray-200 text-gray-700 px-1 flex items-center border border-gray-300"
                        title={`Home: ${userProfile.base_location}`}
                      >
                        <span className="text-[10px] md:text-[11px] font-semibold truncate w-full text-center">
                          <span className="hidden md:inline">🏠 {userProfile.base_location.split(',')[0]}</span>
                          <span className="md:hidden">Home</span>
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
                    <div className="flex items-center gap-2 text-xs md:text-sm hover:opacity-80 cursor-pointer">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getTripColor(trip)}`} />
                      <span className="truncate">
                        <span className="font-medium">{trip.destination}</span>
                        <span className="hidden sm:inline"> • {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}</span>
                        <span className="sm:hidden block text-[11px] text-muted-foreground">
                          {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}
                        </span>
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