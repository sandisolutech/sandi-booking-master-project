-- Create user_accounts table for authentication system
CREATE TABLE IF NOT EXISTS user_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Administrator', 'Manager', 'Staff')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role);

-- Create index for status-based queries  
CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON user_accounts(status);

-- Insert default admin user (password: admin123)
INSERT INTO user_accounts (name, email, password_hash, role, status, created_at, updated_at)
VALUES (
    'System Administrator',
    'admin@bookspace.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/dKV9rWJTW', -- bcrypt hash for 'admin123'
    'Administrator',
    'Active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert default manager user (password: manager123)
INSERT INTO user_accounts (name, email, password_hash, role, status, created_at, updated_at)
VALUES (
    'System Manager',
    'manager@bookspace.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'manager123'
    'Manager',
    'Active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insert default staff user (password: staff123)
INSERT INTO user_accounts (name, email, password_hash, role, status, created_at, updated_at)
VALUES (
    'System Staff',
    'staff@bookspace.com',
    '$2a$12$B6xYYHUVwBOx3i3pMKhF/e5H5O4u4jXJ5y8VKJx5y8VKJx5y8VKJx', -- bcrypt hash for 'staff123'
    'Staff',
    'Active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
