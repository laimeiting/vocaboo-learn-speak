import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_seconds: number;
  release_year?: number;
  audio_url?: string;
  lyrics?: string;
  vocabulary_words?: string[];
  subtitle_languages: string[];
  image_url?: string;
}

// Helper function to determine difficulty based on artist popularity and genre
function getDifficultyLevel(genre: string, trackName: string): 'beginner' | 'intermediate' | 'advanced' {
  const lowerGenre = genre.toLowerCase();
  const lowerTrack = trackName.toLowerCase();
  
  // Children's songs and traditional are beginner
  if (lowerGenre.includes('children') || lowerTrack.includes('nursery') || 
      lowerGenre.includes('folk') || lowerGenre.includes('traditional')) {
    return 'beginner';
  }
  
  // Pop, country, and easy listening are intermediate
  if (lowerGenre.includes('pop') || lowerGenre.includes('country') || 
      lowerGenre.includes('easy') || lowerGenre.includes('acoustic')) {
    return 'intermediate';
  }
  
  // Rock, hip-hop, electronic are advanced
  return 'advanced';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm = '', genre = 'all', difficulty = 'all' } = await req.json();
    
    console.log('Fetching songs with filters:', { searchTerm, genre, difficulty });

    const songs: Song[] = [];

    // Fetch popular English songs from iTunes API
    const searchQuery = searchTerm || 'popular english songs';
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&country=US&limit=50&lang=en`;
    
    console.log('Fetching from iTunes API:', itunesUrl);
    
    const itunesResponse = await fetch(itunesUrl);
    const itunesData = await itunesResponse.json();

    if (itunesData.results && itunesData.results.length > 0) {
      for (const track of itunesData.results) {
        const primaryGenre = track.primaryGenreName || 'Pop';
        const releaseDate = track.releaseDate ? new Date(track.releaseDate) : null;
        const releaseYear = releaseDate ? releaseDate.getFullYear() : undefined;
        
        const song: Song = {
          id: `itunes-${track.trackId}`,
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          genre: [primaryGenre],
          difficulty_level: getDifficultyLevel(primaryGenre, track.trackName),
          duration_seconds: Math.round(track.trackTimeMillis / 1000),
          release_year: releaseYear,
          audio_url: track.previewUrl, // 30-second preview
          image_url: track.artworkUrl100?.replace('100x100', '300x300'), // Higher res
          subtitle_languages: ['en'],
          vocabulary_words: [],
        };

        songs.push(song);
      }
    }


    // Apply filters
    let filteredSongs = songs;

    if (genre !== 'all') {
      filteredSongs = filteredSongs.filter(song => 
        song.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    if (difficulty !== 'all') {
      filteredSongs = filteredSongs.filter(song => song.difficulty_level === difficulty);
    }

    // Remove duplicates based on title and artist
    const uniqueSongs = filteredSongs.reduce((acc, song) => {
      const key = `${song.title.toLowerCase()}-${song.artist.toLowerCase()}`;
      if (!acc.has(key)) {
        acc.set(key, song);
      }
      return acc;
    }, new Map());

    const result = Array.from(uniqueSongs.values());

    console.log(`Returning ${result.length} songs`);

    return new Response(
      JSON.stringify({ songs: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching songs:', error);
    return new Response(
      JSON.stringify({ error: error.message, songs: [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
