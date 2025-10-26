import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId } = await req.json();
    
    if (!bookId) {
      throw new Error('Book ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching book:', bookId);

    // Fetch the book
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError) throw bookError;
    if (!book) throw new Error('Book not found');

    console.log('Book fetched:', book.title);

    // Check if chapters already exist
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('book_id', bookId)
      .limit(1);

    if (existingChapters && existingChapters.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Chapters already exist for this book' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use OpenAI to split content into chapters
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that splits book content into logical chapters. Return a JSON array of chapters, where each chapter has "title" and "content" fields. Aim for 5-10 chapters of roughly equal length.'
          },
          {
            role: 'user',
            content: `Split this book into chapters:\n\nTitle: ${book.title}\n\nContent:\n${book.content}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate chapters');
    }

    const aiResult = await openAIResponse.json();
    console.log('AI response received');
    
    const chaptersData = JSON.parse(aiResult.choices[0].message.content);
    const chapters = chaptersData.chapters || [];

    // Insert chapters into database
    const chaptersToInsert = chapters.map((chapter: any, index: number) => ({
      book_id: bookId,
      chapter_number: index + 1,
      title: chapter.title,
      content: chapter.content,
    }));

    const { data: insertedChapters, error: insertError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${insertedChapters.length} chapters`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chapters: insertedChapters.length,
        message: `Generated ${insertedChapters.length} chapters for ${book.title}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
