import { sql } from "../lib/db.ts"

async function migrateLogo() {
  try {
    console.log('Starting logo column migration...')
    
    // Modify the column to support larger text data
    await sql`
      ALTER TABLE general_config 
      ALTER COLUMN company_logo_url TYPE TEXT
    `
    
    console.log('Migration completed successfully')
    console.log('company_logo_url column can now store base64 encoded images')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

migrateLogo().catch(console.error)
