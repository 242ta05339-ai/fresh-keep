CREATE POLICY "Owner can read own family"
ON public.family_groups
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());