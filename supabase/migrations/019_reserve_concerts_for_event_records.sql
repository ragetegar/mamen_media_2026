-- Articles cannot use the Concerts category; /concerts is reserved for event records.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('news', 'music', 'lifestyle', 'sports', 'hobbies')
);
