import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Volume2, BookOpen, X, Languages, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface WordDefinitionPopupProps {
  word: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  examples: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (word: string) => void;
  isSaved: boolean;
  isLoading?: boolean;
}

const WordDefinitionPopup = ({
  word,
  definition,
  partOfSpeech,
  pronunciation,
  examples,
  isOpen,
  onClose,
  onSave,
  isSaved,
  isLoading = false
}: WordDefinitionPopupProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [translation, setTranslation] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedLang = localStorage.getItem('translationLanguage') || 'es';
      setTranslationLanguage(savedLang);
      fetchTranslation(word, savedLang);
    } else {
      setTranslation('');
    }
  }, [isOpen, word]);

  const fetchTranslation = async (wordToTranslate: string, targetLang: string) => {
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-word', {
        body: { word: wordToTranslate, targetLanguage: targetLang }
      });

      if (error) throw error;
      if (data?.translation) {
        setTranslation(data.translation);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simulate audio playing
    setTimeout(() => setIsPlaying(false), 1000);
    
    // Use Web Speech API for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-popup border border-primary/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-primary px-6 py-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-bold">{word}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
              {partOfSpeech}
            </Badge>
            <button
              onClick={handlePlayAudio}
              className={cn(
                "flex items-center gap-1 text-sm bg-white/10 rounded-full px-3 py-1",
                "hover:bg-white/20 transition-colors",
                isPlaying && "animate-pulse"
              )}
            >
              <Volume2 className="w-3 h-3" />
              {pronunciation}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Definition */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Definition</h4>
            {isLoading ? (
              <p className="text-muted-foreground animate-pulse">Loading definition...</p>
            ) : (
              <p className="text-muted-foreground leading-relaxed">{definition}</p>
            )}
          </div>

          {/* Translation */}
          {translationLanguage && (
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Translation
              </h4>
              {isTranslating ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              ) : translation ? (
                <div className="bg-gradient-subtle rounded-lg p-3 border border-primary/10">
                  <p className="text-foreground font-medium">{translation}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Examples */}
          {!isLoading && examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Examples</h4>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground italic">"{example}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onSave(word)}
              variant={isSaved ? "secondary" : "default"}
              className={cn(
                "flex-1 transition-all duration-200",
                isSaved 
                  ? "bg-success text-success-foreground hover:bg-success/90" 
                  : "bg-gradient-primary hover:shadow-button"
              )}
            >
              <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} />
              {isSaved ? "Saved!" : "Save Word"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordDefinitionPopup;