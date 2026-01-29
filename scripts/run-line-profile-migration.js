require('dotenv').config()
const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('Please create a .env.local file with your DATABASE_URL')
    process.exit(1)
  }
  
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log('Running LINE profile columns migration...')
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add-line-profile-columns.sql'), 
      'utf8'
    )
    
    // Split by semicolon and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      await sql(statement)
    }
    
    console.log('✅ LINE profile columns migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
