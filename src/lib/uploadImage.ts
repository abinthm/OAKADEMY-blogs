import { supabase } from './supabase';

export const uploadImage = async (file: File, bucket: string): Promise<string> => {
  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Uploading file:', { bucket, filePath, type: file.type });

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error('No upload data returned');
    }

    console.log('Upload successful:', uploadData);

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Failed to get image URL');
    }

    console.log('Got public URL:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}; 