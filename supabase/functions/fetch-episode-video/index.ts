import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { showTitle, seasonNumber, episodeNumber, episodeName } = await req.json();
    
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }

    // Build a specific search query for the episode
    const searchQuery = episodeName 
      ? `${showTitle} S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')} ${episodeName} full episode english subtitles`
      : `${showTitle} season ${seasonNumber} episode ${episodeNumber} full episode english subtitles`;
    
    console.log(`Searching for: ${searchQuery}`);
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCaption=closedCaption&maxResults=1&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      console.error(`YouTube API error:`, response.status);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch video",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const video = data.items?.[0];
    
    if (video?.id?.videoId) {
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      console.log(`Found video: ${videoUrl}`);
      return new Response(
        JSON.stringify({ videoUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback video
    return new Response(
      JSON.stringify({ videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch episode video error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
