import React from 'react';
import { cn } from '@/lib/utils';
import GhostAvatar from './GhostAvatar';

interface ProgressBalloonProps {
  progress: number; // 0-100
  total: number;
  current: number;
  unit?: string;
  className?: string;
}

const ProgressBalloon: React.FC<ProgressBalloonProps> = ({
  progress,
  total,
  current,
  unit = "min",
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Ghost blowing balloon */}
      <div className="relative">
        {/* Ghost */}
        <div className="relative z-10">
          <GhostAvatar size="lg" variant="happy" floating className="transform rotate-6" />
        </div>
        
        {/* Balloon */}
        <div className="absolute -top-8 left-20 z-0">
          <div className="relative">
            {/* Balloon body */}
            <div 
              className="w-24 h-32 rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(var(--success-light)), hsl(var(--success)))`,
                boxShadow: 'var(--shadow-ghost)'
              }}
            >
              {/* Progress fill */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                style={{
                  height: `${progress}%`,
                  background: `linear-gradient(135deg, hsl(var(--success)), hsl(var(--success-dark)))`,
                }}
              />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-30" />
              
              {/* Balloon shine */}
              <div 
                className="absolute top-2 left-2 w-4 h-6 rounded-full bg-white opacity-40"
              />
            </div>
            
            {/* Balloon string */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-400"
            />
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-12 left-8 animate-bounce">
          <div className="w-1 h-1 bg-accent rounded-full opacity-60" />
        </div>
        <div className="absolute -top-6 left-32 animate-bounce delay-150">
          <div className="w-1.5 h-1.5 bg-accent rounded-full opacity-40" />
        </div>
        <div className="absolute -top-16 left-24 animate-bounce delay-300">
          <div className="w-1 h-1 bg-accent rounded-full opacity-50" />
        </div>
      </div>
      
      {/* Progress text */}
      <div className="text-center">
        <p className="text-lg font-bold font-heading text-foreground">
          {current}/{total} {unit} today!
        </p>
        <div className="w-48 h-2 bg-muted rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-success rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBalloon;