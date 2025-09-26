import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Instagram, Globe, Linkedin } from 'lucide-react'

interface SocialLinksProps {
  links: {
    instagram?: string
    tiktok?: string
    linkedin?: string
    x?: string
    website?: string
  }
  className?: string
}

export function SocialLinks({ links, className }: SocialLinksProps) {
  const socialLinks = []

  if (links.instagram) {
    socialLinks.push({
      name: 'Instagram',
      url: links.instagram,
      icon: Instagram,
    })
  }

  if (links.tiktok) {
    socialLinks.push({
      name: 'TikTok',
      url: links.tiktok,
      icon: null, // TikTok icon not in lucide
    })
  }

  if (links.linkedin) {
    socialLinks.push({
      name: 'LinkedIn',
      url: links.linkedin,
      icon: Linkedin,
    })
  }

  if (links.x) {
    socialLinks.push({
      name: 'X',
      url: links.x,
      icon: null, // X icon not in lucide
    })
  }

  if (links.website) {
    socialLinks.push({
      name: 'Website',
      url: links.website,
      icon: Globe,
    })
  }

  if (socialLinks.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {socialLinks.map(({ name, url, icon: Icon }) => (
        <Link key={name} href={url} target="_blank" rel="noopener noreferrer">
          <Badge variant="secondary" className="hover:bg-secondary/80">
            {Icon && <Icon className="h-3 w-3 mr-1" />}
            {name}
          </Badge>
        </Link>
      ))}
    </div>
  )
}