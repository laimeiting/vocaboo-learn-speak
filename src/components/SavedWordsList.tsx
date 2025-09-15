import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedWord {
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  examples: string[];
  savedAt: Date;
}

interface SavedWordsListProps {
  savedWords: SavedWord[];
  onRemoveWord: (word: string) => void;
  className?: string;
}

const SavedWordsList = ({ savedWords, onRemoveWord, className }: SavedWordsListProps) => {
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const handlePlayAudio = (word: string) => {
    setPlayingWord(word);
    setTimeout(() => setPlayingWord(null), 1000);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (savedWords.length === 0) {
    return (
      <div className={`bg-card rounded-2xl p-8 shadow-card border border-primary/10 text-center ${className}`}>
        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">No saved words yet</h3>
        <p className="text-muted-foreground">
          Tap on words while reading to save them for later practice!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl p-6 shadow-card border border-primary/10 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-card-foreground">My Words</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {savedWords.length} saved
        </Badge>
      </div>

      <div className="space-y-3">
        {savedWords.map((savedWord) => (
          <div
            key={savedWord.word}
            className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors border border-primary/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{savedWord.word}</h4>
                  <Badge variant="outline" className="text-xs">
                    {savedWord.partOfSpeech}
                  </Badge>
                  <button
                    onClick={() => handlePlayAudio(savedWord.word)}
                    className={cn(
                      "text-xs text-muted-foreground hover:text-primary transition-colors",
                      playingWord === savedWord.word && "animate-pulse text-primary"
                    )}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {savedWord.definition}
                </p>
                
                {savedWord.examples.length > 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    "{savedWord.examples[0]}"
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveWord(savedWord.word)}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedWordsList;