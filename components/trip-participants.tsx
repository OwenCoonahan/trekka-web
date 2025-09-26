'use client'

import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { Users } from 'lucide-react'
import { Participant } from '@/components/participants-selector'

interface TripParticipantsProps {
  participants: Participant[]
  showLabel?: boolean
  maxVisible?: number
  className?: string
}

export function TripParticipants({
  participants,
  showLabel = true,
  maxVisible = 5,
  className
}: TripParticipantsProps) {
  if (!participants || participants.length === 0) {
    return null
  }

  const visibleParticipants = participants.slice(0, maxVisible)
  const remainingCount = Math.max(0, participants.length - maxVisible)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>With:</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {visibleParticipants.map((participant, index) => (
          <Badge
            key={`${participant.type}-${participant.id || participant.name}-${index}`}
            variant={participant.type === 'member' ? 'default' : 'secondary'}
            className="flex items-center gap-1 px-2 py-1"
          >
            {participant.type === 'member' && participant.avatar_url && (
              <UserAvatar
                src={participant.avatar_url}
                alt={participant.name}
                size="xs"
                className="w-4 h-4"
              />
            )}
            {participant.type === 'non_member' && (
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-[8px] text-white font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs">
              {participant.name}
            </span>
          </Badge>
        ))}

        {remainingCount > 0 && (
          <Badge variant="outline" className="px-2 py-1">
            <span className="text-xs">+{remainingCount} more</span>
          </Badge>
        )}
      </div>
    </div>
  )
}