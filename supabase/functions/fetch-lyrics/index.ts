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

    // Fallback to AI generation if no lyrics found
    if (!lyrics) {
      console.log('Lyrics not found from APIs, trying AI generation...');
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (LOVABLE_API_KEY) {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful assistant that generates song lyrics. Generate lyrics that match the style and theme of the requested song. Keep it appropriate for language learners.'
                },
                {
                  role: 'user',
                  content: `Generate lyrics for the song "${title}" by ${artist}. If you know this song, provide the actual lyrics. If not, create original lyrics inspired by the song title and artist style.`
                }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            lyrics = aiData.choices?.[0]?.message?.content;
            if (lyrics) {
              console.log('AI generated lyrics successfully');
              return new Response(
                JSON.stringify({ lyrics, ai_generated: true }),
                {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 200,
                }
              );
            }
          }
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }

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
