interface MonthSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function MonthSection({ title, children, className }: MonthSectionProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}