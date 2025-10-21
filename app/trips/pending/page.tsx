'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getPendingTrips, confirmPendingTrip, rejectPendingTrip } from '@/lib/actions/pending-trips'
import { toast } from 'sonner'
import { ArrowLeft, Check, X, Plane, Hotel, Car, Train, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PendingTrip {
  id: string
  destination: string
  start_date: string | null
  end_date: string | null
  description: string | null
  email_subject: string | null
  email_from: string | null
  trip_type: string | null
  confirmation_number: string | null
  confidence_score: number | null
  created_at: string
}

export default function PendingTripsPage() {
  const [pendingTrips, setPendingTrips] = useState<PendingTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTrip, setEditingTrip] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PendingTrip>>({})
  const router = useRouter()

  useEffect(() => {
    loadPendingTrips()
  }, [])

  async function loadPendingTrips() {
    try {
      const trips = await getPendingTrips()
      setPendingTrips(trips as PendingTrip[])
    } catch (error) {
      console.error('Failed to load pending trips:', error)
      toast.error('Failed to load pending trips')
    } finally {
      setLoading(false)
    }
  }

  function startEditing(trip: PendingTrip) {
    setEditingTrip(trip.id)
    setEditData({
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
    })
  }

  async function handleConfirm(trip: PendingTrip) {
    try {
      const formData = new FormData()
      formData.append('pending_trip_id', trip.id)

      // If editing, use edited values
      if (editingTrip === trip.id) {
        formData.append('destination', editData.destination || trip.destination)
        formData.append('start_date', editData.start_date || trip.start_date || '')
        formData.append('end_date', editData.end_date || trip.end_date || '')
        formData.append('description', editData.description || trip.description || '')
      } else {
        formData.append('destination', trip.destination)
        formData.append('start_date', trip.start_date || '')
        formData.append('end_date', trip.end_date || '')
        formData.append('description', trip.description || '')
      }

      formData.append('is_private', 'false')

      const result = await confirmPendingTrip(formData)
      toast.success('Trip created successfully!')

      // Remove from list
      setPendingTrips(prev => prev.filter(t => t.id !== trip.id))

      // Navigate to trip
      if (result?.tripId) {
        router.push(`/trips/${result.tripId}`)
      }
    } catch (error) {
      console.error('Failed to confirm trip:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create trip')
    }
  }

  async function handleReject(tripId: string) {
    try {
      await rejectPendingTrip(tripId)
      toast.success('Trip discarded')
      setPendingTrips(prev => prev.filter(t => t.id !== tripId))
    } catch (error) {
      console.error('Failed to reject trip:', error)
      toast.error('Failed to discard trip')
    }
  }

  function getTripTypeIcon(type: string | null) {
    switch (type) {
      case 'flight':
        return <Plane className="h-5 w-5 text-blue-500" />
      case 'hotel':
        return <Hotel className="h-5 w-5 text-green-500" />
      case 'rental':
        return <Car className="h-5 w-5 text-orange-500" />
      case 'train':
        return <Train className="h-5 w-5 text-purple-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading pending trips...</div>
        </div>
      </div>
    )
  }

  if (pendingTrips.length === 0) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/feed">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>No Pending Trips</CardTitle>
              <CardDescription>
                Forward your flight or hotel confirmation emails to start importing trips automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button>Go to Settings to Get Your Email</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/feed">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pending Trips</h1>
          <p className="text-muted-foreground">
            Review and confirm trips detected from your emails
          </p>
        </div>

        <div className="space-y-4">
          {pendingTrips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTripTypeIcon(trip.trip_type)}
                    <div>
                      <CardTitle>{trip.destination}</CardTitle>
                      <CardDescription>
                        {trip.email_from && `From: ${trip.email_from}`}
                        {trip.confirmation_number && ` • Conf: ${trip.confirmation_number}`}
                      </CardDescription>
                    </div>
                  </div>
                  {trip.confidence_score && trip.confidence_score < 0.7 && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      Low confidence
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingTrip === trip.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div>
                      <Label>Destination</Label>
                      <Input
                        value={editData.destination || ''}
                        onChange={(e) => setEditData({ ...editData, destination: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={editData.start_date || ''}
                          onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={editData.end_date || ''}
                          onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start:</span>{' '}
                        {trip.start_date ? format(new Date(trip.start_date), 'MMM dd, yyyy') : 'Not specified'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">End:</span>{' '}
                        {trip.end_date ? format(new Date(trip.end_date), 'MMM dd, yyyy') : 'Not specified'}
                      </div>
                    </div>
                    {trip.description && (
                      <p className="text-sm text-muted-foreground">{trip.description}</p>
                    )}
                    {trip.email_subject && (
                      <p className="text-xs text-muted-foreground italic">
                        Email: {trip.email_subject}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {editingTrip === trip.id ? (
                    <>
                      <Button
                        onClick={() => handleConfirm(trip)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save & Confirm
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingTrip(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleConfirm(trip)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Trip
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => startEditing(trip)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(trip.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
