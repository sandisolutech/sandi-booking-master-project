/**
 * DayOffDTO Adaptor
 * Transforms RoomDayOff database records to/from UI-friendly formats
 * Provides computed properties and Thai localization without modifying database schema
 */

import type { RoomDayOff } from '@/app/admin/rooms/actions'
import { formatDateForDB, getDayOfWeekInThailand, getTodayInThailand } from '@/lib/utils'

/**
 * UI-friendly DTO for day off display and editing
 */
export interface DayOffDTO {
  id: number
  roomId: number
  reason?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  
  // Recurrence fields
  recurrenceType: 'once' | 'weekly' | 'monthly' | 'yearly'
  dayOffDate?: Date                    // Used for 'once' and 'yearly' types
  dayOfWeek?: number                   // For 'weekly': 0-6 (Sunday-Saturday)
                                       // For 'monthly': 1-31 (day of month)
  
  // Computed properties (for UI display)
  displayText: string
  displayDate: string
  displayDay: string
  recurrenceLabel: string
  nextOccurrence?: Date
}

/**
 * Thai day names and month names for localization
 */
const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

/**
 * Convert database RoomDayOff to UI-friendly DayOffDTO
 */
export function toDayOffDTO(dayOff: RoomDayOff): DayOffDTO {
  const displayDay = getDisplayDay(dayOff)
  const displayDate = getDisplayDate(dayOff)
  const recurrenceLabel = getRecurrenceLabel(dayOff.recurrenceType)
  const nextOccurrence = calculateNextOccurrence(dayOff)

  return {
    id: dayOff.id,
    roomId: dayOff.roomId,
    reason: dayOff.reason,
    isActive: dayOff.isActive ?? true,
    createdAt: new Date(dayOff.createdAt),
    updatedAt: new Date(dayOff.updatedAt),
    recurrenceType: dayOff.recurrenceType,
    dayOffDate: dayOff.dayOffDate ? new Date(dayOff.dayOffDate) : undefined,
    dayOfWeek: dayOff.dayOfWeek,
    displayText: `${displayDay} • ${recurrenceLabel}`,
    displayDate,
    displayDay,
    recurrenceLabel,
    nextOccurrence,
  }
}

/**
 * Convert array of RoomDayOff to DayOffDTO[]
 */
export function toDayOffDTOs(dayOffs: RoomDayOff[]): DayOffDTO[] {
  return dayOffs.map(toDayOffDTO).sort((a, b) => {
    // Sort by date if both are 'once' type
    if (a.recurrenceType === 'once' && b.recurrenceType === 'once') {
      const dateA = a.dayOffDate?.getTime() ?? 0
      const dateB = b.dayOffDate?.getTime() ?? 0
      return dateA - dateB
    }
    // Sort recurring items by day of week
    if (a.dayOfWeek !== undefined && b.dayOfWeek !== undefined) {
      return a.dayOfWeek - b.dayOfWeek
    }
    return 0
  })
}

/**
 * Get display text for day (e.g., \"มกราคม 1, 2026\" or \"จันทร์\")
 */
function getDisplayDay(dayOff: RoomDayOff): string {
  if (dayOff.recurrenceType === 'once' && dayOff.dayOffDate) {
    const date = new Date(dayOff.dayOffDate)
    const day = date.getDate()
    const month = THAI_MONTHS[date.getMonth()]
    const year = date.getFullYear() + 543 // Thai Buddhist calendar
    return `${month} ${day}, ${year}`
  }

  if (dayOff.dayOfWeek !== undefined) {
    if (dayOff.recurrenceType === 'weekly') {
      return THAI_DAYS[dayOff.dayOfWeek]
    } else if (dayOff.recurrenceType === 'monthly') {
      // For monthly: dayOfWeek stores day of month (1-31)
      return `${dayOff.dayOfWeek}${dayOff.dayOfWeek === 1 ? 'st' : dayOff.dayOfWeek === 2 ? 'nd' : dayOff.dayOfWeek === 3 ? 'rd' : 'th'} day of month`
    }
  }

  return 'Unknown'
}

