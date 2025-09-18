-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  genre TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_seconds INTEGER,
  release_year INTEGER,
  language TEXT DEFAULT 'en',
  audio_url TEXT,
  image_url TEXT,
  lyrics TEXT,
  subtitle_languages TEXT[] DEFAULT ARRAY['en']::TEXT[],
  vocabulary_words TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Songs are viewable by everyone" 
ON public.songs 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample songs with public domain/traditional content
INSERT INTO public.songs (title, artist, album, genre, difficulty_level, duration_seconds, release_year, audio_url, lyrics, vocabulary_words) VALUES
('Twinkle, Twinkle, Little Star', 'Traditional', 'Children''s Songs', ARRAY['Traditional', 'Children'], 'beginner', 60, 1806, 'https://www.soundjay.com/misc/sounds/twinkle-twinkle.wav', 
'Twinkle, twinkle, little star
How I wonder what you are
Up above the world so high
Like a diamond in the sky
Twinkle, twinkle, little star
How I wonder what you are', 
ARRAY['twinkle', 'wonder', 'above', 'diamond', 'sky']),

('Happy Birthday to You', 'Traditional', 'Celebration Songs', ARRAY['Traditional', 'Celebration'], 'beginner', 30, 1912, 'https://www.soundjay.com/misc/sounds/happy-birthday.wav',
'Happy birthday to you
Happy birthday to you
Happy birthday dear [name]
Happy birthday to you',
ARRAY['happy', 'birthday', 'dear']),

('Old MacDonald Had a Farm', 'Traditional', 'Children''s Songs', ARRAY['Traditional', 'Children'], 'beginner', 120, 1917, 'https://www.soundjay.com/misc/sounds/old-macdonald.wav',
'Old MacDonald had a farm
E-I-E-I-O
And on his farm he had a cow
E-I-E-I-O
With a moo moo here
And a moo moo there
Here a moo, there a moo
Everywhere a moo moo
Old MacDonald had a farm
E-I-E-I-O',
ARRAY['farm', 'cow', 'everywhere']),

('Amazing Grace', 'Traditional', 'Hymns', ARRAY['Traditional', 'Spiritual'], 'intermediate', 180, 1779, 'https://www.soundjay.com/misc/sounds/amazing-grace.wav',
'Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now am found
Was blind, but now I see',
ARRAY['amazing', 'grace', 'sweet', 'wretch', 'lost', 'found', 'blind']),

('Auld Lang Syne', 'Traditional', 'Folk Songs', ARRAY['Traditional', 'Folk'], 'intermediate', 150, 1788, 'https://www.soundjay.com/misc/sounds/auld-lang-syne.wav',
'Should old acquaintance be forgot
And never brought to mind?
Should old acquaintance be forgot
And auld lang syne?',
ARRAY['acquaintance', 'forgot', 'brought', 'mind', 'auld', 'lang', 'syne']),

('Mary Had a Little Lamb', 'Traditional', 'Children''s Songs', ARRAY['Traditional', 'Children'], 'beginner', 45, 1830, 'https://www.soundjay.com/misc/sounds/mary-lamb.wav',
'Mary had a little lamb
Its fleece was white as snow
And everywhere that Mary went
The lamb was sure to go',
ARRAY['lamb', 'fleece', 'white', 'snow', 'everywhere', 'sure']);

-- Create lyrics_lines table for synchronized subtitles
CREATE TABLE public.lyrics_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lyrics_lines ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Lyrics lines are viewable by everyone" 
ON public.lyrics_lines 
FOR SELECT 
USING (true);

-- Insert sample synchronized lyrics for "Twinkle, Twinkle, Little Star"
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text) 
SELECT s.id, line_number, start_time_seconds, end_time_seconds, text
FROM public.songs s,
VALUES 
  (1, 0, 5, 'Twinkle, twinkle, little star'),
  (2, 5, 10, 'How I wonder what you are'),
  (3, 10, 15, 'Up above the world so high'),
  (4, 15, 20, 'Like a diamond in the sky'),
  (5, 20, 25, 'Twinkle, twinkle, little star'),
  (6, 25, 30, 'How I wonder what you are')
AS t(line_number, start_time_seconds, end_time_seconds, text)
WHERE s.title = 'Twinkle, Twinkle, Little Star';