import React, { useState, useEffect } from 'react';
import { Tv, Film, Play, Clock, Star, Users, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import VideoPlayer from '@/components/VideoPlayer';

interface Show {
  id: string;
  title: string;
  description: string;
  type: 'tv_show' | 'movie';
  genre: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  seasons: number;
  episodes: number;
  rating: number;
  release_year: number;
  image_url?: string;
  subtitle_languages: string[];
  trailer_url?: string;
  video_url?: string;
}

const Shows = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    filterShows();
  }, [shows, searchTerm, typeFilter, difficultyFilter]);

  const fetchShows = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-shows', {
        body: { 
          filters: {
            type: typeFilter,
            difficulty: difficultyFilter,
            search: searchTerm
          }
        }
      });

      if (error) throw error;
      setShows((data?.shows || []) as Show[]);
    } catch (error) {
      console.error('Error fetching shows:', error);
      toast({
        title: "Error",
        description: "Failed to load shows from API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterShows = () => {
    let filtered = shows;

    if (searchTerm) {
      filtered = filtered.filter(show =>
        show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        show.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        show.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(show => show.type === typeFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(show => show.difficulty_level === difficultyFilter);
    }

    setFilteredShows(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-secondary text-secondary-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const speakDescription = async (text: string, showId: string) => {
    if (isPlayingAudio === showId) {
      // Stop current audio
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(showId);
    
    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (response.error) throw response.error;

      const { audioContent } = response.data;
      
      // Convert base64 to audio and play
      const audioBlob = new Blob([
        new Uint8Array(atob(audioContent).split('').map(c => c.charCodeAt(0)))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Audio Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(null);
      toast({
        title: "Error",
        description: "Failed to generate audio",
        variant: "destructive",
      });
    }
  };

  const handleWatch = (show: Show) => {
    setSelectedShow(show);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedShow(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 font-heading">
            Learn English Through Movies & TV Shows
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-4">
            Watch authentic content with English subtitles, learn real vocabulary, and improve your listening comprehension.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span>📝</span>
              <span>Interactive Subtitles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span>📚</span>
              <span>Vocabulary Builder</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span>🎯</span>
              <span>Multiple Difficulty Levels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search shows, movies, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tv_show">TV Shows</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show) => (
            <Card key={show.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="font-heading text-lg leading-tight">{show.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {show.type === 'tv_show' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                  </div>
                </div>
                
                {/* Learning Focus */}
                <div className="space-y-2">
                  <Badge className={getDifficultyColor(show.difficulty_level)}>
                    {show.difficulty_level} English
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      📝 English Subtitles
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      🎯 Learn Vocabulary
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {show.genre.slice(0, 2).map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {/* Learning Stats */}
                <div className="bg-primary/5 rounded-lg p-3 mb-3">
                  <div className="text-xs font-semibold text-primary mb-2">Learning Features:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">📚</span>
                      <span>~{Math.floor(Math.random() * 200 + 100)} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-primary">🗣️</span>
                      <span>{show.difficulty_level === 'beginner' ? 'Clear' : show.difficulty_level === 'intermediate' ? 'Natural' : 'Fast'} speech</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-primary">⭐</span>
                      <span>{show.rating}/10 rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-primary">🌍</span>
                      <span>Multi-language</span>
                    </div>
                  </div>
                </div>
                
                <CardDescription className="text-sm line-clamp-2 mb-3">
                  {show.description}
                </CardDescription>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {show.duration_minutes}m
                  </div>
                  {show.type === 'tv_show' && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {show.seasons}S • {show.episodes}E
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-3">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handleWatch(show)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Learn with Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakDescription(show.description, show.id)}
                  disabled={isPlayingAudio === show.id}
                >
                  <Mic className={`w-4 h-4 ${isPlayingAudio === show.id ? 'animate-pulse' : ''}`} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredShows.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No shows found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedShow && (
        <VideoPlayer
          show={selectedShow}
          isOpen={isVideoPlayerOpen}
          onClose={handleCloseVideoPlayer}
        />
      )}
    </div>
  );
};

export default Shows;