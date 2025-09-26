'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { Users, X, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchProfiles } from '@/lib/actions/profile'

export interface Participant {
  type: 'member' | 'non_member'
  id?: string // For members
  name: string
  username?: string // For members
  avatar_url?: string // For members
}

interface ParticipantsSelectorProps {
  participants: Participant[]
  onChange: (participants: Participant[]) => void
  className?: string
}

export function ParticipantsSelector({
  participants,
  onChange,
  className
}: ParticipantsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search for members using the searchProfiles action
  const searchMembers = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const profiles = await searchProfiles(query)
      setSuggestions(profiles)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching profiles:', error)
      setSuggestions([])
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMembers(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const addParticipant = (participant: Participant) => {
    // Check if participant already exists
    const exists = participants.some(p =>
      p.type === participant.type &&
      (p.type === 'member' ? p.id === participant.id : p.name.toLowerCase() === participant.name.toLowerCase())
    )

    if (!exists) {
      onChange([...participants, participant])
    }

    setSearchTerm('')
    setShowSuggestions(false)
  }

  const removeParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index)
    onChange(newParticipants)
  }

  const handleAddNonMember = () => {
    const trimmedName = searchTerm.trim()
    if (trimmedName) {
      addParticipant({
        type: 'non_member',
        name: trimmedName
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Add selected member
        const member = suggestions[selectedIndex]
        addParticipant({
          type: 'member',
          id: member.id,
          name: member.display_name || member.username,
          username: member.username,
          avatar_url: member.avatar_url
        })
      } else if (searchTerm.trim()) {
        // Add as non-member
        handleAddNonMember()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      )
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-4 w-4" />
        <span>Trip Participants</span>
      </div>

      {/* Selected Participants */}
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {participants.map((participant, index) => (
            <Badge
              key={`${participant.type}-${participant.id || participant.name}-${index}`}
              variant={participant.type === 'member' ? 'default' : 'secondary'}
              className="flex items-center gap-2 py-1 px-2"
            >
              {participant.type === 'member' && participant.avatar_url && (
                <UserAvatar
                  src={participant.avatar_url}
                  alt={participant.name}
                  size="xs"
                />
              )}
              {participant.type === 'non_member' && (
                <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                  <span className="text-[10px] text-white font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm">
                {participant.name}
                {participant.type === 'member' && participant.username && (
                  <span className="text-xs opacity-70 ml-1">@{participant.username}</span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeParticipant(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search members or add names..."
            className="pl-9 pr-20"
          />
          {searchTerm.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs"
              onClick={handleAddNonMember}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Member Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-40 overflow-auto">
            {suggestions.map((member, index) => (
              <button
                key={member.id}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-none bg-transparent",
                  selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
                )}
                onClick={() => addParticipant({
                  type: 'member',
                  id: member.id,
                  name: member.display_name || member.username,
                  username: member.username,
                  avatar_url: member.avatar_url
                })}
              >
                <UserAvatar
                  src={member.avatar_url}
                  alt={member.display_name || member.username}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {member.display_name || member.username}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{member.username}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Help Text */}
        {searchTerm.trim() && suggestions.length === 0 && showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No members found. Press Enter or click "Add" to add "{searchTerm}" as a non-member.
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Search for Trekka members or type names to add non-members. Members appear with profile pics, non-members with initials.
      </div>
    </div>
  )
}