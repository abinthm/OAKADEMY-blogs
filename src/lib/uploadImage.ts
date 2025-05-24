import { supabase } from './supabaseClient';

export async function uploadImage(file: File, bucket: string = 'blog-images') {
  try {
    // Generate a unique filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Check file size (max 50MB for free tier)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Allow overwriting existing files
        contentType: file.type
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get the public URL directly
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
} 