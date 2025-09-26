import { format, isAfter, isBefore, parseISO } from 'date-fns'

export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end

  const startMonth = format(startDate, 'MMM')
  const endMonth = format(endDate, 'MMM')
  const startYear = format(startDate, 'yyyy')
  const endYear = format(endDate, 'yyyy')

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${format(startDate, 'd')} - ${format(endDate, 'd MMM yyyy')}`
    }
    return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM yyyy')}`
  }

  return `${format(startDate, 'd MMM yyyy')} - ${format(endDate, 'd MMM yyyy')}`
}

export function isUpcoming(start: string | Date, end: string | Date): boolean {
  const now = new Date()
  const endDate = typeof end === 'string' ? parseISO(end) : end
  return isAfter(endDate, now)
}

export function isPast(start: string | Date, end: string | Date): boolean {
  const now = new Date()
  const endDate = typeof end === 'string' ? parseISO(end) : end
  return isBefore(endDate, now)
}

export function isCurrent(start: string | Date, end: string | Date): boolean {
  const now = new Date()
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end
  return isAfter(now, startDate) && isBefore(now, endDate)
}