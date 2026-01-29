-- Create separate configuration tables for better organization

-- General Configuration Table
CREATE TABLE IF NOT EXISTS general_config (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) DEFAULT 'BookSpace',
    company_email VARCHAR(255) DEFAULT 'admin@bookspace.com',
    company_phone VARCHAR(50) DEFAULT '+1 (555) 123-4567',
    company_address TEXT DEFAULT '123 Business St, City, State 12345',
    company_description TEXT DEFAULT 'Professional room booking system for influencers and content creators.',
    company_website VARCHAR(255) DEFAULT 'https://www.bookspace.com',
    support_email VARCHAR(255) DEFAULT 'support@bookspace.com',
    booking_terms TEXT DEFAULT 'By booking a room, you agree to arrive on time and follow all facility guidelines. Cancellations must be made at least 24 hours in advance.',
    welcome_message TEXT DEFAULT 'Welcome to our professional booking system! Please select your preferred date, room, and time slot below.',
    company_logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Configuration Table
CREATE TABLE IF NOT EXISTS notification_config (
    id SERIAL PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    booking_alerts BOOLEAN DEFAULT true,
    daily_reports BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Configuration Table
CREATE TABLE IF NOT EXISTS booking_config (
    id SERIAL PRIMARY KEY,
    default_booking_duration INTEGER DEFAULT 60,
    max_advance_booking INTEGER DEFAULT 30,
    min_advance_booking INTEGER DEFAULT 1,
    auto_confirm_bookings BOOLEAN DEFAULT false,
    allow_cancellations BOOLEAN DEFAULT true,
    cancellation_deadline INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Configuration Table
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    time_format VARCHAR(2) DEFAULT '12',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS security_config (
    id SERIAL PRIMARY KEY,
    two_factor_auth BOOLEAN DEFAULT false,
    session_timeout INTEGER DEFAULT 60,
    max_login_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default records (only one row per table since we're using columns for settings)
INSERT INTO general_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO notification_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO booking_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO system_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
INSERT INTO security_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create functions to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_general_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_notification_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_booking_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_system_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_security_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_general_config_updated_at ON general_config;
CREATE TRIGGER trigger_update_general_config_updated_at
    BEFORE UPDATE ON general_config
    FOR EACH ROW
    EXECUTE FUNCTION update_general_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_notification_config_updated_at ON notification_config;
CREATE TRIGGER trigger_update_notification_config_updated_at
    BEFORE UPDATE ON notification_config
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_booking_config_updated_at ON booking_config;
CREATE TRIGGER trigger_update_booking_config_updated_at
    BEFORE UPDATE ON booking_config
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_system_config_updated_at ON system_config;
CREATE TRIGGER trigger_update_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_system_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_security_config_updated_at ON security_config;
CREATE TRIGGER trigger_update_security_config_updated_at
    BEFORE UPDATE ON security_config
    FOR EACH ROW
    EXECUTE FUNCTION update_security_config_updated_at();
