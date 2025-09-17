'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow, getIsFollowing } from '@/lib/actions/social'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  className?: string
}

export function FollowButton({ userId, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getIsFollowing(userId).then(setIsFollowing)
  }, [userId])

  async function handleToggle() {
    setIsLoading(true)
    try {
      const result = await toggleFollow(userId)
      setIsFollowing(result.following)
      toast.success(result.following ? 'Following!' : 'Unfollowed')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isFollowing ? 'secondary' : 'default'}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}