"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type DayOffRecurrenceType = 'once' | 'weekly' | 'monthly' | 'yearly'

export type RoomDayOff = {
  id: number
  roomId: number
  dayOffDate: Date | null
  dayOfWeek: number | null // 0-6 (Sunday-Saturday)
  recurrenceType: DayOffRecurrenceType
  reason: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type RoomTimeSlotAvailability = {
  id: number
  roomId: number
  timeRoundId: number
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export type Room = {
  id: number
  name: string
  description: string | null
  capacity: number | null
  equipment: string[] 
  status: string
  dayOffs?: RoomDayOff[]
  createdAt: Date
  updatedAt: Date
}

// Helper to convert database row to Room type
const mapRowToRoom = (row: any): Room => ({
  id: row.id,
  name: row.name,
  description: row.description,
  capacity: row.capacity,
  equipment: row.equipment ?? [], // default []
  status: row.status ?? "inactive", // fallback if null
  dayOffs: [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

// Helper to convert database row to RoomDayOff type
const mapRowToDayOff = (row: any): RoomDayOff => {
  return {
    id: row.id,
    roomId: row.room_id,
    dayOffDate: row.day_off_date ? new Date(row.day_off_date) : null,
    dayOfWeek: row.day_of_week,
    recurrenceType: row.recurrence_type as DayOffRecurrenceType,
    reason: row.reason,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Helper to convert database row to RoomTimeSlotAvailability type
const mapRowToTimeSlotAvailability = (row: any): RoomTimeSlotAvailability => ({
  id: row.id,
  roomId: row.room_id,
  timeRoundId: row.time_round_id,
  dayOfWeek: row.day_of_week,
  isAvailable: row.is_available,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export async function getAllRooms(): Promise<Room[]> {
  try {
    const result = await sql`SELECT * FROM rooms ORDER BY created_at DESC;`

    if (Array.isArray(result)) {
      return result.map(mapRowToRoom)
    }

    console.error("Unexpected response format from database:", result)
    return []
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return []
  }
}

export async function getRoomById(id: number): Promise<Room | null> {
  try {
    const result = await sql`SELECT * FROM rooms WHERE id = ${id};`

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToRoom(result[0])
    }

    return null
  } catch (error) {
    console.error(`Error fetching room with ID ${id}:`, error)
    return null
  }
}

export async function createRoom(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const capacity = formData.get("capacity") ? Number.parseInt(formData.get("capacity") as string) : null
  const status = formData.get("status") as string || "active"

  try {
    await sql`
    INSERT INTO rooms (name, description, capacity, status)
    VALUES (${name}, ${description}, ${capacity}, ${status});
  `
    revalidatePath("/admin/rooms")
    return { success: true, message: "Room created successfully!" }
  } catch (error: any) {
    console.error("Error creating room:", error)
    return { success: false, message: error.message || "Failed to create room." }
  }
}

export async function updateRoom(id: number, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const capacity = formData.get("capacity") ? Number.parseInt(formData.get("capacity") as string) : null
  const status = formData.get("status") as string || "active"

  try {
    await sql`
    UPDATE rooms
    SET
      name = ${name},
      description = ${description},
      capacity = ${capacity},
      status = ${status},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id};
  `
    revalidatePath(`/admin/rooms/${id}`)
    revalidatePath("/admin/rooms")
    return { success: true, message: "Room updated successfully!" }
  } catch (error: any) {
    console.error(`Error updating room with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to update room." }
  }
}

export async function deleteRoom(id: number) {
  try {
    await sql`DELETE FROM rooms WHERE id = ${id};`
    revalidatePath("/admin/rooms")
    return { success: true, message: "Room deleted successfully!" }
  } catch (error: any) {
    console.error(`Error deleting room with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to delete room." }
  }
}

// ============ Day Off Functions ============

export async function getRoomDayOffs(roomId: number): Promise<RoomDayOff[]> {
  try {
    const result = await sql`
      SELECT * FROM room_day_offs 
      WHERE room_id = ${roomId} AND is_active = true
      ORDER BY day_off_date ASC, day_of_week ASC
    `
    return Array.isArray(result) ? result.map(mapRowToDayOff) : []
  } catch (error) {
    console.error("Error fetching room day offs:", error)
    return []
  }
}

export async function addRoomDayOff(
  roomId: number,
  dayOff: {
    dayOffDate?: string
    dayOfWeek?: number
    recurrenceType: DayOffRecurrenceType
    reason?: string
  }
): Promise<RoomDayOff | null> {
  try {
    const result = await sql`
      INSERT INTO room_day_offs (room_id, day_off_date, day_of_week, recurrence_type, reason)
      VALUES (${roomId}, ${dayOff.dayOffDate || null}, ${dayOff.dayOfWeek !== undefined ? dayOff.dayOfWeek : null}, ${dayOff.recurrenceType}, ${dayOff.reason || null})
      RETURNING *
    `
    revalidatePath(`/admin/rooms/${roomId}`)
    return Array.isArray(result) && result.length > 0 ? mapRowToDayOff(result[0]) : null
  } catch (error) {
    console.error("Error adding room day off:", error)
    throw error
  }
}

export async function removeRoomDayOff(dayOffId: number): Promise<boolean> {
  try {
    await sql`DELETE FROM room_day_offs WHERE id = ${dayOffId}`
    return true
  } catch (error) {
    console.error("Error removing room day off:", error)
    throw error
  }
}

export async function updateRoomDayOff(
  dayOffId: number,
  data: Partial<RoomDayOff>
): Promise<RoomDayOff | null> {
  try {
    const result = await sql`
      UPDATE room_day_offs
      SET 
        day_off_date = COALESCE(${data.dayOffDate || null}, day_off_date),
        day_of_week = COALESCE(${data.dayOfWeek !== undefined ? data.dayOfWeek : null}, day_of_week),
        recurrence_type = COALESCE(${data.recurrenceType || null}, recurrence_type),
        reason = COALESCE(${data.reason || null}, reason),
        is_active = COALESCE(${data.isActive !== undefined ? data.isActive : null}, is_active)
      WHERE id = ${dayOffId}
      RETURNING *
    `
    return Array.isArray(result) && result.length > 0 ? mapRowToDayOff(result[0]) : null
  } catch (error) {
    console.error("Error updating room day off:", error)
    throw error
  }
}

// ============ Room Time Slot Availability Functions ============

export async function getRoomTimeSlotAvailability(
  roomId: number
): Promise<RoomTimeSlotAvailability[]> {
  try {
    const result = await sql`
      SELECT * FROM room_time_slot_availability 
      WHERE room_id = ${roomId}
      ORDER BY day_of_week ASC, time_round_id ASC
    `
    return Array.isArray(result) ? result.map(mapRowToTimeSlotAvailability) : []
  } catch (error) {
    console.error("Error fetching room time slot availability:", error)
    return []
  }
}

export async function setRoomTimeSlotAvailability(
  roomId: number,
  timeRoundId: number,
  dayOfWeek: number,
  isAvailable: boolean
): Promise<RoomTimeSlotAvailability | null> {
  try {
    // Try to insert, if unique constraint fails, update
    const result = await sql`
      INSERT INTO room_time_slot_availability (room_id, time_round_id, day_of_week, is_available)
      VALUES (${roomId}, ${timeRoundId}, ${dayOfWeek}, ${isAvailable})
      ON CONFLICT (room_id, time_round_id, day_of_week) 
      DO UPDATE SET is_available = ${isAvailable}, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    revalidatePath(`/admin/rooms/${roomId}`)
    return Array.isArray(result) && result.length > 0 ? mapRowToTimeSlotAvailability(result[0]) : null
  } catch (error) {
    console.error("Error setting room time slot availability:", error)
    throw error
  }
}

export async function updateRoomTimeSlotAvailabilityBatch(
  roomId: number,
  availabilityData: Array<{
    timeRoundId: number
    dayOfWeek: number
    isAvailable: boolean
  }>
): Promise<boolean> {
  try {
    // Delete existing entries for this room
    await sql`DELETE FROM room_time_slot_availability WHERE room_id = ${roomId}`

    // Insert new entries
    for (const item of availabilityData) {
      await sql`
        INSERT INTO room_time_slot_availability (room_id, time_round_id, day_of_week, is_available)
        VALUES (${roomId}, ${item.timeRoundId}, ${item.dayOfWeek}, ${item.isAvailable})
      `
    }

    revalidatePath(`/admin/rooms/${roomId}`)
    return true
  } catch (error) {
    console.error("Error updating room time slot availability batch:", error)
    throw error
  }
}

// Alias export for compatibility with existing imports
export { getAllRooms as getRooms }
