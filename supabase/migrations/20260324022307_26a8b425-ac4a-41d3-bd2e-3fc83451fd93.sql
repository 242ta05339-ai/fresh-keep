
-- Remove anon policies (no unauthenticated access)
DROP POLICY IF EXISTS "Anon read food items" ON public.food_items;
DROP POLICY IF EXISTS "Anon insert food items" ON public.food_items;
DROP POLICY IF EXISTS "Anon update food items" ON public.food_items;
DROP POLICY IF EXISTS "Anon delete food items" ON public.food_items;

-- Tighten authenticated policies to require user ownership or family membership
DROP POLICY IF EXISTS "Read food items" ON public.food_items;
CREATE POLICY "Read food items" ON public.food_items FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (family_id IS NOT NULL AND public.is_family_member(auth.uid(), family_id)));

DROP POLICY IF EXISTS "Insert food items" ON public.food_items;
CREATE POLICY "Insert food items" ON public.food_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update food items" ON public.food_items;
CREATE POLICY "Update food items" ON public.food_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR (family_id IS NOT NULL AND public.is_family_member(auth.uid(), family_id)));

DROP POLICY IF EXISTS "Delete food items" ON public.food_items;
CREATE POLICY "Delete food items" ON public.food_items FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR (family_id IS NOT NULL AND public.is_family_member(auth.uid(), family_id)));
