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

// Continent-based color mapping
const continentColors = {
  'north-america': 'bg-green-500',
  'south-america': 'bg-teal-500',
  'europe': 'bg-blue-500',
  'africa': 'bg-yellow-500',
  'asia': 'bg-red-500',
  'oceania': 'bg-purple-500',
  'antarctica': 'bg-gray-400',
  'unknown': 'bg-gray-500'
}

// Country to continent mapping (major countries/cities)
const countryToContinent: { [key: string]: string } = {
  // North America
  'united states': 'north-america', 'usa': 'north-america', 'us': 'north-america',
  'canada': 'north-america', 'mexico': 'north-america',
  'guatemala': 'north-america', 'cuba': 'north-america', 'haiti': 'north-america',
  'dominican republic': 'north-america', 'honduras': 'north-america',
  'nicaragua': 'north-america', 'el salvador': 'north-america',
  'costa rica': 'north-america', 'panama': 'north-america',
  'jamaica': 'north-america', 'trinidad': 'north-america', 'barbados': 'north-america',
  'bahamas': 'north-america', 'belize': 'north-america',

  // South America
  'brazil': 'south-america', 'argentina': 'south-america', 'colombia': 'south-america',
  'peru': 'south-america', 'venezuela': 'south-america', 'chile': 'south-america',
  'ecuador': 'south-america', 'bolivia': 'south-america', 'paraguay': 'south-america',
  'uruguay': 'south-america', 'guyana': 'south-america', 'suriname': 'south-america',
  'french guiana': 'south-america',

  // Europe
  'united kingdom': 'europe', 'uk': 'europe', 'england': 'europe', 'scotland': 'europe',
  'wales': 'europe', 'northern ireland': 'europe', 'ireland': 'europe',
  'france': 'europe', 'germany': 'europe', 'italy': 'europe', 'spain': 'europe',
  'portugal': 'europe', 'netherlands': 'europe', 'belgium': 'europe',
  'switzerland': 'europe', 'austria': 'europe', 'sweden': 'europe',
  'norway': 'europe', 'denmark': 'europe', 'finland': 'europe',
  'poland': 'europe', 'czech republic': 'europe', 'czechia': 'europe',
  'hungary': 'europe', 'romania': 'europe', 'bulgaria': 'europe',
  'greece': 'europe', 'turkey': 'europe', 'croatia': 'europe',
  'serbia': 'europe', 'bosnia': 'europe', 'albania': 'europe',
  'macedonia': 'europe', 'slovenia': 'europe', 'slovakia': 'europe',
  'estonia': 'europe', 'latvia': 'europe', 'lithuania': 'europe',
  'ukraine': 'europe', 'belarus': 'europe', 'russia': 'europe',
  'iceland': 'europe', 'malta': 'europe', 'cyprus': 'europe',
  'luxembourg': 'europe', 'monaco': 'europe', 'andorra': 'europe',
  'liechtenstein': 'europe', 'san marino': 'europe', 'vatican': 'europe',

  // Asia
  'china': 'asia', 'india': 'asia', 'japan': 'asia', 'south korea': 'asia',
  'korea': 'asia', 'indonesia': 'asia', 'thailand': 'asia', 'vietnam': 'asia',
  'philippines': 'asia', 'malaysia': 'asia', 'singapore': 'asia',
  'myanmar': 'asia', 'burma': 'asia', 'cambodia': 'asia', 'laos': 'asia',
  'bangladesh': 'asia', 'pakistan': 'asia', 'afghanistan': 'asia',
  'nepal': 'asia', 'bhutan': 'asia', 'sri lanka': 'asia', 'maldives': 'asia',
  'taiwan': 'asia', 'mongolia': 'asia', 'kazakhstan': 'asia',
  'uzbekistan': 'asia', 'turkmenistan': 'asia', 'kyrgyzstan': 'asia',
  'tajikistan': 'asia', 'azerbaijan': 'asia', 'armenia': 'asia',
  'georgia': 'asia', 'iran': 'asia', 'iraq': 'asia', 'syria': 'asia',
  'lebanon': 'asia', 'jordan': 'asia', 'israel': 'asia', 'palestine': 'asia',
  'saudi arabia': 'asia', 'yemen': 'asia', 'oman': 'asia', 'uae': 'asia',
  'united arab emirates': 'asia', 'qatar': 'asia', 'bahrain': 'asia',
  'kuwait': 'asia', 'dubai': 'asia', 'hong kong': 'asia', 'macau': 'asia',

  // Africa
  'egypt': 'africa', 'south africa': 'africa', 'nigeria': 'africa',
  'ethiopia': 'africa', 'morocco': 'africa', 'kenya': 'africa', 'uganda': 'africa',
  'algeria': 'africa', 'sudan': 'africa', 'libya': 'africa', 'tunisia': 'africa',
  'tanzania': 'africa', 'ghana': 'africa', 'mozambique': 'africa',
  'madagascar': 'africa', 'cameroon': 'africa', 'ivory coast': 'africa',
  'niger': 'africa', 'burkina faso': 'africa', 'mali': 'africa',
  'malawi': 'africa', 'zambia': 'africa', 'zimbabwe': 'africa',
  'senegal': 'africa', 'somalia': 'africa', 'chad': 'africa',
  'guinea': 'africa', 'rwanda': 'africa', 'benin': 'africa', 'burundi': 'africa',
  'sierra leone': 'africa', 'togo': 'africa', 'liberia': 'africa',
  'mauritania': 'africa', 'eritrea': 'africa', 'gambia': 'africa',
  'botswana': 'africa', 'namibia': 'africa', 'gabon': 'africa',
  'mauritius': 'africa', 'eswatini': 'africa', 'swaziland': 'africa',
  'lesotho': 'africa', 'equatorial guinea': 'africa', 'djibouti': 'africa',
  'comoros': 'africa', 'cape verde': 'africa', 'seychelles': 'africa',

  // Oceania
  'australia': 'oceania', 'new zealand': 'oceania', 'papua new guinea': 'oceania',
  'fiji': 'oceania', 'solomon islands': 'oceania', 'vanuatu': 'oceania',
  'samoa': 'oceania', 'kiribati': 'oceania', 'tonga': 'oceania',
  'micronesia': 'oceania', 'palau': 'oceania', 'marshall islands': 'oceania',
  'nauru': 'oceania', 'tuvalu': 'oceania', 'tahiti': 'oceania',
  'french polynesia': 'oceania', 'new caledonia': 'oceania', 'guam': 'oceania'
}

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

  const getContinent = (destination: string) => {
    const lowerDest = destination.toLowerCase()

    // Check each country in our mapping
    for (const [country, continent] of Object.entries(countryToContinent)) {
      if (lowerDest.includes(country)) {
        return continent
      }
    }

    // Check for continent names directly in the destination
    if (lowerDest.includes('europe')) return 'europe'
    if (lowerDest.includes('asia')) return 'asia'
    if (lowerDest.includes('africa')) return 'africa'
    if (lowerDest.includes('america')) {
      if (lowerDest.includes('south')) return 'south-america'
      return 'north-america'
    }
    if (lowerDest.includes('oceania') || lowerDest.includes('pacific')) return 'oceania'

    return 'unknown'
  }

  const getTripColor = (trip: Trip) => {
    const continent = getContinent(trip.destination)
    return continentColors[continent as keyof typeof continentColors]
  }

  const getTripsForDay = (day: Date) => {
    return trips.filter(trip => {
      const tripStart = parseISO(trip.start_date)
      const tripEnd = parseISO(trip.end_date)
      return isWithinInterval(day, { start: tripStart, end: tripEnd })
    })
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
              return <div key={index} className="p-1 md:p-2 h-20 md:h-36" />
            }

            const dayTrips = getTripsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`p-1 md:p-2 h-20 md:h-36 border rounded-sm relative ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <div className={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </div>

                {/* Trip blocks or home base for this day */}
                <div className="mt-1 space-y-1">
                  {dayTrips.length > 0 ? (
                    <>
                      {dayTrips.slice(0, 2).map((trip, tripIndex) => (
                        <Link key={trip.id} href={`/trips/${trip.id}`}>
                          <div
                            className={`h-4 md:h-5 rounded text-[9px] md:text-[11px] text-white px-1 md:px-2 cursor-pointer hover:opacity-80 flex items-center truncate ${getTripColor(trip)}`}
                            title={`${trip.destination} - ${format(parseISO(trip.start_date), 'MMM d')} to ${format(parseISO(trip.end_date), 'MMM d')}`}
                          >
                            <span className="text-[8px] md:text-[10px] font-medium truncate">
                              ✈️ {trip.destination.split(',')[0]}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {dayTrips.length > 2 && (
                        <div className="h-4 md:h-5 rounded bg-gray-400 text-white text-[9px] md:text-[11px] px-1 md:px-2 flex items-center">
                          +{dayTrips.length - 2} more
                        </div>
                      )}
                    </>
                  ) : (
                    userProfile?.base_location && (
                      <div
                        className="h-4 md:h-5 rounded text-[9px] md:text-[11px] bg-gray-200 text-gray-700 px-1 md:px-2 truncate flex items-center border border-gray-300"
                        title={`Home: ${userProfile.base_location}`}
                      >
                        <span className="text-[8px] md:text-[10px] font-medium truncate">
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