-- Add status and review fields to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS review_notes text;

-- Create enum type for post status
DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Convert status column to use enum
ALTER TABLE posts 
  ALTER COLUMN status TYPE post_status 
  USING status::post_status;

-- Set default value for status
ALTER TABLE posts 
  ALTER COLUMN status 
  SET DEFAULT 'draft'::post_status;

-- Update existing posts
UPDATE posts 
SET status = CASE 
    WHEN published = true THEN 'approved'::post_status
    ELSE 'draft'::post_status
END;

-- Create policy for admin review
CREATE POLICY "Only admins can review posts"
ON posts
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id 
        FROM profiles 
        WHERE is_admin = true
    )
    AND (
        NEW.status = 'approved'::post_status 
        OR NEW.status = 'rejected'::post_status
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id 
        FROM profiles 
        WHERE is_admin = true
    )
    AND (
        NEW.status = 'approved'::post_status 
        OR NEW.status = 'rejected'::post_status
    )
);

-- Create policy for authors to submit posts for review
CREATE POLICY "Authors can submit posts for review"
ON posts
FOR UPDATE
USING (
    auth.uid() = author_id
    AND OLD.status = 'draft'::post_status
    AND NEW.status = 'pending'::post_status
)
WITH CHECK (
    auth.uid() = author_id
    AND OLD.status = 'draft'::post_status
    AND NEW.status = 'pending'::post_status
); 