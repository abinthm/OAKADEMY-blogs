-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'Community Contributor';

-- Update existing profiles to have the default role
UPDATE profiles SET role = 'Community Contributor' WHERE role IS NULL; 