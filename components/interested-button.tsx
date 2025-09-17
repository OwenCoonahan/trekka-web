'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toggleInterest, getInterestStatus } from '@/lib/actions/social'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface InterestedButtonProps {
  tripId: string
  interestCount?: number
  className?: string
}

export function InterestedButton({ tripId, interestCount = 0, className }: InterestedButtonProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [count, setCount] = useState(interestCount)

  useEffect(() => {
    getInterestStatus(tripId).then(setStatus)
  }, [tripId])

  async function handleToggle() {
    setIsLoading(true)
    try {
      const result = await toggleInterest(tripId)
      setStatus(result.status)

      if (result.status === 'interested') {
        setCount(prev => prev + (status === 'interested' ? 0 : 1))
        toast.success('Marked as interested!')
      } else {
        setCount(prev => Math.max(0, prev - 1))
        toast.success('Removed interest')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const isInterested = status === 'interested'

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isInterested ? 'default' : 'outline'}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Star className={`h-4 w-4 mr-2 ${isInterested ? 'fill-current' : ''}`} />
          Interested {count > 0 && `(${count})`}
        </>
      )}
    </Button>
  )
}