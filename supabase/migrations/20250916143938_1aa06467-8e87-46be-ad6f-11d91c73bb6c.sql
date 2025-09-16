-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create shows table for TV shows and movies
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('tv_show', 'movie')),
  genre TEXT[],
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  seasons INTEGER DEFAULT 1,
  episodes INTEGER DEFAULT 1,
  image_url TEXT,
  trailer_url TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 10),
  release_year INTEGER,
  language TEXT DEFAULT 'en',
  subtitle_languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create episodes table for individual episodes
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  season_number INTEGER NOT NULL DEFAULT 1,
  episode_number INTEGER NOT NULL,
  duration_minutes INTEGER,
  video_url TEXT,
  subtitle_url TEXT,
  vocabulary_words TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(show_id, season_number, episode_number)
);

-- Create user progress table
CREATE TABLE public.user_show_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, show_id, episode_id)
);

-- Enable Row Level Security
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_show_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for shows (public read)
CREATE POLICY "Shows are viewable by everyone" 
ON public.shows 
FOR SELECT 
USING (true);

-- Create policies for episodes (public read)
CREATE POLICY "Episodes are viewable by everyone" 
ON public.episodes 
FOR SELECT 
USING (true);

-- Create policies for user progress (user-specific)
CREATE POLICY "Users can view their own progress" 
ON public.user_show_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.user_show_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_show_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.user_show_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_shows_updated_at
BEFORE UPDATE ON public.shows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
BEFORE UPDATE ON public.episodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_show_progress_updated_at
BEFORE UPDATE ON public.user_show_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample TV shows and movies
INSERT INTO public.shows (title, description, type, genre, difficulty_level, duration_minutes, seasons, episodes, rating, release_year, language, subtitle_languages) VALUES
('Friends', 'A group of friends navigate life and love in New York City. Perfect for learning everyday English and American culture.', 'tv_show', ARRAY['Comedy', 'Romance'], 'beginner', 22, 10, 236, 8.9, 1994, 'en', ARRAY['en', 'es', 'fr']),
('The Crown', 'Chronicles the reign of Queen Elizabeth II. Excellent for learning formal British English and historical vocabulary.', 'tv_show', ARRAY['Drama', 'History'], 'advanced', 60, 6, 60, 8.7, 2016, 'en', ARRAY['en', 'es', 'fr', 'de']),
('Brooklyn Nine-Nine', 'Comedy series about detectives in Brooklyn. Great for casual conversation and workplace English.', 'tv_show', ARRAY['Comedy', 'Crime'], 'intermediate', 22, 8, 153, 8.4, 2013, 'en', ARRAY['en', 'es']),
('The Pursuit of Happyness', 'Inspiring story of a father''s struggle. Perfect for emotional vocabulary and American English.', 'movie', ARRAY['Drama', 'Biography'], 'intermediate', 117, 1, 1, 8.0, 2006, 'en', ARRAY['en', 'es', 'fr']),
('Finding Nemo', 'Animated adventure about a fish finding his son. Ideal for beginners with clear pronunciation.', 'movie', ARRAY['Animation', 'Family'], 'beginner', 100, 1, 1, 8.2, 2003, 'en', ARRAY['en', 'es', 'fr', 'de', 'it']),
('Sherlock', 'Modern adaptation of Arthur Conan Doyle''s detective stories. Advanced vocabulary and British accents.', 'tv_show', ARRAY['Crime', 'Drama', 'Mystery'], 'advanced', 90, 4, 13, 9.1, 2010, 'en', ARRAY['en', 'es', 'fr', 'de']);