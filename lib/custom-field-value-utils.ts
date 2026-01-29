"use server"

import { sql } from "@/lib/db"
import type { CustomFieldValue } from "@/app/admin/bookings/types"

/**
 * Save custom field values for a booking
 * Inserts or updates values in the booking_custom_field_values table
 */
export async function saveBookingCustomFieldValues(
  bookingId: number,
  customFieldData: Record<string, any>,
  activeCustomFields: any[]
) {
  try {
    console.log("Saving custom field data for booking:", bookingId, customFieldData)
    console.log("Active custom fields:", activeCustomFields)
    
    for (const [fieldId, value] of Object.entries(customFieldData)) {
      if (value === null || value === undefined || value === '') {
        continue // Skip empty values
      }

      const field = activeCustomFields.find(f => f.id === parseInt(fieldId))
      if (!field) {
        console.warn(`Field with ID ${fieldId} not found in active custom fields`)
        continue
      }

      // Handle different value types - store arrays/objects as JSON text
      let storedValue: string
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        storedValue = JSON.stringify(value)
      } else {
        storedValue = String(value)
      }

      // Get field type - try both camelCase (fieldType) and snake_case (field_type)
      // since the data could come from different sources
      const valueType = field.fieldType || field.field_type || 'text'
      const customKey = field.customKey || field.custom_key || null

      console.log(`Saving field ${fieldId}: title=${field.title}, valueType=${valueType}, key=${customKey}`)

      await sql`
        INSERT INTO booking_custom_field_values (
          booking_id, title, value, value_type, key
        ) VALUES (
          ${bookingId},
          ${field.title},
          ${storedValue},
          ${valueType},
          ${customKey}
        )
        ON CONFLICT (booking_id, key) DO UPDATE SET
          value = EXCLUDED.value,
          title = EXCLUDED.title,
          value_type = EXCLUDED.value_type,
          updated_at = CURRENT_TIMESTAMP
      `
    }
  } catch (error) {
    console.error('Error saving booking custom field values:', error)
    throw error
  }
}

/**
 * Get custom field values for a booking and return in enriched format
 * Returns data in the same format as the old JSON column for API compatibility
 */
export async function getBookingCustomFieldValues(bookingId: number): Promise<CustomFieldValue[]> {
  try {
    const rows = await sql`
      SELECT 
        id, title, value, value_type as "fieldType", key, created_at, updated_at
      FROM booking_custom_field_values
      WHERE booking_id = ${bookingId}
      ORDER BY created_at ASC
    `

    return rows.map((row: any) => {
      let parsedValue: any = row.value

      // Parse JSON for complex types
      if (['multiple_select', 'tag', 'checkbox'].includes(row.fieldType)) {
        try {
          parsedValue = JSON.parse(row.value)
        } catch {
          // Keep as string if not valid JSON
        }
      }

      return {
        id: row.id,
        title: row.title,
        value: parsedValue,
        fieldType: row.fieldType,
        key: row.key,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as CustomFieldValue
    })
  } catch (error) {
    console.error('Error getting booking custom field values:', error)
    throw error
  }
}

/**
 * Delete all custom field values for a booking
 */
export async function deleteBookingCustomFieldValues(bookingId: number) {
  try {
    await sql`
      DELETE FROM booking_custom_field_values
      WHERE booking_id = ${bookingId}
    `
  } catch (error) {
    console.error('Error deleting booking custom field values:', error)
    throw error
  }
}

/**
 * Search bookings by custom field value
 * Returns array of booking IDs that match the search criteria
 */
export async function findBookingsByCustomFieldValue(
  key: string,
  value: string
): Promise<number[]> {
  try {
    const rows = await sql`
      SELECT DISTINCT booking_id
      FROM booking_custom_field_values
      WHERE key = ${key}
        AND (value = ${value} OR value ILIKE ${'%' + value + '%'})
    `
    return rows.map((row: any) => row.booking_id)
  } catch (error) {
    console.error('Error searching booking custom fields:', error)
    return []
  }
}

/**
 * Get custom field values as array format for API responses
 * Used by bookings-api route to construct API responses
 */
export async function getBookingCustomFieldValuesAsArray(bookingId: number) {
  try {
    const rows = await sql`
      SELECT 
        id, title, value, value_type as "fieldType", key
      FROM booking_custom_field_values
      WHERE booking_id = ${bookingId}
      ORDER BY created_at ASC
    `

    return rows.map((row: any) => {
      let parsedValue = row.value
      
      // Parse JSON for complex types
      if (['multiple_select', 'tag', 'checkbox'].includes(row.fieldType)) {
        try {
          parsedValue = JSON.parse(row.value)
        } catch {
          // Keep as string
        }
      }

      return {
        id: row.id,
        title: row.title,
        value: parsedValue,
        fieldType: row.fieldType,
        key: row.key
      }
    })
  } catch (error) {
    console.error('Error getting booking custom field values as array:', error)
    return []
  }
}
