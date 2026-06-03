-- Profile enhancements: banner, social links, favorite concerts
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_x TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_concert_ids UUID[] DEFAULT '{}';
