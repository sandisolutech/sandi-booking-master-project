CREATE TABLE IF NOT EXISTS public.rooms
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    equipment TEXT[],
    status VARCHAR(50) DEFAULT 'active'::character varying NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rooms_status_check CHECK (status IN ('active', 'inactive', 'maintenance', 'archived'))
);

-- Create index on status column for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
