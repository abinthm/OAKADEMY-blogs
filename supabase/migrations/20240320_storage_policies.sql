-- Create a function to set up storage policies
CREATE OR REPLACE FUNCTION create_storage_policies(bucket_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Policy to allow authenticated users to upload images
  EXECUTE format(
    'CREATE POLICY "Allow authenticated users to upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = %L AND auth.role() = ''authenticated'')',
    bucket_id
  );

  -- Policy to allow public viewing of images
  EXECUTE format(
    'CREATE POLICY "Allow public to view images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = %L)',
    bucket_id
  );

  -- Policy to allow users to delete their own images
  EXECUTE format(
    'CREATE POLICY "Allow users to delete own images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = %L AND owner = auth.uid())',
    bucket_id
  );
END;
$$; 