#!/usr/bin/env node

// Migration script to add 'tag' field type support
const { neon } = require("@neondatabase/serverless");

async function runMigration() {
    try {
        // Load environment variables if needed
        require('dotenv').config();
        
        const sql = neon(process.env.DATABASE_URL);
        
        console.log("Running migration to add 'tag' field type...");
        
        // First, drop the existing constraint
        await sql`
            ALTER TABLE custom_fields 
            DROP CONSTRAINT IF EXISTS custom_fields_field_type_check
        `;
        
        console.log("Dropped existing constraint");
        
        // Add the new constraint with 'tag' included
        await sql`
            ALTER TABLE custom_fields 
            ADD CONSTRAINT custom_fields_field_type_check 
            CHECK (field_type IN (
                'text', 'number', 'email', 'password', 'tel', 'url', 'search',
                'date', 'time', 'datetime-local', 'month', 'week',
                'color', 'range', 'file', 'checkbox', 'radio',
                'textarea', 'select', 'multiple_select', 'tag'
            ))
        `;
        
        console.log("Successfully added 'tag' field type to allowed values");
        console.log("Migration completed successfully!");
        
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
