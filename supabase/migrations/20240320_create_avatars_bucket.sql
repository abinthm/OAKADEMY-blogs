-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
);

-- Create policy to allow public viewing of avatars
CREATE POLICY "Allow public to view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Create policy to allow users to update their own avatars
CREATE POLICY "Allow users to update own avatars"
ON storage.objects FOR UPDATE
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() = owner
);

-- Create policy to allow users to delete their own avatars
CREATE POLICY "Allow users to delete own avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
); 