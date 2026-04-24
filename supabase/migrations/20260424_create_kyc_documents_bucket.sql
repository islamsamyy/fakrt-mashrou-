-- Create kyc-documents storage bucket for KYC document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload their own documents
CREATE POLICY IF NOT EXISTS "kyc_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policy: Only admins can view KYC documents
CREATE POLICY IF NOT EXISTS "kyc_select_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND is_admin());

-- RLS Policy: Users can delete their own documents
CREATE POLICY IF NOT EXISTS "kyc_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
