"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { customAlphabet } from "nanoid" // Import nanoid for booking number generation
import { type BookingStatus, BOOKING_STATUS } from "@/app/admin/bookings/types"
import { getActiveCustomFields } from "@/app/admin/settings/custom-fields/actions"
import { isTimeSlotAvailable } from "./booking-availability"
import { formatDateForDB } from "@/lib/utils"
import { saveBookingCustomFieldValues, getBookingCustomFieldValues } from "@/lib/custom-field-value-utils"

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10) // Generate 10-character alphanumeric booking numbers

export type Booking = {
  id: number
  selectedDate: Date
  selectedRoomId: string
  selectedTimeSlotId: string
  customCompanyName: string | null
  agreedToTerms: boolean
  status: BookingStatus
  linkId: number
  createdAt: Date
  updatedAt: Date
  bookingNumber: string
  companyId: number | null
  customFieldData: Record<string, any> // New field for custom form data
  lineUserId?: string | null
  lineDisplayName?: string | null
  linePictureUrl?: string | null
  lineStatusMessage?: string | null
}

export async function createBooking(bookingData: {
  customFieldData?: Record<string, any> // New field for custom form data
  selectedDate: Date
  selectedRoomId: string
  selectedTimeSlotId: string
  customCompanyName: string | null
  agreedToTerms: boolean
  linkId: number
  companyId: number | null
  approvalMode?: "auto" | "manual" // Add approval mode parameter
  status?: BookingStatus
  adminOverride?: boolean // Add admin override to bypass availability checks
  lineProfile?: {
    userId?: string
    displayName?: string
    pictureUrl?: string
    statusMessage?: string
  } | null
}) {
  const {
    customFieldData = {}, // Default to empty object
    selectedDate,
    selectedRoomId,
    selectedTimeSlotId,
    customCompanyName,
    agreedToTerms,
    linkId,
    companyId,
    approvalMode = "manual", // Default to manual if not provided
    status, // Allow explicit status override
    adminOverride = false, // Default to false for customer bookings
    lineProfile = null, // LINE profile data
  } = bookingData

  // Determine the booking status based on approval mode
  const bookingStatus = status || (approvalMode === "auto" ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.PENDING)

  const bookingNumber = nanoid() // Generate unique booking number

  // Transform custom field data to include titles and values
  let enrichedCustomFieldData = {}
  let activeCustomFields: any[] = []
  if (customFieldData && Object.keys(customFieldData).length > 0) {
    try {
      activeCustomFields = await getActiveCustomFields()
      enrichedCustomFieldData = Object.entries(customFieldData).reduce((acc, [fieldId, value]) => {
        const field = activeCustomFields.find(f => f.id === parseInt(fieldId))
        if (field && value !== null && value !== undefined && value !== '') {
          acc[fieldId] = {
            title: field.title,
            value: value,
            fieldType: field.fieldType
          }
        }
        return acc
      }, {} as Record<string, any>)
    } catch (error) {
      console.error("Error enriching custom field data:", error)
      enrichedCustomFieldData = customFieldData
    }
  }

  // Check if the time slot is still available before creating the booking (unless admin override)
  if (!adminOverride) {
    const isAvailable = await isTimeSlotAvailable(selectedTimeSlotId, selectedDate, selectedRoomId)
    if (!isAvailable) {
      return { 
        success: false, 
        message: "This time slot is now full. Please select another time slot." 
      }
    }
  } else {
    console.log("🔓 Admin override enabled - bypassing time slot availability check")
  }

  try {
    // Use timezone-safe date formatting for database
    const dateString = formatDateForDB(selectedDate)
    
    const result = await sql`
      INSERT INTO bookings (
        selected_date, selected_room_id, selected_time_slot_id,
        custom_company_name, agreed_to_terms, status, link_id, booking_number, company_id,
        line_user_id, line_display_name, line_picture_url, line_status_message
      ) VALUES (
        ${dateString}, ${selectedRoomId}, ${selectedTimeSlotId},
        ${customCompanyName}, ${agreedToTerms}, ${bookingStatus}, ${linkId}, ${bookingNumber}, ${companyId},
        ${lineProfile?.userId || null}, ${lineProfile?.displayName || null}, ${lineProfile?.pictureUrl || null}, ${lineProfile?.statusMessage || null}
      )
      RETURNING id;
    `
    
    const bookingId = result[0].id
    
    // Save custom field values to the new table
    if (Object.keys(enrichedCustomFieldData).length > 0 && activeCustomFields.length > 0) {
      await saveBookingCustomFieldValues(bookingId, customFieldData, activeCustomFields)
    }
    
    revalidatePath(`/register/${linkId}`) // Revalidate the booking page
    return { success: true, message: "Booking submitted successfully!", bookingNumber, bookingId }
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return { success: false, message: error.message || "Failed to submit booking." }
  }
}

export async function getBookingsByLineUserId(lineUserId: string) {
  try {
    console.log('Fetching bookings for LINE user ID:', lineUserId)
    
    const bookings = await sql`
      SELECT 
        b.*,
        r.name as room_name,
        r.description as room_description,
        tr.name as time_slot_name,
        tr.start_time,
        tr.end_time,
        c.name as company_name,
        bl.name as link_name
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN booking_links bl ON b.link_id = bl.id
      WHERE b.line_user_id = ${lineUserId}
      ORDER BY b.selected_date DESC, b.created_at DESC
    `
    
    return await Promise.all(bookings.map(async (booking: any) => {
      const customFieldData = await getBookingCustomFieldValues(booking.id)
      
      return {
        id: booking.id,
        bookingNumber: booking.booking_number,
        selectedDate: new Date(booking.selected_date),
        status: booking.status,
        roomName: booking.room_name,
        roomDescription: booking.room_description,
        timeSlotName: booking.time_slot_name,
        startTime: booking.start_time,
        endTime: booking.end_time,
        companyName: booking.company_name,
        linkName: booking.link_name,
        customFieldData: customFieldData,
        lineDisplayName: booking.line_display_name,
        linePictureUrl: booking.line_picture_url,
        createdAt: new Date(booking.created_at),
        updatedAt: new Date(booking.updated_at)
      }
    }))
  } catch (error) {
    console.error("Error fetching bookings by LINE user ID:", error)
    return []
  }
}
