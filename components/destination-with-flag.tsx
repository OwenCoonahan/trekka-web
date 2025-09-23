'use client'

import { useState, useEffect } from 'react'
import { getCountryFlagWithAliases } from '@/lib/utils/countries'

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
    if (!showFlag) return

    let mounted = true

    async function fetchFlag() {
      try {
        const countryFlag = await getCountryFlagWithAliases(destination)
        if (mounted) {
          setFlag(countryFlag)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching flag:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchFlag()

    return () => {
      mounted = false
    }
  }, [destination, showFlag])

  return (
    <span className={className}>
      {showFlag && loading && <span className="opacity-50">🌍</span>}
      {showFlag && !loading && flag && <span className="mr-1">{flag}</span>}
      {destination}
    </span>
  )
}