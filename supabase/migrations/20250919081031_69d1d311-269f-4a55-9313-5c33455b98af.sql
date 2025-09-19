-- Point songs to locally hosted audio files to ensure reliable playback
UPDATE songs SET audio_url = '/audio/amazing-grace.wav' WHERE title = 'Amazing Grace';
UPDATE songs SET audio_url = '/audio/auld-lang-syne.wav' WHERE title = 'Auld Lang Syne';
UPDATE songs SET audio_url = '/audio/happy-birthday.wav' WHERE title = 'Happy Birthday to You';
UPDATE songs SET audio_url = '/audio/mary-lamb.wav' WHERE title = 'Mary Had a Little Lamb';
UPDATE songs SET audio_url = '/audio/old-macdonald.wav' WHERE title = 'Old MacDonald Had a Farm';
UPDATE songs SET audio_url = '/audio/twinkle-twinkle.wav' WHERE title = 'Twinkle, Twinkle, Little Star';