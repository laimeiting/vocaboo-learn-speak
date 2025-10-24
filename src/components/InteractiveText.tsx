import { useState, useEffect } from 'react';
import WordDefinitionPopup from './WordDefinitionPopup';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Word {
  text: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  examples: string[];
}

interface InteractiveTextProps {
  content: string;
  words: Record<string, Word>;
  savedWords: Set<string>;
  onSaveWord: (word: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const InteractiveText = ({ 
  content, 
  words, 
  savedWords, 
  onSaveWord, 
  className,
  style 
}: InteractiveTextProps) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loadingTranslations, setLoadingTranslations] = useState<Set<string>>(new Set());

  const handleWordClick = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    
    // Only open popup for vocabulary words
    if (words[cleanWord]) {
      setSelectedWord(cleanWord);
    }
    
    // Fetch translation for any word clicked
    if (!translations[cleanWord] && !loadingTranslations.has(cleanWord)) {
      setLoadingTranslations(prev => new Set([...prev, cleanWord]));
      
      try {
        const { data, error } = await supabase.functions.invoke('translate-word', {
          body: { word: cleanWord, targetLanguage: 'es' }
        });
        
        if (error) throw error;
        
        if (data?.translation) {
          setTranslations(prev => ({ ...prev, [cleanWord]: data.translation }));
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setLoadingTranslations(prev => {
          const newSet = new Set(prev);
          newSet.delete(cleanWord);
          return newSet;
        });
      }
    }
  };

  const renderText = () => {
    const sentences = content.split(/([.!?]+)/);
    
    return sentences.map((sentence, sentenceIndex) => {
      if (/[.!?]+/.test(sentence)) {
        return <span key={sentenceIndex}>{sentence}</span>;
      }

      const wordsInSentence = sentence.split(/(\s+)/);
      
      return (
        <span key={sentenceIndex}>
          {wordsInSentence.map((word, wordIndex) => {
            if (/^\s+$/.test(word)) {
              return <span key={wordIndex}>{word}</span>;
            }

            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            const isVocabWord = words[cleanWord];
            const isSaved = savedWords.has(cleanWord);
            const punctuation = word.match(/[^\w\s]/g)?.join('') || '';
            const wordWithoutPunctuation = word.replace(/[^\w\s]/g, '');

            // Make all words clickable
            return (
              <span key={wordIndex} className="inline-flex flex-col items-start gap-0.5">
                <span
                  onClick={() => handleWordClick(word)}
                  className={cn(
                    "cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors",
                    isVocabWord && "word-highlight",
                    isSaved && "saved"
                  )}
                >
                  {wordWithoutPunctuation}
                </span>
                {translations[cleanWord] && (
                  <span className="text-xs text-primary/70 font-medium -mt-1">
                    {translations[cleanWord]}
                  </span>
                )}
                {loadingTranslations.has(cleanWord) && (
                  <span className="text-xs text-muted-foreground animate-pulse -mt-1">
                    ...
                  </span>
                )}
                {punctuation}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className={className}>
      <div className="text-lg leading-relaxed select-none" style={style}>
        {renderText()}
      </div>
      
      {selectedWord && words[selectedWord] && (
        <WordDefinitionPopup
          word={selectedWord}
          definition={words[selectedWord].definition}
          partOfSpeech={words[selectedWord].partOfSpeech}
          pronunciation={words[selectedWord].pronunciation}
          examples={words[selectedWord].examples}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          onSave={onSaveWord}
          isSaved={savedWords.has(selectedWord)}
        />
      )}
    </div>
  );
};

export default InteractiveText;