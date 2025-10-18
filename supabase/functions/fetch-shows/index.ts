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
    const { filters } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create a prompt based on filters
    let prompt = "Generate a JSON array of 10 TV shows and movies for English learning. ";
    
    if (filters?.type && filters.type !== 'all') {
      prompt += `Only include ${filters.type === 'tv_show' ? 'TV shows' : 'movies'}. `;
    }
    
    if (filters?.difficulty && filters.difficulty !== 'all') {
      prompt += `Only include ${filters.difficulty} level content. `;
    }
    
    if (filters?.search) {
      prompt += `Filter by: ${filters.search}. `;
    }

    prompt += `Each item must have: id (uuid format), title, description (max 200 chars), type (tv_show or movie), genre (array), difficulty_level (beginner/intermediate/advanced), duration_minutes, seasons, episodes, rating (0-10), release_year, subtitle_languages (array with en, es, fr), video_url (use https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4). Return ONLY valid JSON array, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a data generator. Return only valid JSON, no markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI request failed");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "[]";
    
    // Remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const shows = JSON.parse(content);

    return new Response(
      JSON.stringify({ shows }),
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
