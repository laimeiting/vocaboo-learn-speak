import { useState } from 'react';
import WordDefinitionPopup from './WordDefinitionPopup';
import { cn } from '@/lib/utils';

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
}

const InteractiveText = ({ 
  content, 
  words, 
  savedWords, 
  onSaveWord, 
  className 
}: InteractiveTextProps) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (words[cleanWord]) {
      setSelectedWord(cleanWord);
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
            const isInteractive = words[cleanWord];
            const isSaved = savedWords.has(cleanWord);
            const punctuation = word.match(/[^\w\s]/g)?.join('') || '';
            const wordWithoutPunctuation = word.replace(/[^\w\s]/g, '');

            if (isInteractive) {
              return (
                <span key={wordIndex}>
                  <span
                    onClick={() => handleWordClick(word)}
                    className={cn(
                      "word-highlight",
                      isSaved && "saved"
                    )}
                  >
                    {wordWithoutPunctuation}
                  </span>
                  {punctuation}
                </span>
              );
            }

            return <span key={wordIndex}>{word}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className={className}>
      <div className="text-lg leading-relaxed select-none">
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