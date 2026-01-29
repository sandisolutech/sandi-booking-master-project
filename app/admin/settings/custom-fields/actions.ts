"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'password'
  | 'tel' 
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color'
  | 'range'
  | 'file'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'select'
  | 'multiple_select'
  | 'tag'

export type CustomField = {
  id: number
  title: string
  customKey?: string // Unique identifier key for the field
  fieldType: FieldType
  isRequired: boolean
  placeholder?: string
  options?: string[] // For select/radio/checkbox
  minValue?: string // For number, range, date inputs
  maxValue?: string // For number, range, date inputs
  stepValue?: string // For number, range inputs
  acceptTypes?: string // For file input
  multipleFiles?: boolean // For file input
  maxLength?: number // For text inputs
  pattern?: string // Regex pattern for validation
  orderIndex: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateCustomFieldData = {
  title: string
  customKey?: string
  fieldType: FieldType
  isRequired: boolean
  placeholder?: string
  options?: string[]
  minValue?: string
  maxValue?: string
  stepValue?: string
  acceptTypes?: string
  multipleFiles?: boolean
  maxLength?: number
  pattern?: string
  orderIndex?: number
}

export type UpdateCustomFieldData = {
  id: number
  title?: string
  customKey?: string
  fieldType?: FieldType
  isRequired?: boolean
  placeholder?: string
  options?: string[]
  minValue?: string
  maxValue?: string
  stepValue?: string
  acceptTypes?: string
  multipleFiles?: boolean
  maxLength?: number
  pattern?: string
  orderIndex?: number
  isActive?: boolean
}

// Helper to convert database row to CustomField type
const mapRowToCustomField = (row: any): CustomField => ({
  id: row.id,
  title: row.title,
  customKey: row.custom_key,
  fieldType: row.field_type as FieldType,
  isRequired: row.is_required,
  placeholder: row.placeholder,
  options: row.options ? JSON.parse(row.options) : undefined,
  minValue: row.min_value,
  maxValue: row.max_value,
  stepValue: row.step_value,
  acceptTypes: row.accept_types,
  multipleFiles: row.multiple_files,
  maxLength: row.max_length,
  pattern: row.pattern,
  orderIndex: row.order_index,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export async function getAllCustomFields(): Promise<CustomField[]> {
  try {
    const result = await sql`
      SELECT * FROM custom_fields 
      ORDER BY order_index ASC, created_at ASC
    `

    if (Array.isArray(result)) {
      return result.map(mapRowToCustomField)
    }

    // Support both neon response formats
    const rows = (result as any).rows || []
    return rows.map(mapRowToCustomField)
  } catch (error) {
    console.error("Error fetching custom fields:", error)
    return []
  }
}

// Alias so other modules can import { getCustomFields }
export const getCustomFields = getAllCustomFields

export async function getActiveCustomFields(): Promise<CustomField[]> {
  try {
    const result = await sql`
      SELECT * FROM custom_fields 
      WHERE is_active = true
      ORDER BY order_index ASC, created_at ASC
    `

    if (Array.isArray(result)) {
      return result.map(mapRowToCustomField)
    }

    // Support both neon response formats
    const rows = (result as any).rows || []
    return rows.map(mapRowToCustomField)
  } catch (error) {
    console.error("Error fetching active custom fields:", error)
    return []
  }
}

export async function getCustomFieldById(id: number): Promise<CustomField | null> {
  try {
    const result = await sql`
      SELECT * FROM custom_fields WHERE id = ${id}
    `

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToCustomField(result[0])
    }

    // Support both neon response formats
    const rows = (result as any).rows || []
    if (rows.length > 0) {
      return mapRowToCustomField(rows[0])
    }

    return null
  } catch (error) {
    console.error("Error fetching custom field by id:", error)
    return null
  }
}

export async function createCustomField(data: CreateCustomFieldData) {
  try {
    const { 
      title, customKey, fieldType, isRequired, placeholder, options, 
      minValue, maxValue, stepValue, acceptTypes, multipleFiles, 
      maxLength, pattern, orderIndex 
    } = data

    // Get the next order index if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxOrderResult = await sql`
        SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM custom_fields
      `
      const maxOrderRow = Array.isArray(maxOrderResult) 
        ? maxOrderResult[0] 
        : (maxOrderResult as any).rows?.[0]
      finalOrderIndex = maxOrderRow.next_order
    }

    const optionsJson = options ? JSON.stringify(options) : null

    const result = await sql`
      INSERT INTO custom_fields (
        title, custom_key, field_type, is_required, placeholder, options, 
        min_value, max_value, step_value, accept_types, multiple_files,
        max_length, pattern, order_index
      )
      VALUES (
        ${title}, ${customKey || null}, ${fieldType}, ${isRequired}, ${placeholder || null}, ${optionsJson},
        ${minValue || null}, ${maxValue || null}, ${stepValue || null}, 
        ${acceptTypes || null}, ${multipleFiles || false},
        ${maxLength || null}, ${pattern || null}, ${finalOrderIndex}
      )
      RETURNING *
    `

    const insertedRow = Array.isArray(result) ? result[0] : (result as any).rows?.[0]
    const customField = mapRowToCustomField(insertedRow)

    revalidatePath("/admin/settings/custom-fields")
    
    return {
      success: true,
      data: customField,
    }
  } catch (error) {
    console.error("Error creating custom field:", error)
    return {
      success: false,
      error: "Failed to create custom field. Please try again.",
    }
  }
}

export async function updateCustomField(data: UpdateCustomFieldData) {
  try {
    const { 
      id, title, customKey, fieldType, isRequired, placeholder, options, 
      minValue, maxValue, stepValue, acceptTypes, multipleFiles,
      maxLength, pattern, orderIndex, isActive 
    } = data

    const optionsJson = options ? JSON.stringify(options) : null

    await sql`
      UPDATE custom_fields
      SET
        title = ${title || sql`title`},
        custom_key = ${customKey !== undefined ? (customKey || null) : sql`custom_key`},
        field_type = ${fieldType || sql`field_type`},
        is_required = ${isRequired ?? sql`is_required`},
        placeholder = ${placeholder !== undefined ? (placeholder || null) : sql`placeholder`},
        options = ${options !== undefined ? optionsJson : sql`options`},
        min_value = ${minValue !== undefined ? (minValue || null) : sql`min_value`},
        max_value = ${maxValue !== undefined ? (maxValue || null) : sql`max_value`},
        step_value = ${stepValue !== undefined ? (stepValue || null) : sql`step_value`},
        accept_types = ${acceptTypes !== undefined ? (acceptTypes || null) : sql`accept_types`},
        multiple_files = ${multipleFiles ?? sql`multiple_files`},
        max_length = ${maxLength !== undefined ? (maxLength || null) : sql`max_length`},
        pattern = ${pattern !== undefined ? (pattern || null) : sql`pattern`},
        order_index = ${orderIndex ?? sql`order_index`},
        is_active = ${isActive ?? sql`is_active`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/admin/settings/custom-fields")
    
    return {
      success: true,
      message: "Custom field updated successfully!",
    }
  } catch (error: any) {
    console.error("Error updating custom field:", error)
    return {
      success: false,
      error: error.message || "Failed to update custom field. Please try again.",
    }
  }
}

export async function deleteCustomField(id: number) {
  try {
    await sql`DELETE FROM custom_fields WHERE id = ${id}`

    revalidatePath("/admin/settings/custom-fields")
    
    return {
      success: true,
      message: "Custom field deleted successfully!",
    }
  } catch (error: any) {
    console.error("Error deleting custom field:", error)
    return {
      success: false,
      error: error.message || "Failed to delete custom field. Please try again.",
    }
  }
}

export async function reorderCustomFields(fieldIds: number[]) {
  try {
    // Update order_index for each field
    for (let i = 0; i < fieldIds.length; i++) {
      await sql`
        UPDATE custom_fields 
        SET order_index = ${i + 1}
        WHERE id = ${fieldIds[i]}
      `
    }

    revalidatePath("/admin/settings/custom-fields")
    
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error reordering custom fields:", error)
    return {
      success: false,
      error: "Failed to reorder custom fields. Please try again.",
    }
  }
}
