-- 0008_storage.sql
-- Storage buckets and security policies for public read and authenticated image uploads

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('restaurant-images', 'restaurant-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('deal-images', 'deal-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public Read Policies for all buckets
CREATE POLICY "Public read restaurant images bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "Public read deal images bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deal-images');

CREATE POLICY "Public read avatars bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 3. Write Policies for restaurant-images and deal-images (Owners and Admins)
CREATE POLICY "Owners and Admins upload restaurant images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-images'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurant_owners ro
        WHERE ro.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners and Admins upload deal images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deal-images'
    AND auth.role() = 'authenticated'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.restaurant_owners ro
        WHERE ro.user_id = auth.uid()
      )
    )
  );

-- 4. User Avatar Upload Policy (Strictly restricted to avatars/<uid>/*)
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
