'use server'

import { Trip } from '@/types/database'
import { format, addDays } from 'date-fns'

export async function generateICS(trip: Trip, creatorName: string): Promise<string> {
  const startDate = new Date(trip.start_date)
  const endDate = new Date(trip.end_date)

  // Add one day to end date for all-day events
  const endDatePlusOne = addDays(endDate, 1)

  // Format dates as YYYYMMDD for all-day events
  const formatDateForICS = (date: Date) => format(date, 'yyyyMMdd')

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Trekka//Trip Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:trip-${trip.id}@trekka
DTSTART;VALUE=DATE:${formatDateForICS(startDate)}
DTEND;VALUE=DATE:${formatDateForICS(endDatePlusOne)}
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
SUMMARY:Trip: ${trip.destination}
DESCRIPTION:${trip.description || `Trip to ${trip.destination} by ${creatorName}`}
URL:${process.env.NEXT_PUBLIC_APP_URL}/trips/${trip.id}
LOCATION:${trip.destination}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

  return icsContent
}