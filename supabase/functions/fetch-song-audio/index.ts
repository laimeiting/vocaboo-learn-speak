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

    if (!title && !artist) {
      throw new Error('Title or artist is required')
    }

    const clientId = '56d30c95' // Demo client id; consider rotating if rate-limited

    async function searchJamendo(query: string) {
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=1&audioformat=mp32&search=${encodeURIComponent(query)}&order=popularity_total_desc`
      const res = await fetch(url)
      if (!res.ok) return null
      const json = await res.json()
      const track = json?.results?.[0]
      return track || null
    }

    let matched = true
    let track = null as any

    if (title && artist) {
      console.log(`Searching for song: ${title} by ${artist}`)
      track = await searchJamendo(`${title} ${artist}`)
    }

    if (!track && title) {
      matched = false
      console.log(`Fallback search by title: ${title}`)
      track = await searchJamendo(title)
    }

    if (!track && title) {
      matched = false
      const simplified = title.replace(/[^a-z0-9 ]/gi, ' ').replace(/\s+/g, ' ').trim()
      if (simplified && simplified !== title) {
        console.log(`Fallback search by simplified title: ${simplified}`)
        track = await searchJamendo(simplified)
      }
    }

    if (!track && artist) {
      matched = false
      console.log(`Fallback search by artist: ${artist}`)
      track = await searchJamendo(artist)
    }

    if (!track) {
      matched = false
      console.log('No exact/partial match, using popular instrumental fallback')
      track = await searchJamendo('instrumental background')
    }

    if (track) {
      return new Response(
        JSON.stringify({
          audio_url: track.audio,
          title: track.name,
          artist: track.artist_name,
          duration: track.duration,
          image: track.image,
          matched,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('No track found after all attempts')
    return new Response(
      JSON.stringify({ audio_url: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
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