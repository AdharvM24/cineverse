-- ==========================================================
-- TMDB CineVerse Supabase Database Schema & RLS Policies
-- Fully Idempotent (Safe to run multiple times)
-- ==========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT DEFAULT '',
  full_name TEXT,
  avatar_url TEXT,
  favorite_genre TEXT DEFAULT 'Action',
  preferred_language TEXT DEFAULT 'ml',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure email column is not blocked by NOT NULL constraint on partial updates
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT '';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto create profile on auth signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Watchlists Table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  vote_average NUMERIC(3, 1),
  release_date TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_tmdb ON public.watchlists(tmdb_id, media_type);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.watchlists;
CREATE POLICY "Users can manage their own watchlist"
  ON public.watchlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  vote_average NUMERIC(3, 1),
  release_date TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Watch History Table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  progress_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.watch_history(user_id);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their watch history" ON public.watch_history;
CREATE POLICY "Users can manage their watch history"
  ON public.watch_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own reviews" ON public.reviews;
CREATE POLICY "Users can manage their own reviews"
  ON public.reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  dark_mode BOOLEAN DEFAULT true,
  autoplay_trailers BOOLEAN DEFAULT true,
  stream_provider_region TEXT DEFAULT 'IN',
  preferred_genres JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Reload PostgREST API Schema Cache
NOTIFY pgrst, 'reload schema';
