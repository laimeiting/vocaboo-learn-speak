-- Create books table for reading materials
CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  author text,
  description text,
  content text NOT NULL,
  difficulty_level text NOT NULL,
  genre text[],
  page_count integer,
  reading_time_minutes integer,
  image_url text,
  published_year integer,
  vocabulary_words jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Books are viewable by everyone" 
ON public.books 
FOR SELECT 
USING (true);

-- Create index for better search performance
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_difficulty ON public.books(difficulty_level);

-- Insert sample books
INSERT INTO public.books (title, author, description, content, difficulty_level, genre, page_count, reading_time_minutes, published_year, vocabulary_words) VALUES
('The Queen''s Tale', 'Classic Tales', 'A benevolent queen who cherishes her subjects deeply and makes wise decisions for her kingdom.', 
'In a magnificent castle perched atop a verdant hill, there lived a benevolent queen who cherished her subjects deeply. The castle''s elaborate gardens flourished with vibrant flowers and ancient oak trees that provided shade for countless creatures. Every morning, the queen would contemplate the responsibilities of her realm while sipping tea from her favorite porcelain cup.

The queen possessed remarkable wisdom and always endeavored to make judicious decisions for her kingdom. Her advisors would frequently seek her counsel on matters both trivial and momentous. She believed that true leadership required not only intelligence but also compassion and humility.

One day, a messenger arrived with troubling news from a distant village. The queen listened intently and quickly assembled her most trusted advisors to discuss the matter. Together, they crafted a solution that would benefit all her people.',
'intermediate', ARRAY['Fiction', 'Fantasy'], 12, 15, 2020, 
'{"magnificent": {"text": "magnificent", "definition": "Extremely beautiful, elaborate, or impressive; splendid", "partOfSpeech": "adjective", "pronunciation": "/mæɡˈnɪfɪsənt/", "examples": ["The magnificent cathedral took centuries to build.", "She wore a magnificent gown to the royal ball."]}, "benevolent": {"text": "benevolent", "definition": "Well-meaning and kindly; charitable", "partOfSpeech": "adjective", "pronunciation": "/bəˈnevələnt/", "examples": ["The benevolent ruler was loved by all.", "Her benevolent nature made her many friends."]}}'::jsonb),

('The Little Prince', 'Antoine de Saint-Exupéry', 'A curious little prince travels from his tiny asteroid and learns about friendship and what truly matters.', 
'On the small asteroid B-612 lived a curious little prince who tended his volcanoes and watched sunsets. He met a pilot in the desert and learned about friendship from a wise fox who asked to be tamed. The little prince wondered about baobabs, roses, and what truly matters to the heart.',
'beginner', ARRAY['Fiction', 'Fantasy', 'Children'], 8, 10, 1943,
'{"asteroid": {"text": "asteroid", "definition": "A small rocky body orbiting the sun", "partOfSpeech": "noun", "pronunciation": "/ˈæstərɔɪd/", "examples": ["The little prince lived on a tiny asteroid."]}, "tamed": {"text": "tamed", "definition": "Made less wild; trained to behave in a controlled way", "partOfSpeech": "verb", "pronunciation": "/teɪmd/", "examples": ["The fox wished to be tamed by the little prince."]}}'::jsonb),

('Charlotte''s Web', 'E.B. White', 'A wise spider saves a young pig from slaughter by weaving magnificent words into her web.', 
'Wilbur was a young pig who lived in a barn with many other animals. He was frightened when he learned that the farmer planned to slaughter him in the winter. Charlotte, a wise and clever spider, became his friend and promised to help him. She wove magnificent words into her web above Wilbur''s pen, convincing everyone that he was a special pig worth saving.',
'beginner', ARRAY['Fiction', 'Children'], 10, 12, 1952,
'{"clever": {"text": "clever", "definition": "Quick to understand, learn, and devise solutions; intelligent", "partOfSpeech": "adjective", "pronunciation": "/ˈklevər/", "examples": ["Charlotte was a clever spider with a good plan."]}, "wove": {"text": "wove", "definition": "Past tense of weave; to create fabric or patterns", "partOfSpeech": "verb", "pronunciation": "/woʊv/", "examples": ["Charlotte wove words into her web."]}}'::jsonb),

('The Giver', 'Lois Lowry', 'Jonas discovers the truth about his seemingly perfect community when he becomes the Receiver of Memory.', 
'Jonas lived in a seemingly perfect community where everything was controlled and predictable. There was no pain, no war, and no suffering, but there was also no color, no music, and no real emotions. When Jonas turned twelve, he was assigned the extraordinary role of Receiver of Memory. The current Receiver, an elderly man called the Giver, began transmitting memories of the past to Jonas, revealing the truth about his world.',
'intermediate', ARRAY['Fiction', 'Dystopian', 'Young Adult'], 15, 18, 1993,
'{"seemingly": {"text": "seemingly", "definition": "Appearing to be true but not necessarily so", "partOfSpeech": "adverb", "pronunciation": "/ˈsiːmɪŋli/", "examples": ["The community was seemingly perfect."]}, "extraordinary": {"text": "extraordinary", "definition": "Very unusual or remarkable", "partOfSpeech": "adjective", "pronunciation": "/ɪkˈstrɔːrdəneri/", "examples": ["The role of Receiver was extraordinary."]}}'::jsonb),

('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Harry discovers he''s a wizard and embarks on magical adventures at Hogwarts School.', 
'Harry Potter had lived with the Dursleys for nearly ten years, sleeping in a cupboard under the stairs. The Dursleys were perfectly normal, thank you very much, and they had always pretended that Harry''s mother, their late sister, hadn''t existed at all. On his eleventh birthday, Harry discovered he was a wizard and was whisked away to Hogwarts School of Witchcraft and Wizardry, where he would embark on magnificent adventures with his new friends Ron and Hermione.',
'intermediate', ARRAY['Fiction', 'Fantasy', 'Young Adult'], 20, 25, 1997,
'{"wizard": {"text": "wizard", "definition": "A person who has magical powers", "partOfSpeech": "noun", "pronunciation": "/ˈwɪzərd/", "examples": ["Harry discovered he was a wizard."]}, "whisked": {"text": "whisked", "definition": "Moved or taken somewhere suddenly and quickly", "partOfSpeech": "verb", "pronunciation": "/wɪskt/", "examples": ["Harry was whisked away to Hogwarts."]}}'::jsonb),

('Wonder', 'R.J. Palacio', 'August Pullman, a boy with a facial difference, starts fifth grade and shows his classmates what it means to be kind.', 
'August Pullman was born with a facial difference that prevented him from going to a mainstream school until now. He''s about to start fifth grade at Beecher Prep, and if you''ve ever been the new kid, then you know how hard that can be. The thing is, Auggie''s just an ordinary kid with an extraordinary face. But can he convince his new classmates that he''s just like them, despite appearances?',
'intermediate', ARRAY['Fiction', 'Young Adult', 'Contemporary'], 18, 22, 2012,
'{"facial": {"text": "facial", "definition": "Relating to the face", "partOfSpeech": "adjective", "pronunciation": "/ˈfeɪʃəl/", "examples": ["August had a facial difference."]}, "prevented": {"text": "prevented", "definition": "Kept something from happening; stopped", "partOfSpeech": "verb", "pronunciation": "/prɪˈventɪd/", "examples": ["His condition prevented him from attending school."]}}'::jsonb);