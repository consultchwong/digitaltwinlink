-- Create storage bucket for character images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-images', 'character-images', true);

-- Allow authenticated users to upload their own character images
CREATE POLICY "Users can upload character images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'character-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to character images
CREATE POLICY "Public can view character images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'character-images');

-- Allow users to update their own character images
CREATE POLICY "Users can update their character images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'character-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own character images
CREATE POLICY "Users can delete their character images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'character-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);