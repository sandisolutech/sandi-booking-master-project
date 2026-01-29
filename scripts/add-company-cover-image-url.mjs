import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function addCoverImageColumn() {
  try {
    console.log('Starting migration: Adding company_cover_image_url column...')
    
    // Initialize the database connection
    const sql = neon(process.env.DATABASE_URL)
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-company-cover-image-url.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await sql([statement])
          console.log(`✓ Statement ${i + 1} executed successfully`)
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`✓ Column already exists, skipping...`)
          } else {
            console.error(`✗ Error executing statement ${i + 1}:`, error.message)
            console.error('Statement:', statement.substring(0, 100) + '...')
          }
        }
      }
    }
    
    console.log('✓ Migration completed successfully!')
    console.log('✓ Cover image column added to general_config table')
    console.log('✓ Features:')
    console.log('  - Max file size: 512KB')
    console.log('  - Supported formats: PNG, JPG, GIF, SVG')
    console.log('  - Displayed on booking page as a banner above the form')
    
  } catch (error) {
    console.error('✗ Migration failed:', error.message)
    process.exit(1)
  }
}

addCoverImageColumn()
