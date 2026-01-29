const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

async function runMigration() {
  try {
    // Initialize the database connection
    const sql = neon(process.env.DATABASE_URL)
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create-config-table.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          await sql([statement])
          console.log(`✓ Statement ${i + 1} executed successfully`)
        } catch (error) {
          console.error(`✗ Error executing statement ${i + 1}:`, error.message)
          console.error('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
