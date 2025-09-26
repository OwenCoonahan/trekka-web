'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { locationService } from '@/lib/services/location'
import { MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showFlag?: boolean
}

interface LocationSuggestion {
  name: string
  country: string
  flag: string
  type: 'city' | 'country'
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter location...",
  className,
  showFlag = true
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Generate suggestions based on input
  const generateSuggestions = (input: string): LocationSuggestion[] => {
    if (!input || input.length < 2) return []

    const suggestions: LocationSuggestion[] = []
    const lowerInput = input.toLowerCase()

    // Get city suggestions from our city mapping
    const cityMatches = Object.entries({
      // Popular US cities
      'new york': 'US', 'los angeles': 'US', 'san francisco': 'US', 'chicago': 'US',
      'miami': 'US', 'las vegas': 'US', 'seattle': 'US', 'boston': 'US',
      'austin': 'US', 'dallas': 'US', 'houston': 'US', 'phoenix': 'US',
      'denver': 'US', 'atlanta': 'US', 'philadelphia': 'US', 'orlando': 'US',
      'portland': 'US', 'nashville': 'US', 'salt lake city': 'US',

      // Utah cities specifically
      'moab': 'US', 'park city': 'US', 'provo': 'US', 'ogden': 'US', 'st george': 'US',

      // International cities
      'london': 'GB', 'paris': 'FR', 'berlin': 'DE', 'rome': 'IT', 'madrid': 'ES',
      'amsterdam': 'NL', 'vienna': 'AT', 'zurich': 'CH', 'brussels': 'BE',
      'stockholm': 'SE', 'oslo': 'NO', 'copenhagen': 'DK', 'prague': 'CZ',
      'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'seoul': 'KR',
      'beijing': 'CN', 'shanghai': 'CN', 'hong kong': 'HK', 'singapore': 'SG',
      'bangkok': 'TH', 'manila': 'PH', 'jakarta': 'ID', 'kuala lumpur': 'MY',
      'mumbai': 'IN', 'delhi': 'IN', 'bangalore': 'IN', 'chennai': 'IN',
      'dubai': 'AE', 'abu dhabi': 'AE', 'doha': 'QA', 'riyadh': 'SA',
      'tel aviv': 'IL', 'istanbul': 'TR', 'sydney': 'AU', 'melbourne': 'AU',
      'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA',
      'rio de janeiro': 'BR', 'sao paulo': 'BR', 'buenos aires': 'AR',
      'cairo': 'EG', 'cape town': 'ZA', 'johannesburg': 'ZA', 'casablanca': 'MA'
    }).filter(([city]) => city.includes(lowerInput))

    // Add city suggestions
    cityMatches.forEach(([cityName, countryCode]) => {
      const country = locationService.getCountryByCode(countryCode)
      if (country) {
        suggestions.push({
          name: cityName,
          country: country.name,
          flag: country.flag,
          type: 'city'
        })
      }
    })

    // Add country suggestions
    const countries = locationService.searchCountries(input)
    countries.forEach(country => {
      if (suggestions.length < 10) {
        suggestions.push({
          name: country.name,
          country: country.name,
          flag: country.flag,
          type: 'country'
        })
      }
    })

    return suggestions.slice(0, 8) // Limit to 8 suggestions
  }

  useEffect(() => {
    const suggestions = generateSuggestions(value)
    setSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0 && value.length >= 2)
    setSelectedIndex(-1)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationText = suggestion.type === 'city'
      ? `${toTitleCase(suggestion.name)}, ${suggestion.country}`
      : suggestion.country

    onChange(locationText)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  const clearInput = () => {
    onChange('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className={cn("pl-9 pr-8", className)}
          autoComplete="off"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearInput}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.name}`}
              className={cn(
                "w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-none bg-transparent",
                selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {showFlag && (
                <span className="text-sm">{suggestion.flag}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {toTitleCase(suggestion.name)}
                </div>
                {suggestion.type === 'city' && (
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.country}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 capitalize">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}