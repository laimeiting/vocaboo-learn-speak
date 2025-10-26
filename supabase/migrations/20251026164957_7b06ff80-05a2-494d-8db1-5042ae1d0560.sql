-- Delete all traditional songs from the database
DELETE FROM public.lyrics_lines 
WHERE song_id IN (
  SELECT id FROM public.songs 
  WHERE artist = 'Traditional'
);

DELETE FROM public.songs 
WHERE artist = 'Traditional';