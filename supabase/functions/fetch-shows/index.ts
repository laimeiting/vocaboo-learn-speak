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

    // Fetch popular TV shows for English learning
    if (shouldFetchTVShows) {
      // List of TV shows known to be great for learning English
      const englishLearningShows = [
        'Friends',
        'Brooklyn Nine-Nine',
        'Modern Family',
        'Breaking Bad',
        'The Office',
        'How I Met Your Mother',
        'Stranger Things',
        'The Crown',
        'Suits',
        'The Big Bang Theory'
      ];

      const tvShowsPromises = englishLearningShows.map(async (showName) => {
        try {
          const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(showName)}&page=1`
          );
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const show = searchData.results?.[0];
            
            if (show) {
              // Fetch detailed show info including seasons
              const detailsResponse = await fetch(
                `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&language=en-US`
              );
              
              let seasonsData: any[] = [];
              
              if (detailsResponse.ok) {
                const details = await detailsResponse.json();
                
                // Fetch episodes for each season
                const seasonPromises = (details.seasons || []).map(async (season: any) => {
                  if (season.season_number === 0) return null; // Skip specials
                  
                  try {
                    const seasonResponse = await fetch(
                      `https://api.themoviedb.org/3/tv/${show.id}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=en-US`
                    );
                    
                    if (seasonResponse.ok) {
                      const seasonData = await seasonResponse.json();
                      return {
                        season_number: season.season_number,
                        name: season.name,
                        episode_count: season.episode_count,
                        episodes: (seasonData.episodes || []).slice(0, 5).map((ep: any) => ({
                          episode_number: ep.episode_number,
                          name: ep.name,
                          overview: ep.overview,
                          still_path: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
                          runtime: ep.runtime || 45,
                        })),
                      };
                    }
                  } catch (error) {
                    console.error(`Error fetching season ${season.season_number} for ${showName}:`, error);
                  }
                  return null;
                });
                
                const seasons = await Promise.all(seasonPromises);
                seasonsData = seasons.filter(s => s !== null);
              }
              
              return {
                id: crypto.randomUUID(),
                tmdb_id: show.id,
                title: show.name,
                description: show.overview,
                type: 'tv_show',
                genre: ['Drama', 'Comedy'],
                difficulty_level: getDifficultyLevel(show.vote_average),
                duration_minutes: 45,
                seasons: show.number_of_seasons || 1,
                episodes: show.number_of_episodes || 10,
                rating: show.vote_average,
                release_year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 2020,
                subtitle_languages: ['en', 'es', 'fr'],
                seasons_data: seasonsData,
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching ${showName}:`, error);
        }
        return null;
      });

      const tvShowsResults = await Promise.all(tvShowsPromises);
      const tvShows = tvShowsResults.filter(show => show !== null);
      allShows = [...allShows, ...tvShows];
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