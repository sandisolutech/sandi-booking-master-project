#!/usr/bin/env node

const { sql } = require('@/lib/db')
const fs = require('fs')
const path = require('path')

async function runRoomsStatusMigration() {
  console.log('🚀 Starting rooms status migration...')
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'migrate-rooms-status.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📝 Executing migration SQL...')
    
    // Execute the migration
    await sql.unsafe(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Summary of changes:')
    console.log('  - Migrated data from is_active (boolean) to status (varchar)')
    console.log('  - Dropped is_active column from rooms table')
    console.log('  - Added status column constraint (active, inactive, maintenance, archived)')
    console.log('  - Added index on status column for better performance')
    console.log('  - Set default status to "active"')
    
    // Verify the migration
    console.log('🔍 Verifying migration...')
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rooms' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
    
    console.log('📋 Current rooms table schema:')
    result.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'} ${column.column_default ? `DEFAULT ${column.column_default}` : ''}`)
    })
    
    // Check data
    const roomCount = await sql`SELECT COUNT(*) as count FROM rooms;`
    const activeRoomCount = await sql`SELECT COUNT(*) as count FROM rooms WHERE status = 'active';`
    const inactiveRoomCount = await sql`SELECT COUNT(*) as count FROM rooms WHERE status = 'inactive';`
    
    console.log(`📈 Room statistics:`)
    console.log(`  - Total rooms: ${roomCount[0].count}`)
    console.log(`  - Active rooms: ${activeRoomCount[0].count}`)
    console.log(`  - Inactive rooms: ${inactiveRoomCount[0].count}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runRoomsStatusMigration()
    .then(() => {
      console.log('🎉 Migration runner completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration runner failed:', error)
      process.exit(1)
    })
}

module.exports = { runRoomsStatusMigration }
