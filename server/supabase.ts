import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param file - The file buffer or data
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: Buffer | Uint8Array,
  contentType: string
): Promise<{ url: string; key: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    key: data.path,
  };
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 */
export async function deleteFromSupabase(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path
 * @returns The public URL
 */
export function getSupabasePublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
