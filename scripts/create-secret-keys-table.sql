-- Create secret_keys table
CREATE TABLE IF NOT EXISTS secret_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  key VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_secret_keys_key ON secret_keys(key);
CREATE INDEX IF NOT EXISTS idx_secret_keys_active ON secret_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_secret_keys_expires ON secret_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_secret_keys_created_at ON secret_keys(created_at);
