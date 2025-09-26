'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { tripSchema } from '@/lib/utils/validation'
import { Loader2, ArrowLeft, Trash } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TripFormValues = {
  destination: string
  start_date: string
  end_date: string
  description?: string
  is_private: boolean
}

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [trip, setTrip] = useState<any>(null)
  const [tripId, setTripId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: {
      destination: '',
      start_date: '',
      end_date: '',
      description: '',
      is_private: false,
    },
  })

  useEffect(() => {
    async function initPage() {
      const resolvedParams = await params
      setTripId(resolvedParams.id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('creator_id', user.id)
        .single()

      if (error || !trip) {
        toast.error('Trip not found or you do not have permission to edit it')
        router.push('/feed')
        return
      }

      setTrip(trip)
      form.reset({
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        description: trip.description || '',
        is_private: trip.is_private,
      })
    }

    initPage()
  }, [supabase, router, form, params])

  async function onSubmit(values: TripFormValues) {
    if (!tripId) return
    setIsLoading(true)

    const { error } = await supabase
      .from('trips')
      .update({
        destination: values.destination,
        start_date: values.start_date,
        end_date: values.end_date,
        description: values.description || null,
        is_private: values.is_private,
      })
      .eq('id', tripId)

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    } else {
      toast.success('Trip updated successfully!')
      router.push(`/trips/${tripId}`)
    }
  }

  async function handleDelete() {
    if (!tripId) return
    setIsDeleting(true)

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)

    if (error) {
      toast.error(error.message)
      setIsDeleting(false)
    } else {
      toast.success('Trip deleted successfully!')
      router.push('/feed')
    }
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {tripId && (
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trip
            </Button>
          </Link>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Trip</CardTitle>
                <CardDescription>
                  Update your trip details
                </CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your trip
                      and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Trip'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination *</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your trip plans..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share what you&apos;re planning to do on this trip
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_private"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Private Trip
                        </FormLabel>
                        <FormDescription>
                          Only you can see this trip when it&apos;s private
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}