"use server"

import { sql } from "@/lib/db"
import { formatDateForDB, getDayOfWeekInThailand, getDayOfMonthInThailand, addDaysInThailand, getTodayInThailand } from "@/lib/utils"
import { BOOKING_AHEAD_DAYS } from "./booking-constants"

export interface TimeSlotAvailability {
  timeSlotId: number
  currentBookings: number
  bookingLimit: number
  isAvailable: boolean
}

export interface RoomDayOffData {
  date: string // ISO date string
  isDayOff: boolean
  reason?: string
  recurrenceType?: string
}

/**
 * Check booking availability for time slots on a specific date and room
 */
export async function checkTimeSlotAvailability(
  selectedDate: Date,
  selectedRoomId?: string
): Promise<TimeSlotAvailability[]> {
  try {
    // Use timezone-safe date formatting
    const dateString = formatDateForDB(selectedDate)
    const dayOfWeek = getDayOfWeekInThailand(selectedDate) // 0-6 (Sunday-Saturday) in Bangkok TZ
    
    let query
    if (selectedRoomId) {
      // Check availability for specific room
      // Filter by room's day-of-week time slot restrictions
      query = sql`
        SELECT 
          tr.id as time_slot_id,
          tr.booking_limit,
          COUNT(b.id) FILTER (WHERE b.status NOT IN ('cancelled', 'rejected')) as current_bookings,
          COALESCE(rtsa.is_available, true) as room_day_slot_available
        FROM time_rounds tr
        LEFT JOIN bookings b ON b.selected_time_slot_id = tr.id 
          AND b.selected_date = ${dateString}
          AND b.selected_room_id = ${selectedRoomId}
          AND b.status NOT IN ('cancelled', 'rejected')
        LEFT JOIN room_time_slot_availability rtsa ON rtsa.time_round_id = tr.id 
          AND rtsa.room_id = ${selectedRoomId}
          AND rtsa.day_of_week = ${dayOfWeek}
        WHERE tr.is_active = true
        GROUP BY tr.id, tr.booking_limit, rtsa.is_available
        ORDER BY tr.start_time ASC
      `
    } else {
      // Check availability across all rooms for each time slot
      query = sql`
        SELECT 
          tr.id as time_slot_id,
          tr.booking_limit,
          COUNT(b.id) FILTER (WHERE b.status NOT IN ('cancelled', 'rejected')) as current_bookings
        FROM time_rounds tr
        LEFT JOIN bookings b ON b.selected_time_slot_id = tr.id 
          AND b.selected_date = ${dateString}
          AND b.status NOT IN ('cancelled', 'rejected')
        WHERE tr.is_active = true
        GROUP BY tr.id, tr.booking_limit
        ORDER BY tr.start_time ASC
      `
    }

    const result = await query
    
    return result.map((row: any) => {
      const currentBookings = parseInt(row.current_bookings) || 0
      const bookingLimit = row.booking_limit || 1
      const isSlotFull = currentBookings >= bookingLimit
      
      // If room_day_slot_available exists (specific room query), check it
      const isDaySlotAvailable = row.room_day_slot_available !== undefined 
        ? row.room_day_slot_available === true || row.room_day_slot_available === 1
        : true // Default to available if no restriction

      return {
        timeSlotId: row.time_slot_id,
        currentBookings,
        bookingLimit,
        isAvailable: !isSlotFull && isDaySlotAvailable
      }
    })
    
  } catch (error) {
    console.error("Error checking time slot availability:", error)
    return []
  }
}

/**
 * Check if a specific time slot is available for booking
 */
