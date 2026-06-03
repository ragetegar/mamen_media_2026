-- Concert Attendees table: tracks which users are attending which concerts
CREATE TABLE IF NOT EXISTS public.concert_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, concert_id)
);

-- Enable RLS
ALTER TABLE public.concert_attendees ENABLE ROW LEVEL SECURITY;

-- Everyone can see who's attending (public profiles)
CREATE POLICY "Public read concert_attendees" ON public.concert_attendees FOR SELECT USING (true);

-- Users can add themselves
CREATE POLICY "Users can attend concerts" ON public.concert_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove themselves
CREATE POLICY "Users can unattend concerts" ON public.concert_attendees FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_concert_attendees_user ON concert_attendees(user_id);
CREATE INDEX idx_concert_attendees_concert ON concert_attendees(concert_id);
