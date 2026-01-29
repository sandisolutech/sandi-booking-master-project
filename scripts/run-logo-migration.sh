#!/bin/bash

# Simple script to run the logo column migration
# This will modify the company_logo_url column to support TEXT for base64 storage

echo "Running logo column migration..."

# You can either:
# 1. Run this SQL directly in your database console:
echo "Execute this SQL in your database:"
echo "ALTER TABLE general_config ALTER COLUMN company_logo_url TYPE TEXT;"

# 2. Or if you have psql access, uncomment and modify the line below:
# psql $DATABASE_URL -c "ALTER TABLE general_config ALTER COLUMN company_logo_url TYPE TEXT;"

echo "Migration SQL ready to execute."
