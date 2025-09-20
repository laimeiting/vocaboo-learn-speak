import React from 'react';
import { Play, BookOpen, Tv, Music, Trophy, Archive, Settings, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GhostAvatar from '@/components/GhostAvatar';
import ProgressBalloon from '@/components/ProgressBalloon';
import SpeechBubble from '@/components/SpeechBubble';
import GhostButton from '@/components/GhostButton';
import { useNavigate } from 'react-router-dom';

const GhostHomepage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Mock user data
  const userData = {
    name: "Alex",
    streak: 7,
    todayProgress: 7,
    todayGoal: 10,
    notifications: 2
  };

  const contentData = {
    books: [
      { id: 1, title: "The Little Prince", author: "Antoine de Saint-Exupéry", level: "Intermediate", cover: "/api/placeholder/120/160" },
      { id: 2, title: "Charlotte's Web", author: "E.B. White", level: "Beginner", cover: "/api/placeholder/120/160" },
      { id: 3, title: "The Giver", author: "Lois Lowry", level: "Advanced", cover: "/api/placeholder/120/160" }
    ],
    shows: [
      { id: 1, title: "Friends", genre: "Comedy", level: "Intermediate", cover: "/api/placeholder/120/160" },
      { id: 2, title: "The Office", genre: "Comedy", level: "Advanced", cover: "/api/placeholder/120/160" },
      { id: 3, title: "Stranger Things", genre: "Drama", level: "Advanced", cover: "/api/placeholder/120/160" }
    ],
    songs: [
      { id: 1, title: "Imagine", artist: "John Lennon", level: "Intermediate", cover: "/api/placeholder/120/160" },
      { id: 2, title: "Yesterday", artist: "The Beatles", level: "Beginner", cover: "/api/placeholder/120/160" },
      { id: 3, title: "Bohemian Rhapsody", artist: "Queen", level: "Advanced", cover: "/api/placeholder/120/160" }
    ]
  };

  const progressPercentage = (userData.todayProgress / userData.todayGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-secondary-light/10">
      {/* Floating ghost patterns in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-5">
          <GhostAvatar size="xl" floating />
        </div>
        <div className="absolute top-40 right-20 opacity-5">
          <GhostAvatar size="lg" floating />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-5">
          <GhostAvatar size="md" floating />
        </div>
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <GhostAvatar size="md" variant="winking" floating />
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">
                Hi, {userData.name}! 👻
              </h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <GhostAvatar size="sm" accessory="crown" className="w-5 h-5" />
                  <span className="text-sm font-bold text-accent">🔥 {userData.streak}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative"
            >
              <GhostAvatar 
                size="sm" 
                accessory={theme === 'dark' ? "glasses" : "none"}
                className="w-6 h-6" 
              />
              {theme === 'dark' ? <Moon className="w-4 h-4 ml-1" /> : <Sun className="w-4 h-4 ml-1" />}
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <GhostAvatar size="sm" className="w-6 h-6" />
              <Bell className="w-4 h-4 ml-1" />
              {userData.notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 text-xs bg-destructive">
                  {userData.notifications}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="sm">
              <GhostAvatar size="sm" accessory="hat" className="w-6 h-6" />
              <Settings className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </header>

        {/* Daily Progress */}
        <section className="mb-8">
          <ProgressBalloon
            progress={progressPercentage}
            total={userData.todayGoal}
            current={userData.todayProgress}
            unit="min"
          />
        </section>

        {/* Content Carousel */}
        <section className="mb-8">
          <Tabs defaultValue="books" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 rounded-2xl">
              <TabsTrigger value="books" className="rounded-xl font-button">
                <div className="flex items-center space-x-2">
                  <GhostAvatar size="sm" accessory="glasses" className="w-5 h-5" />
                  <BookOpen className="w-4 h-4" />
                  <span>Books</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="shows" className="rounded-xl font-button">
                <div className="flex items-center space-x-2">
                  <GhostAvatar size="sm" accessory="headphones" className="w-5 h-5" />
                  <Tv className="w-4 h-4" />
                  <span>Shows</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="songs" className="rounded-xl font-button">
                <div className="flex items-center space-x-2">
                  <GhostAvatar size="sm" variant="happy" className="w-5 h-5" />
                  <Music className="w-4 h-4" />
                  <span>Songs</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="books" className="space-y-4">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {contentData.books.map((book) => (
                  <Card key={book.id} className="min-w-[140px] card-hover bg-card/80 backdrop-blur">
                    <CardContent className="p-3">
                      <div className="relative mb-2">
                        <div className="w-full h-32 bg-gradient-ghost rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <GhostAvatar size="sm" variant="sleepy" className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                      <Badge variant="secondary" className="text-xs mb-2">{book.level}</Badge>
                      <GhostButton size="sm" className="w-full" onClick={() => navigate('/reading')}>
                        Start
                      </GhostButton>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shows" className="space-y-4">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {contentData.shows.map((show) => (
                  <Card key={show.id} className="min-w-[140px] card-hover bg-card/80 backdrop-blur">
                    <CardContent className="p-3">
                      <div className="relative mb-2">
                        <div className="w-full h-32 bg-gradient-ghost rounded-lg flex items-center justify-center">
                          <Tv className="w-8 h-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <GhostAvatar size="sm" accessory="headphones" className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-1">{show.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{show.genre}</p>
                      <Badge variant="secondary" className="text-xs mb-2">{show.level}</Badge>
                      <GhostButton size="sm" className="w-full" onClick={() => navigate('/shows')}>
                        Watch
                      </GhostButton>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="songs" className="space-y-4">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {contentData.songs.map((song) => (
                  <Card key={song.id} className="min-w-[140px] card-hover bg-card/80 backdrop-blur">
                    <CardContent className="p-3">
                      <div className="relative mb-2">
                        <div className="w-full h-32 bg-gradient-ghost rounded-lg flex items-center justify-center">
                          <Music className="w-8 h-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <GhostAvatar size="sm" variant="happy" className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="font-heading font-semibold text-sm line-clamp-2 mb-1">{song.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{song.artist}</p>
                      <Badge variant="secondary" className="text-xs mb-2">{song.level}</Badge>
                      <GhostButton size="sm" className="w-full" onClick={() => navigate('/songs')}>
                        Play
                      </GhostButton>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="font-heading font-bold text-lg mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <GhostButton
              variant="default"
              size="lg"
              icon={Play}
              className="w-full justify-start"
              ghostVariant="winking"
            >
              Continue Last Session
            </GhostButton>
            
            <GhostButton
              variant="accent"
              size="lg"
              icon={Archive}
              className="w-full justify-start"
              ghostVariant="happy"
            >
              Saved Words & Phrases
            </GhostButton>
            
            <GhostButton
              variant="success"
              size="lg"
              icon={Trophy}
              className="w-full justify-start"
              ghostVariant="surprised"
            >
              Daily Challenge
            </GhostButton>
          </div>
        </section>

        {/* Motivational Message */}
        <section className="mb-8">
          <div className="flex items-start space-x-3">
            <GhostAvatar size="md" variant="happy" floating />
            <SpeechBubble variant="encouraging" position="left" className="flex-1">
              <p className="font-body text-sm">
                <span className="font-bold">Boo-tiful job!</span> Keep going for your streak! 👍
              </p>
            </SpeechBubble>
          </div>
        </section>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur border-t border-border">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              <Button variant="ghost" className="flex flex-col items-center space-y-1 p-2">
                <div className="relative">
                  <GhostAvatar size="sm" accessory="crown" className="w-6 h-6 animate-wiggle" />
                </div>
                <span className="text-xs font-button">Home</span>
              </Button>
              
              <Button variant="ghost" className="flex flex-col items-center space-y-1 p-2" onClick={() => navigate('/reading')}>
                <div className="relative">
                  <GhostAvatar size="sm" accessory="glasses" className="w-6 h-6" />
                </div>
                <span className="text-xs font-button">Practice</span>
              </Button>
              
              <Button variant="ghost" className="flex flex-col items-center space-y-1 p-2">
                <div className="relative">
                  <GhostAvatar size="sm" variant="sleepy" className="w-6 h-6" />
                </div>
                <span className="text-xs font-button">Word Bank</span>
              </Button>
              
              <Button variant="ghost" className="flex flex-col items-center space-y-1 p-2">
                <div className="relative">
                  <GhostAvatar size="sm" variant="winking" className="w-6 h-6" />
                </div>
                <span className="text-xs font-button">Profile</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Spacing for bottom nav */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default GhostHomepage;