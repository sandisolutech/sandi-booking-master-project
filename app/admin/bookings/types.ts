// Booking status constants
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed", 
  CANCELLED: "cancelled",
  REJECTED: "rejected"
} as const

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS]

// Booking status colors
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "#eab308",   // yellow-500
  [BOOKING_STATUS.CONFIRMED]: "#10b981", // green-500
  [BOOKING_STATUS.CANCELLED]: "#6b7280", // gray-500
  [BOOKING_STATUS.REJECTED]: "#ef4444"   // red-500
} as const

// Helper function to get color for booking status
export const getBookingStatusColor = (status: BookingStatus): string => {
  return BOOKING_STATUS_COLORS[status] || "#3b82f6" // blue-500 as fallback
}

// Custom field data model
export interface CustomFieldValue {
  title: string
  value: string | string[] | number | boolean | any
  fieldType: string
  key?: string | null
}

export type CustomFieldData = Record<string, CustomFieldValue>

// This file defines the structure of a Booking object as returned by your API
export interface Booking {
  id: number
  name: string
  email: string
  phone?: string
  selected_date: string
  selected_room_id: string // Changed to string for UUID
  selected_time_slot_id: string // Changed to string for UUID
  custom_company_name: string | null
  agreed_to_terms: boolean
  status: BookingStatus
  link_id: number | null
  created_at: string
  updated_at: string
  booking_number: string
  company_id: number
  custom_field_data?: CustomFieldData // Properly typed custom field data
  // Joined fields from other tables
  room_name: string
  time_slot_start_time: string
  time_slot_end_time: string
  company_name: string
  // Fields added by the API for calendar display
  title: string
  start: string // ISO string from API, converted to Date in frontend
  end: string // ISO string from API, converted to Date in frontend
  color: string
  [key: string]: any // Allow for other properties if needed
}

export interface BookingLink {
  id: number
  uuid: string
  name: string
  description: string | null
  link_type: "reusable" | "one-time"
  approval_mode: "auto" | "manual"
  expiration_type: "unlimited" | "limited"
  expiration_date_start: string | null
  expiration_date_end: string | null
  max_bookings: number | null
  created_at: string
  updated_at: string
  company_id: number
  company_name: string
  total_bookings: number
}

export interface TimeRound {
  id: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
  company_id: number
}
