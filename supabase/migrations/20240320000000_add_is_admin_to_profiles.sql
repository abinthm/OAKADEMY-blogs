-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create policy to allow only admins to update is_admin column
CREATE POLICY "Only admins can update is_admin"
ON profiles
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Make first user an admin (optional, remove if not needed)
UPDATE profiles
SET is_admin = true
WHERE id IN (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1); 