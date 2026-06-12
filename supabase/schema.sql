v-- ═══════════════════════════════════════════════
-- MAMEN.ID — Supabase Database Schema
-- Pop Culture Platform (Music, Gaming, Anime, Fashion, Sports, JKT48)
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Articles ──
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('public-voice', 'music', 'lifestyle', 'sports', 'hobbies')),
  subcategory TEXT NOT NULL,
  cover_image TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  author TEXT NOT NULL DEFAULT 'Mamen Editorial',
  author_id TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  linked_concert_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles ADD CONSTRAINT articles_taxonomy_check CHECK (
  (category = 'public-voice' AND subcategory = 'opinion')
  OR (category = 'music' AND subcategory IN ('review', 'news', 'merch'))
  OR (category = 'lifestyle' AND subcategory IN ('fashion', 'sneaker', 'health'))
  OR (category = 'sports' AND subcategory IN ('football', 'basketball', 'esports'))
  OR (category = 'hobbies' AND subcategory IN ('gaming', 'anime', 'jkt48'))
);

-- ── Article Products (Affiliate Blocks) ──
CREATE TABLE article_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL,
  merchant TEXT NOT NULL CHECK (merchant IN ('shopee', 'tokopedia', 'tiktok')),
  title TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  price_display TEXT DEFAULT '',
  affiliate_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Concerts ──
CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  concert_type TEXT NOT NULL CHECK (concert_type IN ('festival', 'local', 'international', 'kpop')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  poster_image TEXT NOT NULL DEFAULT '',
  ticket_url TEXT DEFAULT '',
  genre_tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  interested_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Featured Brands ──
CREATE TABLE featured_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  normalized_name TEXT UNIQUE NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL,
  tag TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.normalize_brand_name(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  SELECT lower(regexp_replace(btrim(value), '\s+', ' ', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.set_featured_brand_normalized_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.name := regexp_replace(btrim(NEW.name), '\s+', ' ', 'g');
  NEW.normalized_name := public.normalize_brand_name(NEW.name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_featured_brand_normalized_name
  BEFORE INSERT OR UPDATE OF name ON public.featured_brands
  FOR EACH ROW EXECUTE FUNCTION public.set_featured_brand_normalized_name();

ALTER TABLE article_products
  ADD CONSTRAINT article_products_brand_id_fkey
  FOREIGN KEY (brand_id) REFERENCES featured_brands(id) ON DELETE RESTRICT;



-- ── Affiliate Click Tracking ──
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_product_id UUID REFERENCES article_products(id) ON DELETE SET NULL,
  merchant TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT
);

-- ── Newsletter Subscribers ──
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_concerts_slug ON concerts(slug);
CREATE INDEX idx_concerts_start_datetime ON concerts(start_datetime);
CREATE INDEX idx_concerts_city ON concerts(city);
CREATE INDEX idx_concerts_type ON concerts(concert_type);
CREATE INDEX idx_affiliate_clicks_product ON affiliate_clicks(article_product_id);
CREATE INDEX idx_article_products_brand ON article_products(brand_id);

-- ── Row Level Security ──
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public read products" ON article_products FOR SELECT USING (true);
CREATE POLICY "Public read concerts" ON concerts FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON featured_brands FOR SELECT USING (is_active = true);

-- Allow anonymous inserts
CREATE POLICY "Anonymous insert clicks" ON affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous subscribe newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Service role has full access (for admin CMS)
CREATE POLICY "Service role full articles" ON articles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full products" ON article_products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full concerts" ON concerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full brands" ON featured_brands FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full clicks" ON affiliate_clicks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full newsletter" ON newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');

-- Create a table for public profiles (matches auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  handle TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'contributor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function and Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ═══════════════════════════════════════════════
-- BARENGAN FEATURE — Social Concert Buddy Finder
-- Run this as a SEPARATE migration in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- ── Barengan Posts ──
CREATE TABLE barengan_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ticket_holder', 'interested_will_come', 'interested_unsure')),
  message TEXT NOT NULL DEFAULT '',
  looking_for INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Barengan Responses ──
CREATE TABLE barengan_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barengan_post_id, user_id)
);

-- ── Indexes ──
CREATE INDEX idx_barengan_posts_concert ON barengan_posts(concert_id);
CREATE INDEX idx_barengan_posts_user ON barengan_posts(user_id);
CREATE INDEX idx_barengan_posts_status ON barengan_posts(status);
CREATE INDEX idx_barengan_posts_active ON barengan_posts(is_active, created_at DESC);
CREATE INDEX idx_barengan_responses_post ON barengan_responses(barengan_post_id);

-- ── RLS ──
ALTER TABLE barengan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barengan_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read barengan" ON barengan_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users create barengan" ON barengan_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own barengan update" ON barengan_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own barengan delete" ON barengan_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read responses" ON barengan_responses FOR SELECT USING (true);
CREATE POLICY "Auth users respond" ON barengan_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own response delete" ON barengan_responses FOR DELETE USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full barengan" ON barengan_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full responses" ON barengan_responses FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════
-- FOLLOWS — Social follow system
-- ═══════════════════════════════════════════════

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT follows_no_self CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Auth users follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Auth users unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Service role full follows" ON public.follows FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.are_mutual_follows(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = user1 AND following_id = user2
  ) AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = user2 AND following_id = user1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════
-- DIRECT MESSAGES
-- ═══════════════════════════════════════════════

CREATE TABLE public.dm_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT dm_no_self CHECK (participant_1 != participant_2),
  CONSTRAINT dm_ordered CHECK (participant_1 < participant_2),
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════
-- BARENGAN MEMBERS + GROUP CHAT
-- ═══════════════════════════════════════════════

CREATE TABLE public.barengan_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barengan_post_id, user_id)
);

CREATE TABLE public.barengan_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_barengan_group_member(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM barengan_posts WHERE id = p_post_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM barengan_members WHERE barengan_post_id = p_post_id AND user_id = p_user_id AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_barengan_group_active(p_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_end TIMESTAMPTZ;
  v_start TIMESTAMPTZ;
BEGIN
  SELECT c.end_datetime, c.start_datetime INTO v_end, v_start
  FROM barengan_posts bp
  JOIN concerts c ON c.id = bp.concert_id
  WHERE bp.id = p_post_id;

  v_end := COALESCE(v_end, v_start);
  IF v_end IS NULL THEN RETURN true; END IF;

  RETURN NOW() < (v_end + INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.barengan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barengan_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read members of posts" ON public.barengan_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barengan_posts WHERE id = barengan_post_id AND user_id = auth.uid())
    OR user_id = auth.uid()
    OR (
      status = 'approved'
      AND public.is_barengan_group_member(barengan_post_id, auth.uid())
    )
  );
CREATE POLICY "Request to join" ON public.barengan_members
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Creator manages members" ON public.barengan_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM barengan_posts WHERE id = barengan_post_id AND user_id = auth.uid())
  );
CREATE POLICY "Own member delete" ON public.barengan_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Read group messages" ON public.barengan_messages
  FOR SELECT USING (public.is_barengan_group_member(barengan_post_id, auth.uid()));
CREATE POLICY "Send group messages" ON public.barengan_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.is_barengan_group_member(barengan_post_id, auth.uid())
    AND public.is_barengan_group_active(barengan_post_id)
  );
