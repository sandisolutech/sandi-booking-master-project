#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createLineConfigTable() {
  try {
    console.log('🚀 Creating LINE config table...');
    
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS line_config (
        id SERIAL PRIMARY KEY,
        liff_id TEXT NOT NULL DEFAULT '',
        success_message TEXT NOT NULL DEFAULT 'Your booking has been confirmed successfully! Thank you for choosing our service.',
        cancel_message TEXT NOT NULL DEFAULT 'Your booking has been cancelled. If you need assistance, please contact our support team.',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Table created!');
    
    // Insert default configuration
    const result = await sql`
      INSERT INTO line_config (liff_id, success_message, cancel_message) 
      VALUES (
        '',
        'Your booking has been confirmed successfully! Thank you for choosing our service.',
        'Your booking has been cancelled. If you need assistance, please contact our support team.'
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    
    if (result.length > 0) {
      console.log('✅ Default configuration inserted!');
    } else {
      console.log('ℹ️  Default configuration already exists');
    }
    
    console.log('🎉 LINE configuration table setup complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createLineConfigTable();
