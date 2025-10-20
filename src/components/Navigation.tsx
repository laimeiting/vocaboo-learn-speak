import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookmarkCheck, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold gradient-text">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            Vocaboo
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/saved-words') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/saved-words" className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Words</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/daily-challenge') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/daily-challenge" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Daily Challenge</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/settings') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;