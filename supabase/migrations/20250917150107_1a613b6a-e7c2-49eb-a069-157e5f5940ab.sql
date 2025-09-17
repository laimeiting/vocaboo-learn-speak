-- Add video_url column to shows table if it doesn't exist
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update shows with actual video URLs (using public domain/Creative Commons videos)
UPDATE public.shows SET 
  video_url = CASE 
    WHEN title = 'Breaking Bad' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    WHEN title = 'The Office' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    WHEN title = 'Friends' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    WHEN title = 'Stranger Things' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    WHEN title = 'The Crown' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    WHEN title = 'House of Cards' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    WHEN title = 'Game of Thrones' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    WHEN title = 'Sherlock' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
    WHEN title = 'The Witcher' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    WHEN title = 'Bridgerton' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'
    WHEN title = 'Forrest Gump' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    WHEN title = 'The Shawshank Redemption' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    WHEN title = 'Pulp Fiction' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    WHEN title = 'The Godfather' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    WHEN title = 'Inception' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    ELSE 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  END
WHERE video_url IS NULL OR video_url = '';

-- Add more sample shows with video URLs if needed
INSERT INTO public.shows (title, description, type, genre, difficulty_level, duration_minutes, seasons, episodes, rating, release_year, image_url, subtitle_languages, trailer_url, video_url) VALUES
  ('Avatar: The Last Airbender', 'An epic animated series about a young Avatar mastering the four elements to save the world.', 'tv_show', ARRAY['Animation', 'Adventure'], 'intermediate', 25, 3, 61, 9.3, 2005, 'https://example.com/avatar.jpg', ARRAY['en', 'es'], 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('Planet Earth', 'Stunning nature documentary series showcasing wildlife and landscapes.', 'tv_show', ARRAY['Documentary', 'Nature'], 'beginner', 50, 2, 11, 9.4, 2006, 'https://example.com/planet-earth.jpg', ARRAY['en'], 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
  ('The Pursuit of Happyness', 'Inspiring story of a struggling salesman who becomes a stockbroker.', 'movie', ARRAY['Drama', 'Biography'], 'intermediate', 117, 1, 1, 8.0, 2006, 'https://example.com/pursuit.jpg', ARRAY['en'], 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4')
ON CONFLICT (title) DO NOTHING;