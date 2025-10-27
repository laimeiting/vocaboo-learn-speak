import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist, title } = await req.json();
    
    console.log('Fetching lyrics for:', { artist, title });

    if (!artist || !title) {
      throw new Error('Artist and title are required');
    }

    // Use lyrics.ovh free API (no authentication required)
    const lyricsUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    
    console.log('Fetching from lyrics API:', lyricsUrl);
    
    const response = await fetch(lyricsUrl);
    
    if (!response.ok) {
      console.log('Lyrics not found for this song');
      return new Response(
        JSON.stringify({ lyrics: null, error: 'Lyrics not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const data = await response.json();
    
    console.log('Lyrics fetched successfully');

    return new Response(
      JSON.stringify({ lyrics: data.lyrics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return new Response(
      JSON.stringify({ error: error.message, lyrics: null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
