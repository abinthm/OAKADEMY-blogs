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
      console.error(
        'The "blog-images" bucket does not exist. Please create it manually in the Supabase dashboard:\n' +
        '1. Go to Storage in your Supabase dashboard\n' +
        '2. Click "New Bucket"\n' +
        '3. Name it "blog-images"\n' +
        '4. Uncheck "Public bucket"\n' +
        '5. Click "Create bucket"\n' +
        '6. Set up the required policies in the Storage > Policies section'
      );
      return;
    }

    console.log('Successfully verified blog-images bucket exists');
  } catch (error) {
    console.error('Error checking storage bucket:', error);
  }
} 