
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_emoji text NOT NULL DEFAULT '👤',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = profiles.id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = profiles.id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = profiles.id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Family groups
CREATE TABLE public.family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Family',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;

-- Family members
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm WHERE fm.user_id = _user_id AND fm.family_id = _family_id
  )
$$;

-- RLS for family_groups
CREATE POLICY "Members can read their family" ON public.family_groups FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), family_groups.id));
CREATE POLICY "Owner can update family" ON public.family_groups FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "Authenticated can create family" ON public.family_groups FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- RLS for family_members
CREATE POLICY "Members can read family members" ON public.family_members FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), family_members.family_id));
CREATE POLICY "Owner or self can insert members" ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.family_groups fg WHERE fg.id = family_members.family_id AND fg.owner_id = auth.uid())
    OR family_members.user_id = auth.uid()
  );
CREATE POLICY "Owner or self can delete members" ON public.family_members FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.family_groups fg WHERE fg.id = family_members.family_id AND fg.owner_id = auth.uid())
    OR family_members.user_id = auth.uid()
  );

-- Profiles: family members can read each other
CREATE POLICY "Family members can read each other" ON public.profiles FOR SELECT TO authenticated
  USING (
    profiles.id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_members fm1
      JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid() AND fm2.user_id = profiles.id
    )
  );

-- Add family_id + user_id to food_items
ALTER TABLE public.food_items ADD COLUMN family_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE;
ALTER TABLE public.food_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update food_items RLS
DROP POLICY IF EXISTS "Allow public read access on food_items" ON public.food_items;
DROP POLICY IF EXISTS "Allow public insert access on food_items" ON public.food_items;
DROP POLICY IF EXISTS "Allow public update access on food_items" ON public.food_items;
DROP POLICY IF EXISTS "Allow public delete access on food_items" ON public.food_items;

CREATE POLICY "Read food items" ON public.food_items FOR SELECT TO authenticated
  USING (food_items.family_id IS NULL OR public.is_family_member(auth.uid(), food_items.family_id));
CREATE POLICY "Insert food items" ON public.food_items FOR INSERT TO authenticated
  WITH CHECK (food_items.family_id IS NULL OR public.is_family_member(auth.uid(), food_items.family_id));
CREATE POLICY "Update food items" ON public.food_items FOR UPDATE TO authenticated
  USING (food_items.family_id IS NULL OR public.is_family_member(auth.uid(), food_items.family_id));
CREATE POLICY "Delete food items" ON public.food_items FOR DELETE TO authenticated
  USING (food_items.family_id IS NULL OR public.is_family_member(auth.uid(), food_items.family_id));

CREATE POLICY "Anon read food items" ON public.food_items FOR SELECT TO anon USING (food_items.family_id IS NULL);
CREATE POLICY "Anon insert food items" ON public.food_items FOR INSERT TO anon WITH CHECK (food_items.family_id IS NULL);
CREATE POLICY "Anon update food items" ON public.food_items FOR UPDATE TO anon USING (food_items.family_id IS NULL);
CREATE POLICY "Anon delete food items" ON public.food_items FOR DELETE TO anon USING (food_items.family_id IS NULL);

-- Join family by invite code
CREATE OR REPLACE FUNCTION public.join_family_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _family_id uuid;
BEGIN
  SELECT fg.id INTO _family_id FROM public.family_groups fg WHERE fg.invite_code = _code;
  IF _family_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (_family_id, auth.uid(), 'member')
  ON CONFLICT (family_id, user_id) DO NOTHING;
  RETURN _family_id;
END;
$$;
