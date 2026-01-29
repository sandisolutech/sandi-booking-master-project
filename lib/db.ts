import { neon } from "@neondatabase/serverless"

// Initialize the Neon client using the DATABASE_URL environment variable.
// This client will be used for all database operations.
const sql = neon(process.env.DATABASE_URL!)

export { sql }
