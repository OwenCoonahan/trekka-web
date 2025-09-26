'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createTrip } from '@/lib/actions/trips'
import { tripSchema } from '@/lib/utils/validation'
import { Loader2 } from 'lucide-react'
import { ClientNavigation } from '@/components/client-navigation'
import { TagSelector } from '@/components/tag-selector'
import { LocationAutocomplete } from '@/components/ui/location-autocomplete'
import { ParticipantsSelector, Participant } from '@/components/participants-selector'
import { toast } from 'sonner'

type TripFormValues = {
  destination: string
  start_date: string
  end_date: string
  description?: string
  is_private: boolean
  tags?: string[]
}

export default function NewTripPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const router = useRouter()

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema) as any,
    defaultValues: {
      destination: '',
      start_date: '',
      end_date: '',
      description: '',
      is_private: false,
      tags: [],
    },
  })

  const onSubmit: SubmitHandler<TripFormValues> = async (values) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('destination', values.destination)
    formData.append('start_date', values.start_date)
    formData.append('end_date', values.end_date)
    formData.append('description', values.description || '')
    formData.append('is_private', values.is_private.toString())
    formData.append('tags', JSON.stringify(selectedTags))
    formData.append('participants', JSON.stringify(participants))

    try {
      const result = await createTrip(formData)
      toast.success('Trip created successfully!')
      if (result?.tripId) {
        router.push(`/trips/${result.tripId}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <>
      <ClientNavigation />
      <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Trip</CardTitle>
            <CardDescription>
              Add a new trip to your travel plans
            </CardDescription>
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
                        <LocationAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search for cities or countries..."
                          showFlag={true}
                        />
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

                <div className="space-y-2">
                  <Label>Trip Tags</Label>
                  <TagSelector
                    selectedTags={selectedTags}
                    onTagToggle={(tag) => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                  />
                </div>

                <ParticipantsSelector
                  participants={participants}
                  onChange={setParticipants}
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
                      Creating trip...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}