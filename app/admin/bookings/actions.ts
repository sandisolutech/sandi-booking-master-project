"use server"

import { sql } from "@/lib/db"
import type { Booking, BookingStatus, CustomFieldData, CustomFieldValue } from "./types"
import { BOOKING_STATUS, getBookingStatusColor } from "./types"
import { getBookingCustomFieldValues } from "@/lib/custom-field-value-utils"

interface GetBookingsParams {
  companyId?: string
  roomId?: string
  status?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export async function getBookings({
  companyId,
  roomId,
  status,
  search,
  startDate,
  endDate,
  page = 1,
  pageSize = 100,
}: GetBookingsParams) {
  try {
    const offset = (page - 1) * pageSize

    let baseQuery = sql`
      SELECT
        b.id,
        b.selected_date,
        b.selected_room_id,
        r.name AS room_name,
        b.selected_time_slot_id,
        tr.start_time AS time_slot_start_time,
        tr.end_time AS time_slot_end_time,
        b.custom_company_name,
        b.agreed_to_terms,
        b.status,
        b.link_id,
        b.created_at,
        b.updated_at,
        b.booking_number,
        b.company_id,
        c.name AS company_name
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      WHERE 1=1
    `

    if (companyId && companyId !== "all") {
      baseQuery = sql`${baseQuery} AND b.company_id = ${Number(companyId)}`
    }

    if (roomId && roomId !== "all") {
      baseQuery = sql`${baseQuery} AND b.selected_room_id = ${roomId}`
    }

    if (status && status !== "all" && status !== "active") {
      baseQuery = sql`${baseQuery} AND b.status = ${status}`
    } else if (status === "active") {
      // Active bookings exclude cancelled and rejected
      baseQuery = sql`${baseQuery} AND b.status NOT IN ('cancelled', 'rejected')`
    }

    if (search) {
      const term = `%${search.toLowerCase()}%`
      baseQuery = sql`${baseQuery} AND (
        LOWER(b.booking_number) LIKE ${term} 
        OR LOWER(c.name) LIKE ${term} 
        OR LOWER(b.custom_company_name) LIKE ${term}
        OR EXISTS (
          SELECT 1 FROM booking_custom_field_values bcfv
          WHERE bcfv.booking_id = b.id
            AND LOWER(bcfv.value) LIKE ${term}
        )
      )`
    }

    if (startDate) {
      baseQuery = sql`${baseQuery} AND b.selected_date >= ${startDate}`
    }

    if (endDate) {
      baseQuery = sql`${baseQuery} AND b.selected_date <= ${endDate}`
    }

    // Add ordering, pagination
    baseQuery = sql`${baseQuery} ORDER BY b.selected_date DESC, tr.start_time ASC LIMIT ${pageSize} OFFSET ${offset}`

    const dataRes = await sql`${baseQuery}`

    /* ------------------ Count query ------------------ */
    let countQuery = sql`
      SELECT COUNT(*)::int AS total
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      WHERE 1=1
    `

    if (companyId && companyId !== "all") {
      countQuery = sql`${countQuery} AND b.company_id = ${Number(companyId)}`
    }

    if (roomId && roomId !== "all") {
      countQuery = sql`${countQuery} AND b.selected_room_id = ${roomId}`
    }

    if (status && status !== "all" && status !== "active") {
      countQuery = sql`${countQuery} AND b.status = ${status}`
    } else if (status === "active") {
      // Active bookings exclude cancelled and rejected
      countQuery = sql`${countQuery} AND b.status NOT IN ('cancelled', 'rejected')`
    }

    if (search) {
      const term = `%${search.toLowerCase()}%`
      countQuery = sql`${countQuery} AND (
        LOWER(b.booking_number) LIKE ${term} 
        OR LOWER(c.name) LIKE ${term} 
        OR LOWER(b.custom_company_name) LIKE ${term}
        OR EXISTS (
          SELECT 1 FROM booking_custom_field_values bcfv
          WHERE bcfv.booking_id = b.id
            AND LOWER(bcfv.value) LIKE ${term}
        )
      )`
    }

    if (startDate) {
      countQuery = sql`${countQuery} AND b.selected_date >= ${startDate}`
    }

    if (endDate) {
      countQuery = sql`${countQuery} AND b.selected_date <= ${endDate}`
    }

    const countRes = await sql`${countQuery}`

    const bookings = dataRes as Booking[]
    const totalCount = Array.isArray(countRes) ? countRes[0]?.total ?? 0 : 0

    const transformedBookings = await Promise.all(bookings.map(async (b) => {
      const day = new Date(b.selected_date)
      const [sh, sm] = (b.time_slot_start_time ?? "00:00").split(":").map(Number)
      const [eh, em] = (b.time_slot_end_time ?? "00:00").split(":").map(Number)

      const start = new Date(day)
      start.setHours(sh, sm, 0, 0)

      const end = new Date(day)
      end.setHours(eh, em, 0, 0)

      // Color based on status using constants
      const color = getBookingStatusColor(b.status)

      // Generate title from custom field data or booking number
      let titleName = "Booking"
      let customFieldData: CustomFieldValue[] = [];
       customFieldData = await getBookingCustomFieldValues(b.id)

      return {
        ...b,
        custom_field_data: customFieldData,
        title: `${titleName} - ${b.booking_number}`,
        start: start.toISOString(),
        end: end.toISOString(),
        color,
        classNames: b.agreed_to_terms === false ? ["event-warning"] : [],
      }
    }))
    return { bookings: transformedBookings, totalCount }
  } catch (err: any) {
    console.error("❌ Error fetching bookings:", {
      message: err?.message,
      stack: err?.stack,
      full: err,
    })
    throw new Error("Failed to fetch bookings: " + (err?.message || "Unknown error"))
  }
}

export async function getBookingById(bookingId: number) {
  try {
    const result = await sql`
      SELECT
        b.id,
        b.selected_date,
        b.selected_room_id,
        r.name AS room_name,
        b.selected_time_slot_id,
        tr.start_time AS time_slot_start_time,
        tr.end_time AS time_slot_end_time,
        b.custom_company_name,
        b.agreed_to_terms,
        b.status,
        b.link_id,
        bl.uuid as link_uuid,
        b.created_at,
        b.updated_at,
        b.booking_number,
        b.company_id,
        c.name AS company_name
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN booking_links bl ON b.link_id = bl.id
      WHERE b.id = ${bookingId}
    `

    if (result.length === 0) {
      return null
    }

    const booking = result[0]
    return {
      id: booking.id,
      selectedDate: booking.selected_date,
      roomId: booking.selected_room_id,
      roomName: booking.room_name,
      timeSlotId: booking.selected_time_slot_id,
      timeSlotStartTime: booking.time_slot_start_time,
      timeSlotEndTime: booking.time_slot_end_time,
      customCompanyName: booking.custom_company_name,
      agreedToTerms: booking.agreed_to_terms,
      status: booking.status as BookingStatus,
      linkId: booking.link_id,
      linkUuid: booking.link_uuid,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      bookingNumber: booking.booking_number,
      companyId: booking.company_id,
      companyName: booking.company_name || booking.custom_company_name,
      customFieldData: await getBookingCustomFieldValues(bookingId),
    }
  } catch (error) {
    console.error("Error fetching booking by ID:", error)
    throw new Error("Failed to fetch booking details")
  }
}

export async function getBookingByNumber(bookingNumber: string) {
  try {
    const result = await sql`
      SELECT
        b.id,
        b.selected_date,
        b.selected_room_id,
        r.name AS room_name,
        b.selected_time_slot_id,
        tr.start_time AS time_slot_start_time,
        tr.end_time AS time_slot_end_time,
        tr.name AS time_slot_name,
        b.custom_company_name,
        b.agreed_to_terms,
        b.status,
        b.link_id,
        bl.uuid as link_uuid,
        b.created_at,
        b.updated_at,
        b.booking_number,
        b.company_id,
        c.name AS company_name
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN booking_links bl ON b.link_id = bl.id
      WHERE b.booking_number = ${bookingNumber}
    `

    if (result.length === 0) {
      return null
    }

    const booking = result[0]
    const customFieldData: CustomFieldValue[] = await getBookingCustomFieldValues(booking.id)
    
    return {
      id: booking.id,
      selectedDate: booking.selected_date,
      roomId: booking.selected_room_id,
      roomName: booking.room_name,
      timeSlotId: booking.selected_time_slot_id,
      timeSlotStartTime: booking.time_slot_start_time,
      timeSlotEndTime: booking.time_slot_end_time,
      timeSlotName: booking.time_slot_name,
      customCompanyName: booking.custom_company_name,
      agreedToTerms: booking.agreed_to_terms,
      status: booking.status as BookingStatus,
      linkId: booking.link_id,
      linkUuid: booking.link_uuid,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      bookingNumber: booking.booking_number,
      companyId: booking.company_id,
      companyName: booking.company_name || booking.custom_company_name,
      customFieldData: customFieldData,
    }
  } catch (error) {
    console.error("Error fetching booking by number:", error)
    throw new Error("Failed to fetch booking details")
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  reason?: string,
) {
  try {
    await sql`
      UPDATE bookings
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${bookingId};
    `
    // Optionally, you could return the updated booking or a success message
    return { success: true, message: `Booking ${bookingId} updated to ${status}.` }
  } catch (error) {
    console.error("Error updating booking status:", error)
    throw new Error("Failed to update booking status.")
  }
}

export async function moveBooking(bookingId: number, moveData: {
  selected_date: string
  room_id: number
  time_slot_id: number
}) {
  try {
    const result = await sql`
      UPDATE bookings
      SET selected_date = ${moveData.selected_date},
          selected_room_id = ${moveData.room_id},
          selected_time_slot_id = ${moveData.time_slot_id},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *;
    `
    
    return result[0]
  } catch (error) {
    console.error('Error moving booking:', error)
    throw new Error('Failed to move booking')
  }
}
