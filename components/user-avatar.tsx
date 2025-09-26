import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function UserAvatar({ src, alt = 'User avatar', size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const initials = alt
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{initials || 'U'}</AvatarFallback>
    </Avatar>
  )
}