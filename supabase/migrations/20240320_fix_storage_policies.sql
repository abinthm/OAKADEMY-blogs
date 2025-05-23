-- Create a function to manage storage policies with elevated privileges
CREATE OR REPLACE FUNCTION public.create_storage_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Enable RLS for storage.objects if not already enabled
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Give public access to all files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

    -- Create policy to allow public read access to all files
    CREATE POLICY "Give public access to all files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-images');

    -- Create policy to allow authenticated users to upload files
    CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'blog-images'
        AND auth.role() = 'authenticated'
    );

    -- Create policy to allow users to delete their own files
    CREATE POLICY "Allow users to delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'blog-images'
        AND auth.uid() = owner
    );

    -- Update bucket settings
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'blog-images';
END;
$$;

-- Execute the function
SELECT public.create_storage_policies(); 