-- Create blog-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public viewing of blog images
CREATE POLICY "Allow public viewing of blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Create policy to allow authenticated users to upload blog images
CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Create policy to allow users to delete their own blog images
CREATE POLICY "Allow users to delete own blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND owner = auth.uid()); 