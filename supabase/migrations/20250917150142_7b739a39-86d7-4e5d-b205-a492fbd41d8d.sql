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