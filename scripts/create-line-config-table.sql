-- Create LINE configuration table
CREATE TABLE IF NOT EXISTS line_config (
  id SERIAL PRIMARY KEY,
  liff_id TEXT NOT NULL DEFAULT '',
  success_message TEXT NOT NULL DEFAULT 'Your booking has been confirmed successfully! Thank you for choosing our service.',
  cancel_message TEXT NOT NULL DEFAULT 'Your booking has been cancelled. If you need assistance, please contact our support team.',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO line_config (liff_id, success_message, cancel_message) 
VALUES (
  '',
  'Your booking has been confirmed successfully! Thank you for choosing our service.',
  'Your booking has been cancelled. If you need assistance, please contact our support team.'
) 
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_line_config_id ON line_config(id);
