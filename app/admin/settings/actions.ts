"use server"

import { sql } from "@/lib/db"

// Type definitions for each config table
export type GeneralConfig = {
  id: number
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  companyDescription: string
  companyWebsite: string
  supportEmail: string
  bookingTerms: string
  welcomeMessage: string
  companyLogoUrl: string | null
  companyCoverImageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type NotificationConfig = {
  id: number
  emailNotifications: boolean
  bookingAlerts: boolean
  dailyReports: boolean
  weeklyReports: boolean
  systemAlerts: boolean
  createdAt: Date
  updatedAt: Date
}

export type BookingConfig = {
  id: number
  defaultBookingDuration: number
  maxAdvanceBooking: number
  minAdvanceBooking: number
  autoConfirmBookings: boolean
  allowCancellations: boolean
  cancellationDeadline: number
  createdAt: Date
  updatedAt: Date
}

export type SystemConfig = {
  id: number
  timezone: string
  dateFormat: string
  timeFormat: string
  language: string
  createdAt: Date
  updatedAt: Date
}

export type SecurityConfig = {
  id: number
  twoFactorAuth: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  createdAt: Date
  updatedAt: Date
}

export type LineConfig = {
  id: number
  liffId: string
  successMessage: string
  cancelMessage: string
  createdAt: Date
  updatedAt: Date
}

// Get General Configuration
export async function getGeneralConfig(): Promise<GeneralConfig> {
  try {
    const result = await sql`
      SELECT 
        id,
        company_name as "companyName",
        company_email as "companyEmail", 
        company_phone as "companyPhone",
        company_address as "companyAddress",
        company_description as "companyDescription",
        company_website as "companyWebsite",
        support_email as "supportEmail",
        booking_terms as "bookingTerms",
        welcome_message as "welcomeMessage",
        company_logo_url as "companyLogoUrl",
        company_cover_image_url as "companyCoverImageUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM general_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      throw new Error('General configuration not found')
    }
    
    return result[0] as GeneralConfig
  } catch (error) {
    console.error('Error fetching general config:', error)
    throw new Error('Failed to fetch general configuration')
  }
}

// Update General Configuration
export async function updateGeneralConfig(config: Partial<GeneralConfig>): Promise<GeneralConfig> {
  try {
    const result = await sql`
      UPDATE general_config 
      SET 
        company_name = ${config.companyName || sql`company_name`},
        company_email = ${config.companyEmail || sql`company_email`},
        company_phone = ${config.companyPhone || sql`company_phone`},
        company_address = ${config.companyAddress || sql`company_address`},
        company_description = ${config.companyDescription || sql`company_description`},
        company_website = ${config.companyWebsite || sql`company_website`},
        support_email = ${config.supportEmail || sql`support_email`},
        booking_terms = ${config.bookingTerms || sql`booking_terms`},
        welcome_message = ${config.welcomeMessage || sql`welcome_message`},
        company_logo_url = ${config.companyLogoUrl !== undefined ? config.companyLogoUrl : sql`company_logo_url`},
        company_cover_image_url = ${config.companyCoverImageUrl !== undefined ? config.companyCoverImageUrl : sql`company_cover_image_url`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        company_name as "companyName",
        company_email as "companyEmail", 
        company_phone as "companyPhone",
        company_address as "companyAddress",
        company_description as "companyDescription",
        company_website as "companyWebsite",
        support_email as "supportEmail",
        booking_terms as "bookingTerms",
        welcome_message as "welcomeMessage",
        company_logo_url as "companyLogoUrl",
        company_cover_image_url as "companyCoverImageUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as GeneralConfig
  } catch (error) {
    console.error('Error updating general config:', error)
    throw new Error('Failed to update general configuration')
  }
}

// Get Notification Configuration
export async function getNotificationConfig(): Promise<NotificationConfig> {
  try {
    const result = await sql`
      SELECT 
        id,
        email_notifications as "emailNotifications",
        booking_alerts as "bookingAlerts",
        daily_reports as "dailyReports",
        weekly_reports as "weeklyReports",
        system_alerts as "systemAlerts",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM notification_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      throw new Error('Notification configuration not found')
    }
    
    return result[0] as NotificationConfig
  } catch (error) {
    console.error('Error fetching notification config:', error)
    throw new Error('Failed to fetch notification configuration')
  }
}

// Update Notification Configuration
export async function updateNotificationConfig(config: Partial<NotificationConfig>): Promise<NotificationConfig> {
  try {
    const result = await sql`
      UPDATE notification_config 
      SET 
        email_notifications = ${config.emailNotifications !== undefined ? config.emailNotifications : sql`email_notifications`},
        booking_alerts = ${config.bookingAlerts !== undefined ? config.bookingAlerts : sql`booking_alerts`},
        daily_reports = ${config.dailyReports !== undefined ? config.dailyReports : sql`daily_reports`},
        weekly_reports = ${config.weeklyReports !== undefined ? config.weeklyReports : sql`weekly_reports`},
        system_alerts = ${config.systemAlerts !== undefined ? config.systemAlerts : sql`system_alerts`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        email_notifications as "emailNotifications",
        booking_alerts as "bookingAlerts",
        daily_reports as "dailyReports",
        weekly_reports as "weeklyReports",
        system_alerts as "systemAlerts",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as NotificationConfig
  } catch (error) {
    console.error('Error updating notification config:', error)
    throw new Error('Failed to update notification configuration')
  }
}

// Get Booking Configuration
export async function getBookingConfig(): Promise<BookingConfig> {
  try {
    const result = await sql`
      SELECT 
        id,
        default_booking_duration as "defaultBookingDuration",
        max_advance_booking as "maxAdvanceBooking",
        min_advance_booking as "minAdvanceBooking",
        auto_confirm_bookings as "autoConfirmBookings",
        allow_cancellations as "allowCancellations",
        cancellation_deadline as "cancellationDeadline",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM booking_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      throw new Error('Booking configuration not found')
    }
    
    return result[0] as BookingConfig
  } catch (error) {
    console.error('Error fetching booking config:', error)
    throw new Error('Failed to fetch booking configuration')
  }
}

// Update Booking Configuration
export async function updateBookingConfig(config: Partial<BookingConfig>): Promise<BookingConfig> {
  try {
    const result = await sql`
      UPDATE booking_config 
      SET 
        default_booking_duration = ${config.defaultBookingDuration !== undefined ? config.defaultBookingDuration : sql`default_booking_duration`},
        max_advance_booking = ${config.maxAdvanceBooking !== undefined ? config.maxAdvanceBooking : sql`max_advance_booking`},
        min_advance_booking = ${config.minAdvanceBooking !== undefined ? config.minAdvanceBooking : sql`min_advance_booking`},
        auto_confirm_bookings = ${config.autoConfirmBookings !== undefined ? config.autoConfirmBookings : sql`auto_confirm_bookings`},
        allow_cancellations = ${config.allowCancellations !== undefined ? config.allowCancellations : sql`allow_cancellations`},
        cancellation_deadline = ${config.cancellationDeadline !== undefined ? config.cancellationDeadline : sql`cancellation_deadline`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        default_booking_duration as "defaultBookingDuration",
        max_advance_booking as "maxAdvanceBooking",
        min_advance_booking as "minAdvanceBooking",
        auto_confirm_bookings as "autoConfirmBookings",
        allow_cancellations as "allowCancellations",
        cancellation_deadline as "cancellationDeadline",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as BookingConfig
  } catch (error) {
    console.error('Error updating booking config:', error)
    throw new Error('Failed to update booking configuration')
  }
}

// Get System Configuration
export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const result = await sql`
      SELECT 
        id,
        timezone,
        date_format as "dateFormat",
        time_format as "timeFormat",
        language,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM system_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      throw new Error('System configuration not found')
    }
    
    return result[0] as SystemConfig
  } catch (error) {
    console.error('Error fetching system config:', error)
    throw new Error('Failed to fetch system configuration')
  }
}

// Update System Configuration
export async function updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  try {
    const result = await sql`
      UPDATE system_config 
      SET 
        timezone = ${config.timezone || sql`timezone`},
        date_format = ${config.dateFormat || sql`date_format`},
        time_format = ${config.timeFormat || sql`time_format`},
        language = ${config.language || sql`language`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        timezone,
        date_format as "dateFormat",
        time_format as "timeFormat",
        language,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as SystemConfig
  } catch (error) {
    console.error('Error updating system config:', error)
    throw new Error('Failed to update system configuration')
  }
}

// Get Security Configuration
export async function getSecurityConfig(): Promise<SecurityConfig> {
  try {
    const result = await sql`
      SELECT 
        id,
        two_factor_auth as "twoFactorAuth",
        session_timeout as "sessionTimeout",
        max_login_attempts as "maxLoginAttempts",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM security_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      throw new Error('Security configuration not found')
    }
    
    return result[0] as SecurityConfig
  } catch (error) {
    console.error('Error fetching security config:', error)
    throw new Error('Failed to fetch security configuration')
  }
}

// Update Security Configuration
export async function updateSecurityConfig(config: Partial<SecurityConfig>): Promise<SecurityConfig> {
  try {
    const result = await sql`
      UPDATE security_config 
      SET 
        two_factor_auth = ${config.twoFactorAuth !== undefined ? config.twoFactorAuth : sql`two_factor_auth`},
        session_timeout = ${config.sessionTimeout !== undefined ? config.sessionTimeout : sql`session_timeout`},
        max_login_attempts = ${config.maxLoginAttempts !== undefined ? config.maxLoginAttempts : sql`max_login_attempts`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        two_factor_auth as "twoFactorAuth",
        session_timeout as "sessionTimeout",
        max_login_attempts as "maxLoginAttempts",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as SecurityConfig
  } catch (error) {
    console.error('Error updating security config:', error)
    throw new Error('Failed to update security configuration')
  }
}

// Get just the company name for components like sidebar
export async function getCompanyName(): Promise<string> {
  try {
    const result = await sql`
      SELECT company_name
      FROM general_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      return 'BookSpace' // fallback to default if no config found
    }
    
    return result[0].company_name || 'BookSpace'
  } catch (error) {
    console.error('Error fetching company name:', error)
    return 'BookSpace' // fallback to default on error
  }
}

// Get just the company logo for components
export async function getCompanyLogo(): Promise<string | null> {
  try {
    const result = await sql`
      SELECT company_logo_url
      FROM general_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      return null // no logo found
    }
    
    return result[0].company_logo_url || null
  } catch (error) {
    console.error('Error fetching company logo:', error)
    return null // fallback to no logo on error
  }
}

// Get basic company info for branding
export async function getCompanyBranding(): Promise<{
  name: string
  logo: string | null
  description: string | null
}> {
  try {
    const result = await sql`
      SELECT company_name, company_logo_url, company_description
      FROM general_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      return {
        name: 'BookSpace',
        logo: null,
        description: null
      }
    }
    
    return {
      name: result[0].company_name || 'BookSpace',
      logo: result[0].company_logo_url || null,
      description: result[0].company_description || null
    }
  } catch (error) {
    console.error('Error fetching company branding:', error)
    return {
      name: 'BookSpace',
      logo: null,
      description: null
    }
  }
}

// Get LINE Configuration
export async function getLineConfig(): Promise<LineConfig> {
  try {
    // Ensure table exists before querying
    await sql`
      CREATE TABLE IF NOT EXISTS line_config (
        id SERIAL PRIMARY KEY,
        liff_id TEXT NOT NULL DEFAULT '',
        success_message TEXT NOT NULL DEFAULT '🎉 Booking Confirmed!

Booking #: {{booking_number}}
Company: {{company_name}}
Date: {{date}}
Time: {{time_slot}}
Room: {{room_name}}

View details: {{booking_link}}

Thank you for your booking!',
        cancel_message TEXT NOT NULL DEFAULT '❌ Booking Cancelled

Your booking {{booking_number}} has been cancelled.

If you need assistance, please contact our support team at {{support_email}}.',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT line_config_single_record_constraint CHECK (id = 1)
      )
    `
    
    const result = await sql`
      SELECT 
        id,
        liff_id as "liffId",
        success_message as "successMessage",
        cancel_message as "cancelMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM line_config 
      WHERE id = 1
    `
    
    if (result.length === 0) {
      // Create default configuration if none exists (using INSERT ... ON CONFLICT to prevent duplicates)
      const defaultResult = await sql`
        INSERT INTO line_config (id, liff_id, success_message, cancel_message)
        VALUES (
          1,
          '',
          '🎉 Booking Confirmed!

Booking #: {{booking_number}}
Company: {{company_name}}
Date: {{date}}
Time: {{time_slot}}
Room: {{room_name}}

View details: {{booking_link}}

Thank you for your booking!',
          '❌ Booking Cancelled

Your booking {{booking_number}} has been cancelled.

If you need assistance, please contact our support team at {{support_email}}.'
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING 
          id,
          liff_id as "liffId",
          success_message as "successMessage", 
          cancel_message as "cancelMessage",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `
      
      // If ON CONFLICT happened, fetch the existing record
      if (defaultResult.length === 0) {
        const existingResult = await sql`
          SELECT 
            id,
            liff_id as "liffId",
            success_message as "successMessage",
            cancel_message as "cancelMessage",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM line_config 
          WHERE id = 1
        `
        return existingResult[0] as LineConfig
      }
      
      return defaultResult[0] as LineConfig
    }
    
    return result[0] as LineConfig
  } catch (error) {
    console.error('Error fetching LINE config:', error)
    throw new Error('Failed to fetch LINE configuration')
  }
}

// Update LINE Configuration
export async function updateLineConfig(config: Partial<LineConfig>): Promise<LineConfig> {
  try {
    const result = await sql`
      UPDATE line_config 
      SET 
        liff_id = ${config.liffId !== undefined ? config.liffId : sql`liff_id`},
        success_message = ${config.successMessage !== undefined ? config.successMessage : sql`success_message`},
        cancel_message = ${config.cancelMessage !== undefined ? config.cancelMessage : sql`cancel_message`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING 
        id,
        liff_id as "liffId",
        success_message as "successMessage",
        cancel_message as "cancelMessage", 
        created_at as "createdAt",
        updated_at as "updatedAt"
    `
    
    return result[0] as LineConfig
  } catch (error) {
    console.error('Error updating LINE config:', error)
    throw new Error('Failed to update LINE configuration')
  }
}
