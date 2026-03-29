-- Allow superadmins to update any profile (needed for admin edit pages)
CREATE POLICY "profiles: superadmin update"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
