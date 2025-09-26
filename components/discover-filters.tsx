'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X, Calendar, MapPin, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locationService } from '@/lib/services/location'

interface DiscoverFiltersProps {
  trips: any[]
  onFilteredTripsChange: (filteredTrips: any[]) => void
}

export function DiscoverFilters({ trips, onFilteredTripsChange }: DiscoverFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContinent, setSelectedContinent] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Get available regions from the location service
  const availableRegions = useMemo(() => {
    return locationService.getAllRegions()
  }, [])

  // Get region from destination using location service
  const getRegion = (destination: string) => {
    return locationService.getRegion(destination)
  }

  // Calculate trip duration in days
  const getTripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get timeframe from start date
  const getTimeframe = (startDate: string) => {
    const now = new Date()
    const tripStart = new Date(startDate)
    const diffMonths = (tripStart.getFullYear() - now.getFullYear()) * 12 + (tripStart.getMonth() - now.getMonth())

    if (diffMonths <= 1) return 'next-month'
    if (diffMonths <= 3) return 'next-3-months'
    if (diffMonths <= 6) return 'next-6-months'
    return 'later'
  }

  // Get unique tags from all trips
  const allTags = Array.from(new Set(trips.flatMap(trip => trip.tags || [])))

  // Apply filters whenever any filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtered = trips

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(trip =>
          trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Region filter
      if (selectedContinent !== 'all') {
        filtered = filtered.filter(trip => getRegion(trip.destination) === selectedContinent)
      }

      // Duration filter
      if (selectedDuration !== 'all') {
        filtered = filtered.filter(trip => {
          const duration = getTripDuration(trip.start_date, trip.end_date)
          switch (selectedDuration) {
            case 'short': return duration <= 3
            case 'medium': return duration >= 4 && duration <= 14
            case 'long': return duration > 14
            default: return true
          }
        })
      }

      // Timeframe filter
      if (selectedTimeframe !== 'all') {
        filtered = filtered.filter(trip => getTimeframe(trip.start_date) === selectedTimeframe)
      }

      // Tags filter
      if (selectedTags.length > 0) {
        filtered = filtered.filter(trip =>
          trip.tags && selectedTags.some((tag: string) => trip.tags.includes(tag))
        )
      }

      // Sort
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          case 'destination':
            return a.destination.localeCompare(b.destination)
          case 'duration':
            return getTripDuration(b.start_date, b.end_date) - getTripDuration(a.start_date, a.end_date)
          default:
            return 0
        }
      })

      onFilteredTripsChange(filtered)
    }, searchTerm ? 300 : 0) // Small delay for search, immediate for other filters

    return () => clearTimeout(timeoutId)
  }, [trips, searchTerm, selectedContinent, selectedDuration, selectedTimeframe, JSON.stringify(selectedTags), sortBy, onFilteredTripsChange])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedContinent('all')
    setSelectedDuration('all')
    setSelectedTimeframe('all')
    setSelectedTags([])
    setSortBy('date')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const hasActiveFilters = searchTerm || selectedContinent !== 'all' || selectedDuration !== 'all' ||
                         selectedTimeframe !== 'all' || selectedTags.length > 0 || sortBy !== 'date'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            {/* Timeframe Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeframe
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Times' },
                  { value: 'next-month', label: 'Next Month' },
                  { value: 'next-3-months', label: '3 Months' },
                  { value: 'next-6-months', label: '6 Months' },
                  { value: 'later', label: 'Later' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={selectedTimeframe === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Region
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Regions' },
                  ...availableRegions.map(region => ({ value: region, label: region }))
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={selectedContinent === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedContinent(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Any Duration' },
                  { value: 'short', label: 'Short (1-3 days)' },
                  { value: 'medium', label: 'Medium (4-14 days)' },
                  { value: 'long', label: 'Long (15+ days)' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={selectedDuration === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDuration(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Sort By
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'date', label: 'Start Date' },
                  { value: 'destination', label: 'Destination' },
                  { value: 'duration', label: 'Duration' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  Trip Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary">
                Search: {searchTerm}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            {selectedContinent !== 'all' && (
              <Badge variant="secondary">
                {selectedContinent}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedContinent('all')} />
              </Badge>
            )}
            {selectedDuration !== 'all' && (
              <Badge variant="secondary">
                {selectedDuration} trips
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedDuration('all')} />
              </Badge>
            )}
            {selectedTimeframe !== 'all' && (
              <Badge variant="secondary">
                {selectedTimeframe}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSelectedTimeframe('all')} />
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleTag(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}