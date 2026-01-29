"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type TimeRound = {
  id: number
  name: string
  startTime: string
  endTime: string
  isActive: boolean
  bookingLimit: number
  createdAt: Date
  updatedAt: Date
}

// Helper to convert database row to TimeRound type
const mapRowToTimeRound = (row: any): TimeRound => ({
  id: row.id,
  name: row.name,
  startTime: row.start_time,
  endTime: row.end_time,
  isActive: row.is_active ?? false, // fallback if null
  bookingLimit: row.booking_limit ?? 1, // fallback to 1 if null
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export async function getAllTimeRounds(): Promise<TimeRound[]> {
  try {
    const result = await sql`SELECT * FROM time_rounds ORDER BY start_time ASC;`

    if (Array.isArray(result)) {
      return result.map(mapRowToTimeRound)
    }

    if (result && Array.isArray(result.rows)) {
      return result.rows.map(mapRowToTimeRound)
    }

    console.error("Unexpected response format from database:", result)
    return []
  } catch (error) {
    console.error("Error fetching time rounds:", error)
    return []
  }
}

// Alias so other modules can import { getTimeRounds }
export const getTimeRounds = getAllTimeRounds

export async function getTimeRoundById(id: number): Promise<TimeRound | null> {
  try {
    const result = await sql`SELECT * FROM time_rounds WHERE id = ${id};`

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToTimeRound(result[0])
    }

    if (result && Array.isArray(result.rows) && result.rows.length > 0) {
      return mapRowToTimeRound(result.rows[0])
    }

    return null
  } catch (error) {
    console.error(`Error fetching time round with ID ${id}:`, error)
    return null
  }
}

export async function createTimeRound(
  payload:
    | FormData
    | {
        name: string
        startTime: string
        endTime: string
        isActive?: boolean
        bookingLimit?: number
      },
) {
  // Extract values regardless of the incoming payload type
  let name: string, startTime: string, endTime: string, isActive: boolean, bookingLimit: number

  if (payload instanceof FormData) {
    name = payload.get("name") as string
    startTime = payload.get("startTime") as string
    endTime = payload.get("endTime") as string
    isActive = payload.get("isActive") === "on"
    bookingLimit = parseInt(payload.get("bookingLimit") as string) || 1
  } else {
    ;({ name, startTime, endTime, isActive = true, bookingLimit = 1 } = payload)
  }

  try {
    const result = await sql`
      INSERT INTO time_rounds (name, start_time, end_time, is_active, booking_limit)
      VALUES (${name}, ${startTime}, ${endTime}, ${isActive}, ${bookingLimit})
      RETURNING *;
    `

    // Support both neon response formats
    const inserted = Array.isArray(result) ? result[0] : (result.rows?.[0] ?? null)

    revalidatePath("/admin/settings/time-rounds")

    return {
      success: true,
      message: "Time round created successfully!",
      data: inserted ? mapRowToTimeRound(inserted) : null,
    }
  } catch (error: any) {
    console.error("Error creating time round:", error)
    return {
      success: false,
      message: error.message || "Failed to create time round.",
    }
  }
}

export async function updateTimeRound(id: number, formData: FormData) {
  const name = formData.get("name") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const isActive = formData.get("isActive") === "on"
  const bookingLimit = parseInt(formData.get("bookingLimit") as string) || 1

  try {
    await sql`
      UPDATE time_rounds
      SET
        name = ${name},
        start_time = ${startTime},
        end_time = ${endTime},
        is_active = ${isActive},
        booking_limit = ${bookingLimit},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `
    revalidatePath(`/admin/settings/time-rounds/${id}`)
    revalidatePath("/admin/settings/time-rounds")
    return { success: true, message: "Time round updated successfully!" }
  } catch (error: any) {
    console.error(`Error updating time round with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to update time round." }
  }
}

export async function deleteTimeRound(id: number) {
  try {
    await sql`DELETE FROM time_rounds WHERE id = ${id};`
    revalidatePath("/admin/settings/time-rounds")
    return { success: true, message: "Time round deleted successfully!" }
  } catch (error: any) {
    console.error(`Error deleting time round with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to delete time round." }
  }
}
