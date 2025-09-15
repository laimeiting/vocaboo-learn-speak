import { useState, useEffect } from 'react';

interface VocabooMascotProps {
  mood?: 'happy' | 'encouraging' | 'celebrating' | 'neutral';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VocabooMascot = ({ mood = 'happy', message, size = 'md' }: VocabooMascotProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const moodEmojis = {
    happy: '🐣',
    encouraging: '🐥',
    celebrating: '🎉',
    neutral: '🐤'
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`
          ${sizeClasses[size]} rounded-full bg-gradient-secondary 
          flex items-center justify-center text-2xl
          transition-transform duration-300
          ${isAnimating ? 'scale-110 animate-bounce' : 'hover:scale-105'}
          shadow-button
        `}
      >
        {moodEmojis[mood]}
      </div>
      {message && (
        <div className="bg-card border border-primary/20 rounded-xl px-4 py-2 shadow-card max-w-xs">
          <p className="text-sm text-card-foreground font-medium">{message}</p>
        </div>
      )}
    </div>
  );
};

export default VocabooMascot;