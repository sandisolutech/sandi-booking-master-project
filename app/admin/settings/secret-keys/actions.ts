"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

export type SecretKey = {
  id: number
  name: string
  key: string
  description?: string
  isActive: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type CreateSecretKeyData = {
  name: string
  description?: string
  expiresAt?: Date
}

export type UpdateSecretKeyData = {
  id: number
  name?: string
  description?: string
  isActive?: boolean
  expiresAt?: Date
}

// Helper to convert database row to SecretKey type
const mapRowToSecretKey = (row: any): SecretKey => ({
  id: row.id,
  name: row.name,
  key: row.key,
  description: row.description,
  isActive: row.is_active,
  lastUsed: row.last_used ? new Date(row.last_used) : undefined,
  expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

// Generate a secure random secret key
function generateSecretKey(): string {
  return `sk_${randomBytes(32).toString('hex')}`
}

export async function getAllSecretKeys(): Promise<SecretKey[]> {
  try {
    const result = await sql`
      SELECT * FROM secret_keys 
      ORDER BY created_at DESC
    `

    if (Array.isArray(result)) {
      return result.map(mapRowToSecretKey)
    }

    const rows = (result as any).rows || []
    return rows.map(mapRowToSecretKey)
  } catch (error) {
    console.error("Error fetching secret keys:", error)
    return []
  }
}

export async function getActiveSecretKeys(): Promise<SecretKey[]> {
  try {
    const result = await sql`
      SELECT * FROM secret_keys 
      WHERE is_active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `

    if (Array.isArray(result)) {
      return result.map(mapRowToSecretKey)
    }

    const rows = (result as any).rows || []
    return rows.map(mapRowToSecretKey)
  } catch (error) {
    console.error("Error fetching active secret keys:", error)
    return []
  }
}

export async function getSecretKeyById(id: number): Promise<SecretKey | null> {
  try {
    const result = await sql`
      SELECT * FROM secret_keys WHERE id = ${id}
    `

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToSecretKey(result[0])
    }

    const rows = (result as any).rows || []
    if (rows.length > 0) {
      return mapRowToSecretKey(rows[0])
    }

    return null
  } catch (error) {
    console.error("Error fetching secret key by id:", error)
    return null
  }
}

export async function validateSecretKey(key: string): Promise<SecretKey | null> {
  try {
    const result = await sql`
      SELECT * FROM secret_keys 
      WHERE key = ${key} 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `

    if (Array.isArray(result) && result.length > 0) {
      // Update last used timestamp
      await sql`
        UPDATE secret_keys 
        SET last_used = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].id}
      `
      return mapRowToSecretKey(result[0])
    }

    const rows = (result as any).rows || []
    if (rows.length > 0) {
      // Update last used timestamp
      await sql`
        UPDATE secret_keys 
        SET last_used = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${rows[0].id}
      `
      return mapRowToSecretKey(rows[0])
    }

    return null
  } catch (error) {
    console.error("Error validating secret key:", error)
    return null
  }
}

export async function createSecretKey(data: CreateSecretKeyData) {
  try {
    const { name, description, expiresAt } = data
    const key = generateSecretKey()

    const result = await sql`
      INSERT INTO secret_keys (name, key, description, expires_at)
      VALUES (${name}, ${key}, ${description || null}, ${expiresAt || null})
      RETURNING *
    `

    const insertedRow = Array.isArray(result) ? result[0] : (result as any).rows?.[0]
    const secretKey = mapRowToSecretKey(insertedRow)

    revalidatePath("/admin/settings/secret-keys")
    
    return {
      success: true,
      data: secretKey,
    }
  } catch (error) {
    console.error("Error creating secret key:", error)
    return {
      success: false,
      error: "Failed to create secret key. Please try again.",
    }
  }
}

export async function updateSecretKey(data: UpdateSecretKeyData) {
  try {
    const { id, name, description, isActive, expiresAt } = data

    await sql`
      UPDATE secret_keys
      SET
        name = ${name || sql`name`},
        description = ${description !== undefined ? (description || null) : sql`description`},
        is_active = ${isActive ?? sql`is_active`},
        expires_at = ${expiresAt !== undefined ? (expiresAt || null) : sql`expires_at`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/admin/settings/secret-keys")
    
    return {
      success: true,
      message: "Secret key updated successfully!",
    }
  } catch (error: any) {
    console.error("Error updating secret key:", error)
    return {
      success: false,
      error: error.message || "Failed to update secret key. Please try again.",
    }
  }
}

export async function deleteSecretKey(id: number) {
  try {
    await sql`DELETE FROM secret_keys WHERE id = ${id}`

    revalidatePath("/admin/settings/secret-keys")
    
    return {
      success: true,
      message: "Secret key deleted successfully!",
    }
  } catch (error: any) {
    console.error("Error deleting secret key:", error)
    return {
      success: false,
      error: error.message || "Failed to delete secret key. Please try again.",
    }
  }
}

export async function regenerateSecretKey(id: number) {
  try {
    const newKey = generateSecretKey()

    await sql`
      UPDATE secret_keys
      SET
        key = ${newKey},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    const result = await sql`
      SELECT * FROM secret_keys WHERE id = ${id}
    `

    const updatedRow = Array.isArray(result) ? result[0] : (result as any).rows?.[0]
    const secretKey = mapRowToSecretKey(updatedRow)

    revalidatePath("/admin/settings/secret-keys")
    
    return {
      success: true,
      data: secretKey,
      message: "Secret key regenerated successfully!",
    }
  } catch (error: any) {
    console.error("Error regenerating secret key:", error)
    return {
      success: false,
      error: error.message || "Failed to regenerate secret key. Please try again.",
    }
  }
}
