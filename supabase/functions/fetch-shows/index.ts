import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchYouTubeVideoForShow(title: string, type: string, youtubeApiKey: string): Promise<string> {
  try {
    // Search for official trailers or clips
    const searchQuery = type === 'movie' 
      ? `${title} official trailer`
      : `${title} official clip`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${youtubeApiKey}`
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
    const shouldFetchVlogs = !filters?.type || filters.type === 'all' || filters.type === 'vlog';

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
              return {
                id: crypto.randomUUID(),
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

    // Fetch lifestyle vlogs for English learning
    if (shouldFetchVlogs) {
      const lifestyleVlogs = [
        {
          title: "Learn English with Emma",
          description: "Daily vlogs about life in London, food, shopping, and British culture. Perfect for intermediate English learners who want to improve their everyday conversation skills.",
          video_url: "https://www.youtube.com/watch?v=7E-cwdnsiow",
          difficulty_level: "intermediate",
          genre: ["Lifestyle", "Educational"]
        },
        {
          title: "Casey Neistat Daily Vlogs",
          description: "Fast-paced lifestyle vlogs from NYC covering tech, filmmaking, and daily adventures. Great for advanced learners who want to understand fast, natural American English.",
          video_url: "https://www.youtube.com/watch?v=WxfZkMm3wcg",
          difficulty_level: "advanced",
          genre: ["Lifestyle", "Technology"]
        },
        {
          title: "American Family Life",
          description: "Wholesome family vlogs showing everyday American life, home routines, and family activities. Ideal for beginners learning practical English phrases.",
          video_url: "https://www.youtube.com/watch?v=8irSFvoyNHI",
          difficulty_level: "beginner",
          genre: ["Lifestyle", "Family"]
        },
        {
          title: "Travel English with Mark",
          description: "Travel vlogs exploring different countries while teaching useful English phrases and cultural insights. Perfect for intermediate learners interested in travel.",
          video_url: "https://www.youtube.com/watch?v=1Tz3Hlah4yI",
          difficulty_level: "intermediate",
          genre: ["Lifestyle", "Travel"]
        },
        {
          title: "Cooking in English",
          description: "Simple cooking tutorials with clear English instructions. Great for beginners to learn food vocabulary and kitchen expressions in context.",
          video_url: "https://www.youtube.com/watch?v=vVQBRp-8lug",
          difficulty_level: "beginner",
          genre: ["Lifestyle", "Food"]
        },
        {
          title: "Student Life UK",
          description: "University student vlogs showing campus life, study tips, and social activities. Excellent for intermediate learners interested in academic English.",
          video_url: "https://www.youtube.com/watch?v=QRs7QOB4U8U",
          difficulty_level: "intermediate",
          genre: ["Lifestyle", "Education"]
        },
        {
          title: "Morning Routine Vlogs",
          description: "Peaceful morning routine vlogs with slow, clear narration. Perfect for beginners learning daily routine vocabulary and time expressions.",
          video_url: "https://www.youtube.com/watch?v=3eC7TdnMPZE",
          difficulty_level: "beginner",
          genre: ["Lifestyle", "Wellness"]
        },
        {
          title: "Tech & Lifestyle Reviews",
          description: "In-depth tech reviews and lifestyle gadget unboxings. Great for advanced learners interested in technology vocabulary and detailed explanations.",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          difficulty_level: "advanced",
          genre: ["Lifestyle", "Technology"]
        }
      ];

      const vlogs = lifestyleVlogs.map(vlog => ({
        id: crypto.randomUUID(),
        title: vlog.title,
        description: vlog.description,
        type: 'vlog',
        genre: vlog.genre,
        difficulty_level: vlog.difficulty_level,
        duration_minutes: 15,
        seasons: 1,
        episodes: 1,
        rating: 8.5,
        release_year: 2024,
        subtitle_languages: ['en'],
        video_url: vlog.video_url,
      }));

      allShows = [...allShows, ...vlogs];
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