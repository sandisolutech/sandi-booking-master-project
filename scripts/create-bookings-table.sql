CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    selected_date DATE NOT NULL,
    selected_room_id INTEGER NOT NULL, -- Changed to INTEGER to reference rooms.id
    selected_time_slot_id INTEGER NOT NULL, -- Changed to INTEGER to reference time_rounds.id
    custom_company_name VARCHAR(255),
    agreed_to_terms BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending'::character varying,
    link_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    booking_number VARCHAR(255) UNIQUE NOT NULL,
    company_id INTEGER NOT NULL, -- Updated to NOT NULL
    FOREIGN KEY (link_id) REFERENCES booking_links(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
