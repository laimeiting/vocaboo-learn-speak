import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, artist } = await req.json()

    if (!title) {
      throw new Error('Title is required')
    }

    console.log(`Searching for song: ${title} by ${artist}`)

    // Search for the song on Jamendo (free music API)
    const searchQuery = artist ? `${title} ${artist}` : title
    const jamendoResponse = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=json&limit=1&search=${encodeURIComponent(searchQuery)}&audioformat=mp32`
    )

    if (!jamendoResponse.ok) {
      throw new Error('Failed to fetch from Jamendo API')
    }

    const jamendoData = await jamendoResponse.json()
    
    if (jamendoData.results && jamendoData.results.length > 0) {
      const track = jamendoData.results[0]
      console.log(`Found track: ${track.name} by ${track.artist_name}`)
      
      return new Response(
        JSON.stringify({
          audio_url: track.audio,
          title: track.name,
          artist: track.artist_name,
          duration: track.duration,
          image: track.image
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If not found on Jamendo, return null
    console.log('No track found')
    return new Response(
      JSON.stringify({ audio_url: null }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error fetching song audio:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})