/**
 * Get formatted display date string
 */
function getDisplayDate(dayOff: RoomDayOff): string {
  if (dayOff.dayOffDate) {
    const date = new Date(dayOff.dayOffDate)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return ''
}

/**
 * Get recurrence label in Thai
 */
function getRecurrenceLabel(recurrenceType: string): string {
  const labels: Record<string, string> = {
    once: 'วันเดียว',
    weekly: 'ทุกสัปดาห์',
    monthly: 'ทุกเดือน',
    yearly: 'ทุกปี',
  }
  return labels[recurrenceType] || recurrenceType
}

/**
 * Calculate next occurrence date for recurring day offs
 */
function calculateNextOccurrence(dayOff: RoomDayOff): Date | undefined {
  if (dayOff.recurrenceType === 'once' && dayOff.dayOffDate) {
    return new Date(dayOff.dayOffDate)
  }

  const today = getTodayInThailand() // Use Bangkok timezone
  today.setHours(0, 0, 0, 0)

  if (dayOff.recurrenceType === 'weekly' && dayOff.dayOfWeek !== undefined) {
    const next = new Date(today)
    const currentDay = getDayOfWeekInThailand(next) // Use Bangkok timezone
    const daysUntil = (dayOff.dayOfWeek - currentDay + 7) % 7
    next.setDate(next.getDate() + (daysUntil === 0 ? 0 : daysUntil))
    return next
  }

  if (dayOff.recurrenceType === 'monthly' && dayOff.dayOfWeek !== undefined) {
    const next = new Date(today)
    const targetDay = dayOff.dayOfWeek // This is the day of month (1-31)
    if (next.getDate() >= targetDay) {
      next.setMonth(next.getMonth() + 1)
    }
    next.setDate(targetDay)
    return next
  }

  if (dayOff.recurrenceType === 'yearly' && dayOff.dayOffDate) {
    const baseDate = new Date(dayOff.dayOffDate)
    const next = new Date(today.getFullYear(), baseDate.getMonth(), baseDate.getDate())
    if (next < today) {
      next.setFullYear(next.getFullYear() + 1)
    }
    return next
  }

  return undefined
}

/**
 * Get day index from Thai day name
 */
export function getDayIndexFromThai(thaiDay: string): number {
  return THAI_DAYS.indexOf(thaiDay)
}

/**
 * Format date for API calls (YYYY-MM-DD) using Thailand timezone
 * Ensures consistency across all environments (local dev, production, etc.)
 */
export function formatDateForAPI(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Use formatDateForDB to ensure Thailand timezone is used
  return formatDateForDB(d)
}

/**
 * Check if a date is a day off
 */
export function isDayOff(date: Date, dayOffs: DayOffDTO[]): DayOffDTO | undefined {
  return dayOffs.find((dayOff) => {
    if (dayOff.recurrenceType === 'once' && dayOff.dayOffDate) {
      const offDate = new Date(dayOff.dayOffDate)
      return (
        offDate.getFullYear() === date.getFullYear() &&
        offDate.getMonth() === date.getMonth() &&
        offDate.getDate() === date.getDate()
      )
    }

    if (dayOff.recurrenceType === 'weekly' && dayOff.dayOfWeek !== undefined) {
      return getDayOfWeekInThailand(date) === dayOff.dayOfWeek // Use Bangkok timezone
    }

    if (dayOff.recurrenceType === 'monthly' && dayOff.dayOfWeek !== undefined) {
      // For monthly: dayOfWeek field stores the day of month (1-31)
      // This allows blocking the 5th of every month, 15th, etc.
      const dayOfMonth = dayOff.dayOfWeek
      return date.getDate() === dayOfMonth
    }

    if (dayOff.recurrenceType === 'yearly' && dayOff.dayOffDate) {
      const offDate = new Date(dayOff.dayOffDate)
      return (
        offDate.getMonth() === date.getMonth() &&
        offDate.getDate() === date.getDate()
      )
    }

    return false
  })
}
