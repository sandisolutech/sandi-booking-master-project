import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addConstraint() {
  try {
    console.log('Adding constraint to line_config table...');
    
    // Add check constraint to ensure only id = 1 is allowed
    await sql`
      ALTER TABLE line_config 
      ADD CONSTRAINT line_config_single_record_constraint 
      CHECK (id = 1)
    `;
    
    console.log('✅ Constraint added successfully!');
    console.log('Now only one record with id = 1 can exist in line_config table');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Constraint already exists, skipping...');
    } else {
      console.error('❌ Error adding constraint:', error);
    }
  }
}

addConstraint();
