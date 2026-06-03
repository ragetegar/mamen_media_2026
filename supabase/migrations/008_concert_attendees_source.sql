-- ═══════════════════════════════════════════════
-- CONCERT ATTENDEES — Add source tracking
-- (002_concert_attendees.sql already created the base table)
-- ═══════════════════════════════════════════════

-- Add source column to existing concert_attendees table
ALTER TABLE public.concert_attendees ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Update RLS: authenticated users can read (not public for auth wall)
DROP POLICY IF EXISTS "Public read concert_attendees" ON public.concert_attendees;
CREATE POLICY "Authenticated read concert_attendees" ON public.concert_attendees
  FOR SELECT USING (auth.uid() IS NOT NULL);
