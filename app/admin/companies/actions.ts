"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Company = {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  description: string | null
  website: string | null
  supportEmail: string | null
  bookingTerms: string | null
  welcomeMessage: string | null
  logo: string | null
  primaryColor: string
  secondaryColor: string
  status: string
  createdAt: Date
  updatedAt: Date
}

// Helper to convert database row to Company type
const mapRowToCompany = (row: any): Company => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  description: row.description,
  website: row.website,
  supportEmail: row.support_email,
  bookingTerms: row.booking_terms,
  welcomeMessage: row.welcome_message,
  logo: row.logo,
  primaryColor: row.primary_color,
  secondaryColor: row.secondary_color,
  status: row.status,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export async function getAllCompanies(): Promise<Company[]> {
  try {
    const result = await sql`SELECT * FROM companies ORDER BY created_at DESC;`

    if (Array.isArray(result)) {
      return result.map(mapRowToCompany)
    }

    console.error("Unexpected response format from database:", result)
    return []
  } catch (error) {
    console.error("Error fetching companies:", error)
    return []
  }
}

// Alias to satisfy legacy imports
export const getCompanies = getAllCompanies

export async function getCompanyById(id: number): Promise<Company | null> {
  try {
    const result = await sql`SELECT * FROM companies WHERE id = ${id};`

    if (Array.isArray(result) && result.length > 0) {
      return mapRowToCompany(result[0])
    }

    return null
  } catch (error) {
    console.error(`Error fetching company with ID ${id}:`, error)
    return null
  }
}

interface CreateCompanyData {
  name: string
  email: string  // Required field in your database
  phone?: string | null
  address?: string | null
  description?: string | null
  website?: string | null
  supportEmail?: string | null
  bookingTerms?: string | null
  welcomeMessage?: string | null
  logo?: string | null
  primaryColor?: string
  secondaryColor?: string
  status?: string
}

export async function createCompany(data: CreateCompanyData) {
  const { 
    name, 
    email, 
    phone, 
    address, 
    description, 
    website, 
    supportEmail,
    bookingTerms,
    welcomeMessage,
    logo,
    primaryColor = '#007bff',
    secondaryColor = '#6c757d',
    status = 'active'
  } = data
  
  // Validate required fields
  if (!name || name.trim() === '') {
    return { success: false, message: "Company name is required." }
  }
  
  if (!email || email.trim() === '') {
    return { success: false, message: "Company email is required." }
  }

  try {
    await sql`
      INSERT INTO companies (
        name, email, phone, address, description, website, support_email, 
        booking_terms, welcome_message, logo, primary_color, secondary_color, status
      ) VALUES (
        ${name}, ${email}, ${phone}, ${address}, ${description}, ${website}, 
        ${supportEmail}, ${bookingTerms}, ${welcomeMessage}, ${logo}, 
        ${primaryColor}, ${secondaryColor}, ${status}
      );
    `
    revalidatePath("/admin/companies")
    return { success: true, message: "Company created successfully!" }
  } catch (error: any) {
    console.error("Error creating company:", error)
    return { success: false, message: error.message || "Failed to create company." }
  }
}

export async function updateCompany(id: number, formData: FormData) {
  const name = formData.get("name")
  const email = formData.get("email")
  const phone = formData.get("phone")
  const address = formData.get("address")
  const description = formData.get("description")
  const website = formData.get("website")
  const supportEmail = formData.get("supportEmail")
  const bookingTerms = formData.get("bookingTerms")
  const welcomeMessage = formData.get("welcomeMessage")
  const logo = formData.get("logo")
  const primaryColor = formData.get("primaryColor") || '#007bff'
  const secondaryColor = formData.get("secondaryColor") || '#6c757d'
  const status = formData.get("status") || 'active'

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { success: false, message: "Company name is required." }
  }
  
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { success: false, message: "Company email is required." }
  }

  try {
    await sql`
      UPDATE companies
      SET
        name = ${name},
        email = ${email},
        phone = ${phone},
        address = ${address},
        description = ${description},
        website = ${website},
        support_email = ${supportEmail},
        booking_terms = ${bookingTerms},
        welcome_message = ${welcomeMessage},
        logo = ${logo},
        primary_color = ${primaryColor},
        secondary_color = ${secondaryColor},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `
    revalidatePath(`/admin/companies/${id}`)
    revalidatePath("/admin/companies")
    return { success: true, message: "Company updated successfully!" }
  } catch (error: any) {
    console.error(`Error updating company with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to update company." }
  }
}

export async function deleteCompany(id: number) {
  try {
    await sql`DELETE FROM companies WHERE id = ${id};`
    revalidatePath("/admin/companies")
    return { success: true, message: "Company deleted successfully!" }
  } catch (error: any) {
    console.error(`Error deleting company with ID ${id}:`, error)
    return { success: false, message: error.message || "Failed to delete company." }
  }
}
