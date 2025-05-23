import { supabase } from './supabase';

export async function initializeStorage() {
  try {
    // Check if the blog-images bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const blogImagesBucket = buckets?.find(bucket => bucket.name === 'blog-images');

    if (!blogImagesBucket) {
      // Create the blog-images bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('blog-images', {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      console.log('Successfully created blog-images bucket');
    } else {
      // Update bucket to be public if it exists
      const { error: updateError } = await supabase
        .storage
        .updateBucket('blog-images', {
          public: true
        });

      if (updateError) {
        console.error('Error updating bucket:', updateError);
        return;
      }
    }

    console.log('Successfully configured blog-images bucket');
  } catch (error) {
    console.error('Error configuring storage bucket:', error);
  }
} 