#!/usr/bin/env node

import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set')
      process.exit(1)
    }

    const sql = neon(process.env.DATABASE_URL)
    const migrationPath = path.join(process.cwd(), 'scripts', 'create-secret-keys-table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Running secret keys table migration...')
    
    // Split the SQL into individual statements and run them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        await sql`${sql.unsafe(statement)}`
      }
    }
    
    console.log('✅ Secret keys table migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
