#!/usr/bin/env node

const { sql } = require('@vercel/postgres')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  try {
    console.log('Running user accounts migration...')
    
    const migrationPath = path.join(__dirname, 'create-user-accounts-table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    await sql.query(migrationSQL)
    
    console.log('✅ User accounts migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
