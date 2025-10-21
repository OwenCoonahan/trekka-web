import { getTripWithInterests } from '@/lib/actions/trips'
import { generateICS } from '@/lib/actions/calendar'
import { notFound } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const trip = await getTripWithInterests(id)

  if (!trip) {
    notFound()
  }

  const icsContent = await generateICS(
    trip,
    trip.creator?.display_name || trip.creator?.username || 'Unknown'
  )

  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="trip-${trip.id}.ics"`,
    },
  })
}