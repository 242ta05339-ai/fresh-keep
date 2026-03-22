
CREATE TABLE public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pieces',
  expiry_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  added_date DATE NOT NULL DEFAULT CURRENT_DATE,
  added_by TEXT NOT NULL DEFAULT 'You',
  consumed INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on food_items"
  ON public.food_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access on food_items"
  ON public.food_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete access on food_items"
  ON public.food_items FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public update access on food_items"
  ON public.food_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.food_items;
