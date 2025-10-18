import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import GhostAvatar from './GhostAvatar';

interface GhostButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'secondary' | 'success' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  ghostVariant?: 'default' | 'winking' | 'happy' | 'sleepy' | 'surprised';
  showGhost?: boolean;
}

const GhostButton: React.FC<GhostButtonProps> = ({
  children,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className,
  onClick,
  disabled = false,
  ghostVariant = 'happy',
  showGhost = true
}) => {
  const variantClasses = {
    default: 'bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-button',
    secondary: 'bg-gradient-secondary text-secondary-foreground hover:opacity-90 shadow-button',
    success: 'bg-gradient-success text-success-foreground hover:opacity-90 shadow-button',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-button'
  };

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-button font-semibold rounded-2xl border-0 transition-all duration-200',
        'bounce-hover active:scale-95',
        'relative overflow-hidden group',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center space-x-2 relative z-10">
        {showGhost && (
          <GhostAvatar 
            size="sm" 
            variant={ghostVariant}
            className="w-6 h-6" 
          />
        )}
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
      </div>
      
      {/* Sparkle effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300">
        <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-150" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping delay-300" />
      </div>
    </Button>
  );
};

export default GhostButton;