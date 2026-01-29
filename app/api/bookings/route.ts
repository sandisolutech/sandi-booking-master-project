import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateSecretKey } from "@/app/admin/settings/secret-keys/actions"
import { getBookingCustomFieldValuesAsArray } from "@/lib/custom-field-value-utils"

// This route uses request.url which requires dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Simple authentication check
    const secretKey = request.headers.get("x-secret-key") || 
                     request.headers.get("authorization")?.replace("Bearer ", "") ||
                     new URL(request.url).searchParams.get("secret_key")
    
    if (!secretKey) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized. Valid secret key required." 
        },
        { status: 401 }
      )
    }

    // Validate secret key
    const validKey = await validateSecretKey(secretKey)
    if (!validKey) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid secret key." 
        },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const customKey = searchParams.get("customKey")
    const value = searchParams.get("value")
    const companyId = searchParams.get("companyId")
    const roomId = searchParams.get("roomId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const offset = (page - 1) * pageSize

    // Base query
    let query = `
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

    const conditions: string[] = []

    // Add filters
    if (customKey && value) {
      conditions.push(`EXISTS (
        SELECT 1 FROM booking_custom_field_values bcfv
        WHERE bcfv.booking_id = b.id
          AND bcfv.key = '${customKey.replace(/'/g, "''")}'
          AND (bcfv.value = '${value.replace(/'/g, "''")}' OR bcfv.value ILIKE '%${value.replace(/'/g, "''")}%')
      )`)
    }
    if (companyId && companyId !== "all") {
      conditions.push(`b.company_id = ${Number(companyId)}`)
    }
    if (roomId && roomId !== "all") {
      conditions.push(`b.selected_room_id = '${roomId.replace(/'/g, "''")}'`)
    }
    if (status && status !== "all") {
      conditions.push(`b.status = '${status.replace(/'/g, "''")}'`)
    }
    if (search) {
      const searchTerm = search.toLowerCase().replace(/'/g, "''")
      conditions.push(`(LOWER(b.booking_number) LIKE '%${searchTerm}%' OR LOWER(c.name) LIKE '%${searchTerm}%' OR LOWER(b.custom_company_name) LIKE '%${searchTerm}%')`)
    }
    if (startDate) {
      conditions.push(`b.selected_date >= '${startDate}'`)
    }
    if (endDate) {
      conditions.push(`b.selected_date <= '${endDate}'`)
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY b.selected_date DESC, tr.start_time ASC LIMIT ${pageSize} OFFSET ${offset}`

    // Execute query
    const result = await sql.unsafe(query)
    const bookings = Array.isArray(result) ? result : (result as any).rows || []

    // Fetch custom field values for all bookings and reconstruct enriched format
    const processedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        const customFieldArray = await getBookingCustomFieldValuesAsArray(booking.id)
        
        // Convert array format to object format (keyed by key or id)
        const customFieldData: Record<string, any> = {}
        customFieldArray.forEach((field: any) => {
          const identifier = field.key || `field_${field.id}`
          customFieldData[identifier] = {
            title: field.title,
            value: field.value,
            fieldType: field.fieldType,
            key: field.key
          }
        })
        
        return {
          ...booking,
          custom_field_data: customFieldData
        }
      })
    )

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      LEFT JOIN rooms r ON b.selected_room_id = r.id
      LEFT JOIN time_rounds tr ON b.selected_time_slot_id = tr.id
      LEFT JOIN companies c ON b.company_id = c.id
      WHERE 1=1
    `
    
    if (conditions.length > 0) {
      countQuery += ` AND ${conditions.join(' AND ')}`
    }

    const countResult = await sql.unsafe(countQuery)
    const totalCount = Array.isArray(countResult) ? (countResult[0]?.total ?? 0) : ((countResult as any).rows?.[0]?.total ?? 0)

    return NextResponse.json({ 
      success: true,
      bookings: processedBookings,
      totalCount: Number(totalCount),
      page,
      pageSize,
      total: Number(totalCount)
    })
  } catch (err: any) {
    console.error("❌ Error fetching bookings:", err)
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to fetch bookings", 
        error: err?.message ?? "Unknown error" 
      },
      { status: 500 }
    )
  }
}
