"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid" // Import uuid generator
import { getBookingCustomFieldValues } from "@/lib/custom-field-value-utils"

export type BookingLink = {
  id: number
  name: string
  description: string | null
  uuid: string // Changed from 'url' to 'uuid'
  isActive: boolean
  linkType: "reusable" | "oneTime"
  approvalMode: "auto" | "manual"
  expirationType: "unlimited" | "limited"
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
  companyId: number | null // Added companyId
  countClick: number // Added count_click field
}

// Helper to convert database row to BookingLink type
const mapRowToBookingLink = (row: any): BookingLink => ({
  id: row.id,
  name: row.name,
  description: row.description,
  uuid: row.uuid, // Mapped from 'uuid' column
  isActive: row.is_active,
  linkType: row.link_type,
  approvalMode: row.approval_mode,
  expirationType: row.expiration_type,
  startDate: row.start_date ? new Date(row.start_date) : null,
  endDate: row.end_date ? new Date(row.end_date) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  companyId: row.company_id, // Mapped from 'company_id'
  countClick: row.count_click || 0, // Added count_click mapping with default 0
})

export async function getAllBookingLinks(): Promise<BookingLink[]> {
  try {
    const result =
      await sql`SELECT id, name, description, uuid, is_active, link_type, approval_mode, expiration_type, start_date, end_date, created_at, updated_at, company_id, count_click FROM booking_links ORDER BY created_at DESC;`

    if (Array.isArray(result)) {
      return result.map(mapRowToBookingLink)
    }

    console.error("Unexpected response format from database:", result)
    return []
  } catch (error) {
    console.error("Error fetching booking links:", error)
    return []
  }
}

export async function getBookingLinkById(id: number): Promise<BookingLink | null> {
  try {
    const result =
      await sql`SELECT id, name, description, uuid, is_active, link_type, approval_mode, expiration_type, start_date, end_date, created_at, updated_at, company_id, count_click FROM booking_links WHERE id = ${id};`

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToBookingLink(result[0])
    }

    return null
  } catch (error) {
    console.error(`Error fetching booking link with ID ${id}:`, error)
    return null
  }
}

// New function to get booking link by UUID
export async function getBookingLinkByUuid(uuid: string): Promise<BookingLink | null> {
  try {
    const result =
      await sql`SELECT id, name, description, uuid, is_active, link_type, approval_mode, expiration_type, start_date, end_date, created_at, updated_at, company_id, count_click FROM booking_links WHERE uuid = ${uuid};`

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToBookingLink(result[0])
    }

    return null
  } catch (error) {
    console.error(`Error fetching booking link with UUID ${uuid}:`, error)
    return null
  }
}

export async function createBookingLink(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const isActive = formData.get("isActive") === "on"
  const linkType = formData.get("linkType") as "reusable" | "oneTime"
  const approvalMode = formData.get("approvalMode") as "auto" | "manual"
  const expirationType = formData.get("expirationType") as "unlimited" | "limited"
  const startDate = formData.get("startDate") as string | null
  const endDate = formData.get("endDate") as string | null
  const companyId = formData.get("companyId") ? Number.parseInt(formData.get("companyId") as string) : null

  const newUuid = uuidv4() // Generate a new UUID

  try {
    await sql`
      INSERT INTO booking_links (
        name, description, uuid, is_active, link_type, approval_mode,
        expiration_type, start_date, end_date, company_id, count_click
      ) VALUES (
        ${name}, ${description}, ${newUuid}, ${isActive}, ${linkType}, ${approvalMode},
        ${expirationType}, ${startDate || null}, ${endDate || null}, ${companyId}, 0
      );
    `
    revalidatePath("/admin/links")
    return { success: true, message: "Booking link created successfully!" }
  } catch (error: any) {
    console.error("Error creating booking link:", error)
    return { success: false, message: error.message || "Failed to create booking link." }
  }
}

