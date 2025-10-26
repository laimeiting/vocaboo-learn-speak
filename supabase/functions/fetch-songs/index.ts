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

    // Also add some curated educational songs for learning
    const educationalSongs: Song[] = [
      {
        id: 'edu-1',
        title: 'Amazing Grace',
        artist: 'Traditional',
        genre: ['Folk', 'Traditional'],
        difficulty_level: 'beginner',
        duration_seconds: 180,
        audio_url: '/audio/amazing-grace.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['grace', 'saved', 'wretch'],
      },
      {
        id: 'edu-2',
        title: 'Happy Birthday',
        artist: 'Traditional',
        genre: ['Traditional'],
        difficulty_level: 'beginner',
        duration_seconds: 25,
        audio_url: '/audio/happy-birthday.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['birthday', 'happy', 'dear'],
      },
      {
        id: 'edu-3',
        title: 'Twinkle Twinkle Little Star',
        artist: 'Traditional',
        genre: ['Children', 'Traditional'],
        difficulty_level: 'beginner',
        duration_seconds: 60,
        audio_url: '/audio/twinkle-twinkle.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['twinkle', 'star', 'wonder', 'diamond', 'sky'],
      },
      {
        id: 'edu-4',
        title: 'Mary Had a Little Lamb',
        artist: 'Traditional',
        genre: ['Children', 'Traditional'],
        difficulty_level: 'beginner',
        duration_seconds: 45,
        audio_url: '/audio/mary-lamb.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['lamb', 'fleece', 'white', 'snow', 'follow'],
      },
      {
        id: 'edu-5',
        title: 'Old MacDonald Had a Farm',
        artist: 'Traditional',
        genre: ['Children', 'Traditional'],
        difficulty_level: 'beginner',
        duration_seconds: 90,
        audio_url: '/audio/old-macdonald.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['farm', 'animal', 'moo', 'oink', 'quack'],
      },
      {
        id: 'edu-6',
        title: 'Auld Lang Syne',
        artist: 'Traditional',
        genre: ['Folk', 'Traditional'],
        difficulty_level: 'intermediate',
        duration_seconds: 150,
        audio_url: '/audio/auld-lang-syne.wav',
        subtitle_languages: ['en'],
        vocabulary_words: ['auld', 'lang', 'syne', 'acquaintance', 'forgot'],
      },
    ];

    // Add educational songs to the beginning
    songs.unshift(...educationalSongs);

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