export async function isTimeSlotAvailable(
  timeSlotId: string,
  selectedDate: Date,
  selectedRoomId?: string
): Promise<boolean> {
  try {
    // Use timezone-safe date formatting
    const dateString = formatDateForDB(selectedDate)
    const dayOfWeek = getDayOfWeekInThailand(selectedDate) // 0-6 (Sunday-Saturday) in Bangkok TZ
    
    let query
    if (selectedRoomId) {
      // Check for specific room, including day-of-week availability
      query = sql`
        SELECT 
          tr.booking_limit,
          COUNT(b.id) FILTER (WHERE b.status NOT IN ('cancelled', 'rejected')) as current_bookings,
          COALESCE(rtsa.is_available, true) as room_day_slot_available
        FROM time_rounds tr
        LEFT JOIN bookings b ON b.selected_time_slot_id = tr.id 
          AND b.selected_date = ${dateString}
          AND b.selected_room_id = ${selectedRoomId}
          AND b.status NOT IN ('cancelled', 'rejected')
        LEFT JOIN room_time_slot_availability rtsa ON rtsa.time_round_id = tr.id 
          AND rtsa.room_id = ${selectedRoomId}
          AND rtsa.day_of_week = ${dayOfWeek}
        WHERE tr.id = ${timeSlotId} AND tr.is_active = true
        GROUP BY tr.id, tr.booking_limit, rtsa.is_available
      `
    } else {
      // Check across all rooms
      query = sql`
        SELECT 
          tr.booking_limit,
          COUNT(b.id) FILTER (WHERE b.status NOT IN ('cancelled', 'rejected')) as current_bookings
        FROM time_rounds tr
        LEFT JOIN bookings b ON b.selected_time_slot_id = tr.id 
          AND b.selected_date = ${dateString}
          AND b.status NOT IN ('cancelled', 'rejected')
        WHERE tr.id = ${timeSlotId} AND tr.is_active = true
        GROUP BY tr.id, tr.booking_limit
      `
    }
    
    const result = await query
    
    if (result.length === 0) {
      return false // Time slot doesn't exist or is inactive
    }
    
    const { booking_limit, current_bookings, room_day_slot_available } = result[0]
    const isSlotNotFull = (parseInt(current_bookings) || 0) < (booking_limit || 1)
    
    // If room_day_slot_available exists (specific room query), check it
    if (room_day_slot_available !== undefined) {
      const isDaySlotAvailable = room_day_slot_available === true || room_day_slot_available === 1
      return isSlotNotFull && isDaySlotAvailable
    }
    
    return isSlotNotFull
    
  } catch (error) {
    console.error("Error checking time slot availability:", error)
    return false
  }
}

/**
 * Check if a date is a day off for a specific room
 * Returns true if the date is blocked (is a day off)
 */
export async function isRoomDayOff(
  roomId: string | number,
  selectedDate: Date
): Promise<boolean> {
  try {
    const dateString = formatDateForDB(selectedDate)
    // Use timezone-safe functions to get day-of-week and day-of-month
    const dayOfWeek = getDayOfWeekInThailand(selectedDate) // 0-6 (Sunday-Saturday)
    const dayOfMonth = getDayOfMonthInThailand(selectedDate) // 1-31

    // Check for both specific date and recurring day offs
    const result = await sql`
      SELECT COUNT(*) as count
      FROM room_day_offs
      WHERE room_id = ${roomId}
        AND is_active = true
        AND (
          -- Check for specific date day off
          (day_off_date = ${dateString} AND recurrence_type = 'once')
          OR
          -- Check for weekly recurring (every week on this day)
          (day_of_week = ${dayOfWeek} AND recurrence_type = 'weekly')
          OR
          -- Check for yearly recurring (same month/day each year)
          (
            recurrence_type = 'yearly'
            AND EXTRACT(MONTH FROM day_off_date) = EXTRACT(MONTH FROM ${dateString}::date)
            AND EXTRACT(DAY FROM day_off_date) = EXTRACT(DAY FROM ${dateString}::date)
          )
          OR
          -- Check for monthly recurring (same day each month)
          -- For monthly: day_of_week field stores day of month (1-31)
          (
            recurrence_type = 'monthly'
            AND day_of_week = ${dayOfMonth}
          )
        )
    `

    const count = parseInt(result[0]?.count || 0)
    return count > 0 // Return true if it's a day off
  } catch (error) {
    console.error("Error checking room day off:", error)
    return false
  }
}

/**
 * Get day off information for a date (used for displaying reason/info)
 */
