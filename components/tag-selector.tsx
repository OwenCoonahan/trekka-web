'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const AVAILABLE_TAGS = [
  { value: 'Work', icon: '💼', category: 'purpose' },
  { value: 'Business', icon: '💼', category: 'purpose' },
  { value: 'Exploring', icon: '🗺️', category: 'activity' },
  { value: 'Adventure', icon: '🏔️', category: 'activity' },
  { value: 'Social', icon: '🎉', category: 'purpose' },
  { value: 'Friends', icon: '👥', category: 'purpose' },
  { value: 'Family', icon: '👨‍👩‍👧‍👦', category: 'purpose' },
  { value: 'Sports', icon: '⚽', category: 'activity' },
  { value: 'Fitness', icon: '💪', category: 'activity' },
  { value: 'Culture', icon: '🎭', category: 'activity' },
  { value: 'Food', icon: '🍴', category: 'activity' },
  { value: 'Relaxation', icon: '🧘', category: 'activity' },
  { value: 'Beach', icon: '🏖️', category: 'activity' },
  { value: 'Skiing', icon: '⛷️', category: 'activity' },
  { value: 'Conference', icon: '📊', category: 'purpose' },
  { value: 'Wedding', icon: '💒', category: 'purpose' },
]

interface TagSelectorProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
}

export function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.value)
          return (
            <Badge
              key={tag.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent"
              )}
              onClick={() => onTagToggle(tag.value)}
            >
              {tag.icon} {tag.value}
            </Badge>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Click tags to select trip categories (optional)
      </p>
    </div>
  )
}