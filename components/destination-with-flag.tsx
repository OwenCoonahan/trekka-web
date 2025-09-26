'use client'

import { useState, useEffect } from 'react'
import { locationService } from '@/lib/services/location'

interface DestinationWithFlagProps {
  destination: string
  className?: string
  showFlag?: boolean
}

export function DestinationWithFlag({
  destination,
  className = "",
  showFlag = true
}: DestinationWithFlagProps) {
  const [flag, setFlag] = useState<string | null>(null)
  const [loading, setLoading] = useState(showFlag)

  useEffect(() => {
    if (!showFlag) {
      setLoading(false)
      return
    }

    const flagEmoji = locationService.getFlagEmoji(destination)
    setFlag(flagEmoji)
    setLoading(false)
  }, [destination, showFlag])

  return (
    <span className={className}>
      {showFlag && loading && <span className="opacity-50">🌍</span>}
      {showFlag && !loading && flag && <span className="mr-1">{flag}</span>}
      {destination}
    </span>
  )
}