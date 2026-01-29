-- Create booking_links table
-- This table stores booking links that can be shared with users to make reservations

CREATE TABLE IF NOT EXISTS booking_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    link_type VARCHAR(50) DEFAULT 'booking',
    approval_mode VARCHAR(50) DEFAULT 'auto',
    expiration_type VARCHAR(50) DEFAULT 'none',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_id INTEGER,
    count_click INTEGER DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Create index on uuid for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_links_uuid ON booking_links(uuid);

-- Create index on is_active for filtering active links
CREATE INDEX IF NOT EXISTS idx_booking_links_active ON booking_links(is_active);

-- Create index on company_id for company-specific queries
CREATE INDEX IF NOT EXISTS idx_booking_links_company_id ON booking_links(company_id);
