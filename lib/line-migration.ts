// Auto-migration utility for LINE config table
// This will be called automatically when the LINE config is first accessed

import { sql } from "@/lib/db"

let migrationRun = false

export async function ensureLineConfigTable() {
  if (migrationRun) return
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS line_config (
        id SERIAL PRIMARY KEY,
        liff_id TEXT NOT NULL DEFAULT '',
        success_message TEXT NOT NULL DEFAULT 'Your booking has been confirmed successfully! Thank you for choosing our service.',
        cancel_message TEXT NOT NULL DEFAULT 'Your booking has been cancelled. If you need assistance, please contact our support team.',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Insert default configuration if none exists
    await sql`
      INSERT INTO line_config (liff_id, success_message, cancel_message) 
      SELECT '', 
             'Your booking has been confirmed successfully! Thank you for choosing our service.',
             'Your booking has been cancelled. If you need assistance, please contact our support team.'
      WHERE NOT EXISTS (SELECT 1 FROM line_config WHERE id = 1)
    `
    
    migrationRun = true
    console.log('✅ LINE config table ensured')
  } catch (error) {
    console.error('❌ Failed to ensure LINE config table:', error)
  }
}
