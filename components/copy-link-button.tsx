'use client'

import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface CopyLinkButtonProps {
  url: string
  className?: string
}

export function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Copied!</span>
          <span className="sm:hidden">✓</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Copy Link</span>
          <span className="sm:hidden">Copy</span>
        </>
      )}
    </Button>
  )
}