export async function updateBookingLink(id: number, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const isActive = formData.get("isActive") === "on"
  const linkType = formData.get("linkType") as "reusable" | "oneTime"
  const approvalMode = formData.get("approvalMode") as "auto" | "manual"
  const expirationType = formData.get("expirationType") as "unlimited" | "limited"
  const startDate = formData.get("startDate") as string | null
  const endDate = formData.get("endDate") as string | null
  const companyId = formData.get("companyId") ? Number.parseInt(formData.get("companyId") as string) : null

  try {
    await sql`
      UPDATE booking_links
      SET
        name = ${name},
        description = ${description},
        is_active = ${isActive},
        link_type = ${linkType},
        approval_mode = ${approvalMode},
        expiration_type = ${expirationType},
        start_date = ${startDate || null},
        end_date = ${endDate || null},
        company_id = ${companyId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `
    revalidatePath(`/admin/links/${id}`)
    revalidatePath("/admin/links") // Revalidate the list page too
    return { success: true, message: "Booking link updated successfully!" }
  } catch (error: any) {
    console.error(`Error updating booking link with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to update booking link." }
  }
}

export async function deleteBookingLink(id: number) {
  try {
    await sql`DELETE FROM booking_links WHERE id = ${id};`
    revalidatePath("/admin/links")
    return { success: true, message: "Booking link deleted successfully!" }
  } catch (error: any) {
    console.error(`Error deleting booking link with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to delete booking link." }
  }
}

// Define the Booking type for consistency
export type Booking = {
  id: number
  selectedDate: Date
  selectedRoomId: string
  selectedTimeSlotId: string
  customCompanyName: string | null
  agreedToTerms: boolean
  status: "pending" | "confirmed" | "cancelled"
  linkId: number
  createdAt: Date
  updatedAt: Date
  bookingNumber: string
  companyId: number
  roomName: string // Added for display
  companyName: string // Added for display
  customFieldData: Record<string, any> // Custom field data
}

export async function getBookingsForLink(
  linkId: number,
  page = 1,
  pageSize = 5,
  statusFilter: "all" | "pending" | "confirmed" | "cancelled" = "all",
  searchQuery = "",
): Promise<{ bookings: Booking[]; totalCount: number }> {
  try {
    const offset = (page - 1) * pageSize

    // Execute queries with proper parameterization
    const [rowsRes, countRes] = await Promise.all([
      sql`SELECT
        b.id, b.selected_date, b.selected_room_id, b.selected_time_slot_id,
        b.custom_company_name, b.agreed_to_terms, b.status, b.link_id, b.created_at,
        b.updated_at, b.booking_number, b.company_id,
        r.name  AS room_name,
        c.name  AS company_name
      FROM bookings b
      LEFT JOIN rooms     r ON b.selected_room_id = r.id
      LEFT JOIN companies c ON b.company_id      = c.id
      WHERE b.link_id = ${linkId}
      ${statusFilter !== "all" ? sql`AND b.status = ${statusFilter}` : sql``}
      ${searchQuery ? sql`AND (LOWER(b.booking_number) ILIKE ${`%${searchQuery.toLowerCase()}%`} OR LOWER(c.name) ILIKE ${`%${searchQuery.toLowerCase()}%`} OR LOWER(b.custom_company_name) ILIKE ${`%${searchQuery.toLowerCase()}%`})` : sql``}
      ORDER BY b.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}`,
      
      sql`SELECT COUNT(*)::integer AS total
      FROM bookings b
      LEFT JOIN companies c ON b.company_id = c.id
      WHERE b.link_id = ${linkId}
      ${statusFilter !== "all" ? sql`AND b.status = ${statusFilter}` : sql``}
      ${searchQuery ? sql`AND (LOWER(b.booking_number) ILIKE ${`%${searchQuery.toLowerCase()}%`} OR LOWER(c.name) ILIKE ${`%${searchQuery.toLowerCase()}%`} OR LOWER(b.custom_company_name) ILIKE ${`%${searchQuery.toLowerCase()}%`})` : sql``}`
    ])

    const totalCount = Number(countRes[0]?.total ?? 0)

    const bookings: Booking[] = await Promise.all(rowsRes.map(async (row: any) => ({
      id: row.id,
      selectedDate: new Date(row.selected_date),
      selectedRoomId: row.selected_room_id,
      selectedTimeSlotId: row.selected_time_slot_id,
      customCompanyName: row.custom_company_name,
      agreedToTerms: row.agreed_to_terms,
      status: row.status,
      linkId: row.link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      bookingNumber: row.booking_number,
      companyId: row.company_id,
      roomName: row.room_name,
      companyName: row.company_name,
      customFieldData: await getBookingCustomFieldValues(row.id),
    })))

    return { bookings, totalCount }
  } catch (error) {
    console.error(`Error fetching bookings for link ID ${linkId}:`, error)
    return { bookings: [], totalCount: 0 }
  }
}

// Function to increment click count for a booking link
export async function incrementClickCount(uuid: string): Promise<boolean> {
  try {
    await sql`
      UPDATE booking_links 
      SET count_click = COALESCE(count_click, 0) + 1 
      WHERE uuid = ${uuid} AND is_active = true;`
    
    return true
  } catch (error) {
    console.error(`Error incrementing click count for UUID ${uuid}:`, error)
    return false
  }
}

// Function to get booking count for a specific link
export async function getBookingCountByLinkId(linkId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*)::int AS count 
      FROM bookings 
      WHERE link_id = ${linkId};`
    
    return result[0]?.count || 0
  } catch (error) {
    console.error(`Error getting booking count for link ${linkId}:`, error)
    return 0
  }
}

// Function to get booking counts for all links
export async function getBookingCountsForAllLinks(): Promise<Record<number, number>> {
  try {
    const result = await sql`
      SELECT link_id, COUNT(*)::int AS count 
      FROM bookings 
      GROUP BY link_id;`
    
    const counts: Record<number, number> = {}
    result.forEach((row: any) => {
      counts[row.link_id] = row.count
    })
    
    return counts
  } catch (error) {
    console.error("Error getting booking counts for all links:", error)
    return {}
  }
}

// Function to get total bookings count across all links
export async function getTotalBookingsCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*)::int AS total 
      FROM bookings;`
    
    return result[0]?.total || 0
  } catch (error) {
    console.error("Error getting total bookings count:", error)
    return 0
  }
}

// Function to check if a oneTime link has already been used
export async function isOneTimeLinkUsed(linkId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT COUNT(*)::int AS count 
      FROM bookings 
      WHERE link_id = ${linkId};`
    
    return (result[0]?.count || 0) > 0
  } catch (error) {
    console.error(`Error checking if oneTime link ${linkId} is used:`, error)
    return false
  }
}
