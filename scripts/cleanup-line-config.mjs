import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanupLineConfig() {
  try {
    console.log('Starting LINE config cleanup...');
    
    // Get the first record to keep
    const keeperResult = await sql`
      SELECT * FROM line_config ORDER BY id LIMIT 1
    `;
    
    if (keeperResult.rows.length === 0) {
      console.log('No records found in line_config table');
      return;
    }
    
    const keeper = keeperResult.rows[0];
    console.log('Keeping record with ID:', keeper.id);
    
    // Delete all records
    await sql`DELETE FROM line_config`;
    console.log('Deleted all records');
    
    // Insert the keeper record back with ID = 1
    await sql`
      INSERT INTO line_config (id, liff_id, success_message, cancel_message, created_at, updated_at)
      VALUES (1, ${keeper.liff_id}, ${keeper.success_message}, ${keeper.cancel_message}, ${keeper.created_at}, ${keeper.updated_at})
    `;
    console.log('Inserted keeper record with ID = 1');
    
    // Reset the sequence
    await sql`SELECT setval('line_config_id_seq', 1, true)`;
    console.log('Reset sequence');
    
    // Verify the result
    const verifyResult = await sql`SELECT COUNT(*) as count FROM line_config`;
    const finalResult = await sql`SELECT * FROM line_config`;
    
    console.log('Total records after cleanup:', verifyResult.rows[0].count);
    console.log('Final record:', finalResult.rows[0]);
    
    console.log('✅ LINE config cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupLineConfig();
