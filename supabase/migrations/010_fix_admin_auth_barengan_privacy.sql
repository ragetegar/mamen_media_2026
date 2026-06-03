-- ═══════════════════════════════════════════════
-- ADMIN CMS + BARENGAN PRIVACY HARDENING
-- ═══════════════════════════════════════════════

-- Keep the database category constraint in sync with the app's current taxonomy,
-- while still accepting legacy categories that may already exist.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN (
    'music',
    'concerts',
    'lifestyle',
    'sports',
    'hobbies',
    'fashion',
    'gaming',
    'anime',
    'jkt48',
    'kpop',
    'news',
    'culture'
  )
);

-- Articles: public users only read published content; CMS roles can manage content.
DROP POLICY IF EXISTS "Public read articles" ON public.articles;
DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
DROP POLICY IF EXISTS "CMS read articles" ON public.articles;
DROP POLICY IF EXISTS "CMS insert articles" ON public.articles;
DROP POLICY IF EXISTS "CMS update articles" ON public.articles;
DROP POLICY IF EXISTS "Admin delete articles" ON public.articles;

CREATE POLICY "Public read published articles" ON public.articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "CMS read articles" ON public.articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'contributor')
    )
  );

CREATE POLICY "CMS insert articles" ON public.articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'contributor' AND articles.author_id = auth.uid()::text)
      )
    )
  );

CREATE POLICY "CMS update articles" ON public.articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'contributor' AND articles.author_id = auth.uid()::text)
      )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'contributor' AND articles.author_id = auth.uid()::text)
      )
    )
  );

CREATE POLICY "Admin delete articles" ON public.articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Article products follow article visibility/ownership.
DROP POLICY IF EXISTS "Public read products" ON public.article_products;
DROP POLICY IF EXISTS "Public read published article products" ON public.article_products;
DROP POLICY IF EXISTS "CMS read article products" ON public.article_products;
DROP POLICY IF EXISTS "CMS insert article products" ON public.article_products;
DROP POLICY IF EXISTS "CMS delete article products" ON public.article_products;

CREATE POLICY "Public read published article products" ON public.article_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_products.article_id
      AND articles.status = 'published'
    )
  );

CREATE POLICY "CMS read article products" ON public.article_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'contributor')
    )
  );

CREATE POLICY "CMS insert article products" ON public.article_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.articles
      JOIN public.profiles ON profiles.id = auth.uid()
      WHERE articles.id = article_products.article_id
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'contributor' AND articles.author_id = auth.uid()::text)
      )
    )
  );

CREATE POLICY "CMS delete article products" ON public.article_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.articles
      JOIN public.profiles ON profiles.id = auth.uid()
      WHERE articles.id = article_products.article_id
      AND (
        profiles.role = 'admin'
        OR (profiles.role = 'contributor' AND articles.author_id = auth.uid()::text)
      )
    )
  );

-- Barengan: a requester's identity stays hidden until they are approved.
ALTER TABLE public.barengan_posts ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 5;

DROP POLICY IF EXISTS "Read members of posts" ON public.barengan_members;
CREATE POLICY "Read members of posts" ON public.barengan_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.barengan_posts
      WHERE barengan_posts.id = barengan_members.barengan_post_id
      AND barengan_posts.user_id = auth.uid()
    )
    OR barengan_members.user_id = auth.uid()
    OR (
      barengan_members.status = 'approved'
      AND public.is_barengan_group_member(barengan_members.barengan_post_id, auth.uid())
    )
  );
