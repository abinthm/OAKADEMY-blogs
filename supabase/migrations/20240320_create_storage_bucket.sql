-- Create the blog-images storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('blog-images', 'blog-images')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'blog-images';

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

-- Policy to allow public viewing of images
CREATE POLICY "Allow public to view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Policy to allow users to delete their own images
CREATE POLICY "Allow users to delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND owner = auth.uid()
); 