export async function getRoomDayOffInfo(
  roomId: string | number,
  selectedDate: Date
): Promise<{ isDayOff: boolean; reason?: string; recurrenceType?: string } | null> {
  try {
    const dateString = formatDateForDB(selectedDate)
    // Use timezone-safe functions to get day-of-week and day-of-month
    const dayOfWeek = getDayOfWeekInThailand(selectedDate)
    const dayOfMonth = getDayOfMonthInThailand(selectedDate)

    const result = await sql`
      SELECT reason, recurrence_type, day_off_date
      FROM room_day_offs
      WHERE room_id = ${roomId}
        AND is_active = true
        AND (
          (day_off_date = ${dateString} AND recurrence_type = 'once')
          OR
          (day_of_week = ${dayOfWeek} AND recurrence_type = 'weekly')
          OR
          (
            recurrence_type = 'yearly'
            AND EXTRACT(MONTH FROM day_off_date) = EXTRACT(MONTH FROM ${dateString}::date)
            AND EXTRACT(DAY FROM day_off_date) = EXTRACT(DAY FROM ${dateString}::date)
          )
          OR
          (
            recurrence_type = 'monthly'
            AND day_of_week = ${dayOfMonth}
          )
        )
      LIMIT 1
    `

    if (result.length > 0) {
      return {
        isDayOff: true,
        reason: result[0].reason || undefined,
        recurrenceType: result[0].recurrence_type
      }
    }

    return { isDayOff: false }
  } catch (error) {
    console.error("Error getting room day off info:", error)
    return { isDayOff: false }
  }
}

/**
 * Check if a date is available for booking (not a day off)
 * Used for calendar/date picker
 */
export async function isDateAvailableForRoom(
  roomId: string | number,
  selectedDate: Date
): Promise<boolean> {
  const isDayOff = await isRoomDayOff(roomId, selectedDate)
  return !isDayOff
}

/**
 * Get room day-offs for a date range in a single query (OPTIMIZED BATCH QUERY)
 * Returns an array with day-off info for each date in the range
 * Much faster than calling isRoomDayOff 30 times
 */
export async function getRoomDayOffsForDateRange(
  roomId: string | number,
  startDate: Date,
  numberOfDays: number = BOOKING_AHEAD_DAYS
): Promise<RoomDayOffData[]> {
  try {
    const startDateString = formatDateForDB(startDate)
    const endDate = addDaysInThailand(startDate, numberOfDays - 1)
    const endDateString = formatDateForDB(endDate)

    // Fetch all day-offs for this room that fall within the date range
    const result = await sql`
      WITH all_dates AS (
        SELECT d::date FROM generate_series(
          ${startDateString}::date,
          ${endDateString}::date,
          '1 day'::interval
        ) AS d
      ),
      matching_dayoffs AS (
        SELECT 
          ad.d as check_date,
          rdo.reason,
          rdo.recurrence_type,
          CASE 
            WHEN rdo.id IS NOT NULL THEN true
            ELSE false
          END as is_day_off
        FROM all_dates ad
        LEFT JOIN room_day_offs rdo ON rdo.room_id = ${roomId}
          AND rdo.is_active = true
          AND (
            -- Check for specific date day off
            (ad.d = rdo.day_off_date AND rdo.recurrence_type = 'once')
            OR
            -- Check for weekly recurring
            (EXTRACT(DOW FROM ad.d) = rdo.day_of_week AND rdo.recurrence_type = 'weekly')
            OR
            -- Check for yearly recurring
            (
              rdo.recurrence_type = 'yearly'
              AND EXTRACT(MONTH FROM ad.d) = EXTRACT(MONTH FROM rdo.day_off_date)
              AND EXTRACT(DAY FROM ad.d) = EXTRACT(DAY FROM rdo.day_off_date)
            )
            OR
            -- Check for monthly recurring
            (
              rdo.recurrence_type = 'monthly'
              AND EXTRACT(DAY FROM ad.d) = rdo.day_of_week
            )
          )
        ORDER BY ad.d, CASE WHEN rdo.id IS NOT NULL THEN 0 ELSE 1 END
      )
      SELECT DISTINCT ON (check_date)
        check_date,
        is_day_off,
        reason,
        recurrence_type
      FROM matching_dayoffs
      ORDER BY check_date, is_day_off DESC
    `

    // Map results to the expected format
    return result.map((row: any) => ({
      date: formatDateForDB(new Date(row.check_date)),
      isDayOff: row.is_day_off,
      reason: row.reason || undefined,
      recurrenceType: row.recurrence_type || undefined
    }))
  } catch (error) {
    console.error("Error getting room day offs for date range:", error)
    // Return empty array for each date on error
    const dates: RoomDayOffData[] = []
    for (let i = 0; i < numberOfDays; i++) {
      dates.push({
        date: formatDateForDB(addDaysInThailand(startDate, i)),
        isDayOff: false
      })
    }
    return dates
  }
}
