-- Insert educational songs into the songs table
INSERT INTO public.songs (id, title, artist, album, genre, difficulty_level, duration_seconds, release_year, subtitle_languages, vocabulary_words, lyrics, language)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Amazing Grace', 'Traditional', NULL, ARRAY['Folk', 'Traditional'], 'beginner', 180, NULL, ARRAY['en'], ARRAY['grace', 'saved', 'wretch'], 
   E'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.\n\n''Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.\n\nThrough many dangers, toils and snares,\nI have already come;\n''Tis grace hath brought me safe thus far,\nAnd grace will lead me home.', 'en'),
  
  ('00000000-0000-0000-0000-000000000002', 'Happy Birthday', 'Traditional', NULL, ARRAY['Traditional'], 'beginner', 25, NULL, ARRAY['en'], ARRAY['birthday', 'happy', 'dear'],
   E'Happy birthday to you\nHappy birthday to you\nHappy birthday, dear friend\nHappy birthday to you', 'en'),
  
  ('00000000-0000-0000-0000-000000000003', 'Twinkle Twinkle Little Star', 'Traditional', NULL, ARRAY['Children', 'Traditional'], 'beginner', 60, NULL, ARRAY['en'], ARRAY['twinkle', 'star', 'wonder', 'diamond', 'sky'],
   E'Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\nTwinkle, twinkle, little star,\nHow I wonder what you are!', 'en'),
  
  ('00000000-0000-0000-0000-000000000004', 'Mary Had a Little Lamb', 'Traditional', NULL, ARRAY['Children', 'Traditional'], 'beginner', 45, NULL, ARRAY['en'], ARRAY['lamb', 'fleece', 'white', 'snow', 'follow'],
   E'Mary had a little lamb,\nLittle lamb, little lamb,\nMary had a little lamb,\nIts fleece was white as snow.\n\nAnd everywhere that Mary went,\nMary went, Mary went,\nEverywhere that Mary went,\nThe lamb was sure to go.', 'en'),
  
  ('00000000-0000-0000-0000-000000000005', 'Old MacDonald Had a Farm', 'Traditional', NULL, ARRAY['Children', 'Traditional'], 'beginner', 90, NULL, ARRAY['en'], ARRAY['farm', 'animal', 'moo', 'oink', 'quack'],
   E'Old MacDonald had a farm, E-I-E-I-O\nAnd on his farm he had a cow, E-I-E-I-O\nWith a moo-moo here and a moo-moo there\nHere a moo, there a moo, everywhere a moo-moo\nOld MacDonald had a farm, E-I-E-I-O\n\nOld MacDonald had a farm, E-I-E-I-O\nAnd on his farm he had a pig, E-I-E-I-O\nWith an oink-oink here and an oink-oink there\nHere an oink, there an oink, everywhere an oink-oink\nOld MacDonald had a farm, E-I-E-I-O', 'en'),
  
  ('00000000-0000-0000-0000-000000000006', 'Auld Lang Syne', 'Traditional', NULL, ARRAY['Folk', 'Traditional'], 'intermediate', 150, NULL, ARRAY['en'], ARRAY['auld', 'lang', 'syne', 'acquaintance', 'forgot'],
   E'Should auld acquaintance be forgot,\nAnd never brought to mind?\nShould auld acquaintance be forgot,\nAnd auld lang syne!\n\nFor auld lang syne, my dear,\nFor auld lang syne,\nWe''ll tak a cup o'' kindness yet,\nFor auld lang syne.', 'en')
ON CONFLICT (id) DO UPDATE SET
  lyrics = EXCLUDED.lyrics,
  vocabulary_words = EXCLUDED.vocabulary_words,
  duration_seconds = EXCLUDED.duration_seconds;

