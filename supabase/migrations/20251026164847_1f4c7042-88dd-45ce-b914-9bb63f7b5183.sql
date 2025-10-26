-- Ensure audio_url exists for educational traditional songs
UPDATE public.songs SET audio_url = '/audio/amazing-grace.wav'
WHERE title = 'Amazing Grace' AND artist = 'Traditional';

UPDATE public.songs SET audio_url = '/audio/happy-birthday.wav'
WHERE title = 'Happy Birthday' AND artist = 'Traditional';

UPDATE public.songs SET audio_url = '/audio/twinkle-twinkle.wav'
WHERE title = 'Twinkle Twinkle Little Star' AND artist = 'Traditional';

UPDATE public.songs SET audio_url = '/audio/mary-lamb.wav'
WHERE title = 'Mary Had a Little Lamb' AND artist = 'Traditional';

UPDATE public.songs SET audio_url = '/audio/old-macdonald.wav'
WHERE title = 'Old MacDonald Had a Farm' AND artist = 'Traditional';

UPDATE public.songs SET audio_url = '/audio/auld-lang-syne.wav'
WHERE title = 'Auld Lang Syne' AND artist = 'Traditional';