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
    // Try lyrics.ovh first
    const lyricsUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    console.log('Fetching from lyrics.ovh API:', lyricsUrl);

    let lyrics: string | null = null;

    try {
      const response = await fetch(lyricsUrl);
      console.log('lyrics.ovh response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('lyrics.ovh response data:', data ? 'has data' : 'no data');
        if (data?.lyrics && typeof data.lyrics === 'string' && data.lyrics.trim()) {
          lyrics = data.lyrics;
          console.log('Successfully got lyrics from lyrics.ovh, length:', lyrics.length);
        } else {
          console.log('lyrics.ovh returned empty or invalid lyrics');
        }
      } else {
        console.log('lyrics.ovh request failed with status:', response.status);
      }
    } catch (e) {
      console.error('lyrics.ovh request error:', e);
    }

    // Fallback to Lyrist API if needed
    if (!lyrics) {
      const lyristUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(title)}/${encodeURIComponent(artist)}`;
      console.log('Falling back to Lyrist API:', lyristUrl);
      try {
        const res2 = await fetch(lyristUrl);
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2?.lyrics && typeof data2.lyrics === 'string' && data2.lyrics.trim()) {
            lyrics = data2.lyrics;
          } else {
            console.log('Lyrist returned no lyrics');
          }
        } else {
          console.log('Lyrist request not ok');
        }
      } catch (e2) {
        console.log('Lyrist request failed:', e2);
      }
    }

    if (!lyrics) {
      console.log('Lyrics not found for this song');
      return new Response(
        JSON.stringify({ lyrics: null, error: 'Lyrics not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Lyrics fetched successfully');
    return new Response(
      JSON.stringify({ lyrics }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