-- Insert synchronized lyrics for Amazing Grace (180 seconds, 12 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 0, 0, 15, 'Amazing grace! How sweet the sound'),
  ('00000000-0000-0000-0000-000000000001', 1, 15, 30, 'That saved a wretch like me!'),
  ('00000000-0000-0000-0000-000000000001', 2, 30, 45, 'I once was lost, but now am found;'),
  ('00000000-0000-0000-0000-000000000001', 3, 45, 60, 'Was blind, but now I see.'),
  ('00000000-0000-0000-0000-000000000001', 4, 60, 75, '''Twas grace that taught my heart to fear,'),
  ('00000000-0000-0000-0000-000000000001', 5, 75, 90, 'And grace my fears relieved;'),
  ('00000000-0000-0000-0000-000000000001', 6, 90, 105, 'How precious did that grace appear'),
  ('00000000-0000-0000-0000-000000000001', 7, 105, 120, 'The hour I first believed.'),
  ('00000000-0000-0000-0000-000000000001', 8, 120, 135, 'Through many dangers, toils and snares,'),
  ('00000000-0000-0000-0000-000000000001', 9, 135, 150, 'I have already come;'),
  ('00000000-0000-0000-0000-000000000001', 10, 150, 165, '''Tis grace hath brought me safe thus far,'),
  ('00000000-0000-0000-0000-000000000001', 11, 165, 180, 'And grace will lead me home.')
ON CONFLICT DO NOTHING;

-- Insert synchronized lyrics for Happy Birthday (25 seconds, 4 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 0, 0, 6, 'Happy birthday to you'),
  ('00000000-0000-0000-0000-000000000002', 1, 6, 12, 'Happy birthday to you'),
  ('00000000-0000-0000-0000-000000000002', 2, 12, 19, 'Happy birthday, dear friend'),
  ('00000000-0000-0000-0000-000000000002', 3, 19, 25, 'Happy birthday to you')
ON CONFLICT DO NOTHING;

-- Insert synchronized lyrics for Twinkle Twinkle Little Star (60 seconds, 6 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000003', 0, 0, 10, 'Twinkle, twinkle, little star,'),
  ('00000000-0000-0000-0000-000000000003', 1, 10, 20, 'How I wonder what you are!'),
  ('00000000-0000-0000-0000-000000000003', 2, 20, 30, 'Up above the world so high,'),
  ('00000000-0000-0000-0000-000000000003', 3, 30, 40, 'Like a diamond in the sky.'),
  ('00000000-0000-0000-0000-000000000003', 4, 40, 50, 'Twinkle, twinkle, little star,'),
  ('00000000-0000-0000-0000-000000000003', 5, 50, 60, 'How I wonder what you are!')
ON CONFLICT DO NOTHING;

-- Insert synchronized lyrics for Mary Had a Little Lamb (45 seconds, 8 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 0, 0, 5, 'Mary had a little lamb,'),
  ('00000000-0000-0000-0000-000000000004', 1, 5, 10, 'Little lamb, little lamb,'),
  ('00000000-0000-0000-0000-000000000004', 2, 10, 15, 'Mary had a little lamb,'),
  ('00000000-0000-0000-0000-000000000004', 3, 15, 20, 'Its fleece was white as snow.'),
  ('00000000-0000-0000-0000-000000000004', 4, 20, 27, 'And everywhere that Mary went,'),
  ('00000000-0000-0000-0000-000000000004', 5, 27, 32, 'Mary went, Mary went,'),
  ('00000000-0000-0000-0000-000000000004', 6, 32, 39, 'Everywhere that Mary went,'),
  ('00000000-0000-0000-0000-000000000004', 7, 39, 45, 'The lamb was sure to go.')
ON CONFLICT DO NOTHING;

-- Insert synchronized lyrics for Old MacDonald Had a Farm (90 seconds, 10 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 0, 0, 9, 'Old MacDonald had a farm, E-I-E-I-O'),
  ('00000000-0000-0000-0000-000000000005', 1, 9, 18, 'And on his farm he had a cow, E-I-E-I-O'),
  ('00000000-0000-0000-0000-000000000005', 2, 18, 27, 'With a moo-moo here and a moo-moo there'),
  ('00000000-0000-0000-0000-000000000005', 3, 27, 36, 'Here a moo, there a moo, everywhere a moo-moo'),
  ('00000000-0000-0000-0000-000000000005', 4, 36, 45, 'Old MacDonald had a farm, E-I-E-I-O'),
  ('00000000-0000-0000-0000-000000000005', 5, 45, 54, 'Old MacDonald had a farm, E-I-E-I-O'),
  ('00000000-0000-0000-0000-000000000005', 6, 54, 63, 'And on his farm he had a pig, E-I-E-I-O'),
  ('00000000-0000-0000-0000-000000000005', 7, 63, 72, 'With an oink-oink here and an oink-oink there'),
  ('00000000-0000-0000-0000-000000000005', 8, 72, 81, 'Here an oink, there an oink, everywhere an oink-oink'),
  ('00000000-0000-0000-0000-000000000005', 9, 81, 90, 'Old MacDonald had a farm, E-I-E-I-O')
ON CONFLICT DO NOTHING;

-- Insert synchronized lyrics for Auld Lang Syne (150 seconds, 8 lines)
INSERT INTO public.lyrics_lines (song_id, line_number, start_time_seconds, end_time_seconds, text)
VALUES 
  ('00000000-0000-0000-0000-000000000006', 0, 0, 18, 'Should auld acquaintance be forgot,'),
  ('00000000-0000-0000-0000-000000000006', 1, 18, 36, 'And never brought to mind?'),
  ('00000000-0000-0000-0000-000000000006', 2, 36, 54, 'Should auld acquaintance be forgot,'),
  ('00000000-0000-0000-0000-000000000006', 3, 54, 72, 'And auld lang syne!'),
  ('00000000-0000-0000-0000-000000000006', 4, 72, 90, 'For auld lang syne, my dear,'),
  ('00000000-0000-0000-0000-000000000006', 5, 90, 108, 'For auld lang syne,'),
  ('00000000-0000-0000-0000-000000000006', 6, 108, 132, 'We''ll tak a cup o'' kindness yet,'),
  ('00000000-0000-0000-0000-000000000006', 7, 132, 150, 'For auld lang syne.')
ON CONFLICT DO NOTHING;