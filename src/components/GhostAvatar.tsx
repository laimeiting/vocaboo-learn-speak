import React from 'react';
import { cn } from '@/lib/utils';

interface GhostAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'winking' | 'happy' | 'sleepy' | 'surprised';
  className?: string;
  floating?: boolean;
  accessory?: 'none' | 'hat' | 'headphones' | 'glasses' | 'crown';
}

const GhostAvatar: React.FC<GhostAvatarProps> = ({
  size = 'md',
  variant = 'default',
  className,
  floating = false,
  accessory = 'none'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const getEyes = () => {
    switch (variant) {
      case 'winking':
        return (
          <>
            <circle cx="18" cy="22" r="2" fill="#6366f1" />
            <path d="M26 20 L30 22 L26 24" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'happy':
        return (
          <>
            <circle cx="18" cy="22" r="2" fill="#6366f1" />
            <circle cx="30" cy="22" r="2" fill="#6366f1" />
          </>
        );
      case 'sleepy':
        return (
          <>
            <path d="M16 22 L20 20 L16 18" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 22 L32 20 L28 18" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="18" cy="20" r="3" fill="#6366f1" />
            <circle cx="30" cy="20" r="3" fill="#6366f1" />
          </>
        );
      default:
        return (
          <>
            <circle cx="18" cy="22" r="2" fill="#6366f1" />
            <circle cx="30" cy="22" r="2" fill="#6366f1" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (variant) {
      case 'happy':
        return <path d="M20 30 Q24 34 28 30" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none" />;
      case 'surprised':
        return <ellipse cx="24" cy="30" rx="3" ry="4" fill="#6366f1" />;
      case 'sleepy':
        return <circle cx="24" cy="30" r="1" fill="#6366f1" />;
      default:
        return <path d="M20 30 Q24 32 28 30" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none" />;
    }
  };

  const getAccessory = () => {
    switch (accessory) {
      case 'hat':
        return (
          <g>
            <ellipse cx="24" cy="8" rx="16" ry="3" fill="#f59e0b" />
            <ellipse cx="24" cy="12" rx="12" ry="6" fill="#f59e0b" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            <path d="M12 20 Q12 12 24 12 Q36 12 36 20" stroke="#ef4444" strokeWidth="3" fill="none" />
            <rect x="10" y="18" width="6" height="8" rx="3" fill="#ef4444" />
            <rect x="32" y="18" width="6" height="8" rx="3" fill="#ef4444" />
          </g>
        );
      case 'glasses':
        return (
          <g>
            <circle cx="18" cy="22" r="6" stroke="#374151" strokeWidth="2" fill="transparent" />
            <circle cx="30" cy="22" r="6" stroke="#374151" strokeWidth="2" fill="transparent" />
            <path d="M24 22 L26 22" stroke="#374151" strokeWidth="2" />
          </g>
        );
      case 'crown':
        return (
          <g>
            <polygon points="12,10 16,6 20,10 24,4 28,10 32,6 36,10 36,14 12,14" fill="#fbbf24" />
            <circle cx="24" cy="8" r="2" fill="#f59e0b" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      sizeClasses[size],
      floating && 'ghost-float',
      className
    )}>
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ghost body with gradient */}
        <defs>
          <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ghost body */}
        <path
          d="M24 8 C16 8 10 14 10 22 L10 38 L14 34 L18 38 L22 34 L26 38 L30 34 L34 38 L38 34 L38 22 C38 14 32 8 24 8 Z"
          fill="url(#ghostGradient)"
          filter="url(#glow)"
        />
        
        {/* Accessory (rendered before face for proper layering) */}
        {getAccessory()}
        
        {/* Eyes */}
        {getEyes()}
        
        {/* Mouth */}
        {getMouth()}
        
        {/* Blush for happy variant */}
        {variant === 'happy' && (
          <>
            <circle cx="12" cy="26" r="2" fill="#fca5a5" opacity="0.7" />
            <circle cx="36" cy="26" r="2" fill="#fca5a5" opacity="0.7" />
          </>
        )}
      </svg>
    </div>
  );
};

export default GhostAvatar;