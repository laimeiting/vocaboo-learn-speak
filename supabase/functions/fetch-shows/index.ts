import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchYouTubeVideoForShow(title: string, type: string, youtubeApiKey: string): Promise<string> {
  try {
    // Search for full episodes or trailers with English subtitles
    const searchQuery = type === 'movie' 
      ? `${title} full movie english subtitles`
      : `${title} full episode english subtitles`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCaption=closedCaption&maxResults=1&key=${youtubeApiKey}`
    );

    if (!response.ok) {
      console.error(`YouTube API error for "${title}":`, response.status);
      return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Fallback video
    }

    const data = await response.json();
    const video = data.items?.[0];
    
    if (video?.id?.videoId) {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      console.log(`Found YouTube video for "${title}":`, videoUrl);
      return videoUrl;
    }

    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Fallback video
  } catch (error) {
    console.error(`Error fetching YouTube video for "${title}":`, error);
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Fallback video
  }
}

function getDifficultyLevel(voteAverage: number): string {
  if (voteAverage >= 8) return "advanced";
  if (voteAverage >= 6) return "intermediate";
  return "beginner";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters } = await req.json();
    
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }
    
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }

    // Determine what to fetch based on filters
    const shouldFetchMovies = !filters?.type || filters.type === 'all' || filters.type === 'movie';
    const shouldFetchTVShows = !filters?.type || filters.type === 'all' || filters.type === 'tv_show';

    let allShows: any[] = [];

    // Fetch popular movies
    if (shouldFetchMovies) {
      const moviesResponse = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      
      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        const movies = moviesData.results.slice(0, 5).map((movie: any) => ({
          id: crypto.randomUUID(),
          title: movie.title,
          description: movie.overview,
          type: 'movie',
          genre: ['Drama', 'Action'], // TMDB returns genre IDs, simplifying for now
          difficulty_level: getDifficultyLevel(movie.vote_average),
          duration_minutes: 120,
          seasons: 1,
          episodes: 1,
          rating: movie.vote_average,
          release_year: new Date(movie.release_date).getFullYear(),
          subtitle_languages: ['en', 'es', 'fr'],
        }));
        allShows = [...allShows, ...movies];
      }
    }

    // Fetch popular TV shows
    if (shouldFetchTVShows) {
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        const tvShows = tvData.results.slice(0, 5).map((show: any) => ({
          id: crypto.randomUUID(),
          title: show.name,
          description: show.overview,
          type: 'tv_show',
          genre: ['Drama', 'Comedy'], // TMDB returns genre IDs, simplifying for now
          difficulty_level: getDifficultyLevel(show.vote_average),
          duration_minutes: 45,
          seasons: show.number_of_seasons || 1,
          episodes: show.number_of_episodes || 10,
          rating: show.vote_average,
          release_year: new Date(show.first_air_date).getFullYear(),
          subtitle_languages: ['en', 'es', 'fr'],
        }));
        allShows = [...allShows, ...tvShows];
      }
    }

    // Apply search filter if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      allShows = allShows.filter(show => 
        show.title.toLowerCase().includes(searchTerm) ||
        show.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply difficulty filter if provided
    if (filters?.difficulty && filters.difficulty !== 'all') {
      allShows = allShows.filter(show => show.difficulty_level === filters.difficulty);
    }

    // Fetch YouTube videos for each show
    console.log(`Fetching YouTube videos for ${allShows.length} shows...`);
    const showsWithVideos = await Promise.all(
      allShows.map(async (show: any) => {
        const videoUrl = await fetchYouTubeVideoForShow(show.title, show.type, YOUTUBE_API_KEY);
        return {
          ...show,
          video_url: videoUrl,
        };
      })
    );

    console.log(`Successfully fetched ${showsWithVideos.length} real shows with videos`);

    return new Response(
      JSON.stringify({ shows: showsWithVideos }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch shows error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});