"use server"

import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

export interface UserAccount {
  id: number
  name: string
  email: string
  role: "Administrator" | "Manager" | "Staff"
  status: "Active" | "Inactive"
  passwordHash: string
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: "Administrator" | "Manager" | "Staff"
}

export interface UpdateUserData {
  id: number
  name?: string
  email?: string
  role?: "Administrator" | "Manager" | "Staff"
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// Get all user accounts
export async function getUserAccounts(): Promise<UserAccount[]> {
  try {
    const { rows } = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        status, 
        password_hash as "passwordHash",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_accounts 
      ORDER BY created_at DESC
    `
    return rows as UserAccount[]
  } catch (error) {
    console.error("Failed to fetch user accounts:", error)
    return []
  }
}

// Create a new user account
export async function createUserAccount(userData: CreateUserData): Promise<UserAccount | null> {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 12)
    
    const { rows } = await sql`
      INSERT INTO user_accounts (name, email, role, password_hash, status, created_at, updated_at)
      VALUES (${userData.name}, ${userData.email}, ${userData.role}, ${passwordHash}, 'Active', NOW(), NOW())
      RETURNING 
        id, 
        name, 
        email, 
        role, 
        status, 
        password_hash as "passwordHash",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return rows[0] as UserAccount
  } catch (error) {
    console.error("Failed to create user account:", error)
    return null
  }
}

// Update a user account
export async function updateUserAccount(userData: UpdateUserData): Promise<UserAccount | null> {
  try {
    const { rows } = await sql`
      UPDATE user_accounts 
      SET 
        name = COALESCE(${userData.name}, name),
        email = COALESCE(${userData.email}, email),
        role = COALESCE(${userData.role}, role),
        updated_at = NOW()
      WHERE id = ${userData.id}
      RETURNING 
        id, 
        name, 
        email, 
        role, 
        status, 
        password_hash as "passwordHash",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return rows[0] as UserAccount
  } catch (error) {
    console.error("Failed to update user account:", error)
    return null
  }
}

// Delete a user account
export async function deleteUserAccount(userId: number): Promise<boolean> {
  try {
    await sql`DELETE FROM user_accounts WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Failed to delete user account:", error)
    return false
  }
}

// Toggle user account status
export async function toggleUserAccountStatus(userId: number): Promise<UserAccount | null> {
  try {
    const { rows } = await sql`
      UPDATE user_accounts 
      SET 
        status = CASE WHEN status = 'Active' THEN 'Inactive' ELSE 'Active' END,
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING 
        id, 
        name, 
        email, 
        role, 
        status, 
        password_hash as "passwordHash",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return rows[0] as UserAccount
  } catch (error) {
    console.error("Failed to toggle user account status:", error)
    return null
  }
}

// Change password
export async function changePassword(userId: number, passwordData: ChangePasswordData): Promise<boolean> {
  try {
    // First, verify the current password
    const { rows: userRows } = await sql`
      SELECT password_hash FROM user_accounts WHERE id = ${userId}
    `
    
    if (userRows.length === 0) {
      return false
    }
    
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword, 
      userRows[0].password_hash
    )
    
    if (!isCurrentPasswordValid) {
      return false
    }
    
    // Hash the new password
    const newPasswordHash = await bcrypt.hash(passwordData.newPassword, 12)
    
    // Update the password
    await sql`
      UPDATE user_accounts 
      SET 
        password_hash = ${newPasswordHash},
        updated_at = NOW()
      WHERE id = ${userId}
    `
    
    return true
  } catch (error) {
    console.error("Failed to change password:", error)
    return false
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<UserAccount | null> {
  try {
    const { rows } = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        status, 
        password_hash as "passwordHash",
        last_login as "lastLogin",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_accounts 
      WHERE email = ${email} AND status = 'Active'
    `
    
    if (rows.length === 0) {
      return null
    }
    
    const user = rows[0] as UserAccount
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      return null
    }
    
    // Update last login
    await sql`
      UPDATE user_accounts 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `
    
    return user
  } catch (error) {
    console.error("Failed to authenticate user:", error)
    return null
  }
}
