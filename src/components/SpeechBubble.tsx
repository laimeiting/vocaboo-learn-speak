import React from 'react';
import { cn } from '@/lib/utils';

interface SpeechBubbleProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'encouraging';
  position?: 'left' | 'right' | 'center';
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  children,
  className,
  variant = 'default',
  position = 'left'
}) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border-border',
    success: 'bg-success-light text-success-foreground border-success',
    encouraging: 'bg-accent-light text-accent-foreground border-accent'
  };

  const positionClasses = {
    left: 'before:left-6',
    right: 'before:right-6',
    center: 'before:left-1/2 before:-translate-x-1/2'
  };

  return (
    <div className={cn(
      "relative p-4 rounded-2xl border-2 shadow-lg speech-bubble",
      "before:content-[''] before:absolute before:top-full before:w-0 before:h-0",
      "before:border-l-[12px] before:border-r-[12px] before:border-t-[12px]",
      "before:border-l-transparent before:border-r-transparent",
      variantClasses[variant],
      positionClasses[position],
      className
    )}
    >
      {children}
    </div>
  );
};

export default SpeechBubble;