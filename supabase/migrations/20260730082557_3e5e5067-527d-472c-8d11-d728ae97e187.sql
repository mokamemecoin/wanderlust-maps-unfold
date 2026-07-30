ALTER TABLE public.travelers
  ADD COLUMN IF NOT EXISTS is_story boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS is_story boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS travelers_expires_at_idx ON public.travelers (expires_at);
CREATE INDEX IF NOT EXISTS trips_expires_at_idx ON public.trips (expires_at);

DROP POLICY IF EXISTS "Everyone can view all travelers" ON public.travelers;
CREATE POLICY "Everyone can view non-expired travelers"
ON public.travelers
FOR SELECT
USING (
  is_story = false
  OR expires_at IS NULL
  OR expires_at > now()
  OR auth.uid() = user_id
);