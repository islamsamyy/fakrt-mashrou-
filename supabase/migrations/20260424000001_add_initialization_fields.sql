-- Add initialization tracking fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS initialized boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS initialized_at timestamptz;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_initialized ON profiles(initialized);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
