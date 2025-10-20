import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, originalText } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Processing pronunciation check...');

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    // Transcribe audio with Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const status = whisperResponse.status;
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', status, errorText);
      // Gracefully handle rate limits / quota issues
      if (status === 429 || errorText.includes('insufficient_quota')) {
        return new Response(
          JSON.stringify({
            error: 'Speech-to-text rate limit or quota exceeded. Please try again later.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Payment required (rare for this endpoint, but handle defensively)
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required by the transcription provider. Please check billing.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const whisperResult = await whisperResponse.json();
    const transcribedText = whisperResult.text;
    
    console.log('Transcribed text:', transcribedText);
    console.log('Original text:', originalText);

    // Use GPT to compare and provide feedback
    const feedbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an English pronunciation teacher. Compare what the student said with the original text and provide helpful, encouraging feedback on their pronunciation. Keep feedback concise and specific.'
          },
          {
            role: 'user',
            content: `Original text: "${originalText}"\n\nWhat the student said: "${transcribedText}"\n\nProvide feedback on their pronunciation accuracy. If they got it right or very close, praise them! If there are differences, point them out gently and suggest improvements.`
          }
        ],
        // Use legacy param for gpt-4o-mini
        max_tokens: 200,
      }),
    });

    if (!feedbackResponse.ok) {
      const status = feedbackResponse.status;
      const errorText = await feedbackResponse.text();
      console.error('GPT API error:', status, errorText);
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Feedback service rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required by the feedback provider. Please check billing.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`GPT API error: ${errorText}`);
    }

    const feedbackResult = await feedbackResponse.json();
    const feedback = feedbackResult.choices[0].message.content;

    // Calculate simple similarity score
    const similarity = calculateSimilarity(transcribedText.toLowerCase(), originalText.toLowerCase());

    return new Response(
      JSON.stringify({
        transcribed: transcribedText,
        original: originalText,
        feedback: feedback,
        score: similarity,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pronunciation check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const maxLength = Math.max(words1.length, words2.length);
  
  let matches = 0;
  const minLength = Math.min(words1.length, words2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (words1[i] === words2[i]) {
      matches++;
    }
  }
  
  return Math.round((matches / maxLength) * 100);
}
