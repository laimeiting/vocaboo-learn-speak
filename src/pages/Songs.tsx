import React, { useState, useEffect } from 'react';
import { Music, Play, Clock, Star, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AudioPlayer from '@/components/AudioPlayer';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_seconds: number;
  release_year?: number;
  audio_url?: string;
  lyrics?: string;
  vocabulary_words?: string[];
  subtitle_languages: string[];
}

const Songs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isAudioPlayerOpen, setIsAudioPlayerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchTerm, genreFilter, difficultyFilter]);

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setSongs((data || []) as Song[]);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Error",
        description: "Failed to load songs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (genreFilter !== 'all') {
      filtered = filtered.filter(song => song.genre.includes(genreFilter));
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(song => song.difficulty_level === difficultyFilter);
    }

    setFilteredSongs(filtered);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-secondary text-secondary-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const speakLyrics = async (text: string, songId: string) => {
    if (isPlayingAudio === songId) {
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(songId);
    
    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (response.error) throw response.error;

      const { audioContent } = response.data;
      
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

  const handlePlay = async (song: Song) => {
    // Fetch real audio URL if not available
    if (!song.audio_url || song.audio_url.startsWith('/audio/')) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-song-audio', {
          body: { title: song.title, artist: song.artist }
        });

        if (error) throw error;

        if (data.audio_url) {
          // Update song with real audio URL
          song.audio_url = data.audio_url;
        }
      } catch (error) {
        console.error('Error fetching song audio:', error);
        toast({
          title: "Info",
          description: "Playing with fallback audio",
        });
      }
    }

    setSelectedSong(song);
    setIsAudioPlayerOpen(true);
  };

  const handleCloseAudioPlayer = () => {
    setIsAudioPlayerOpen(false);
    setSelectedSong(null);
  };

  const uniqueGenres = Array.from(new Set(songs.flatMap(song => song.genre)));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading songs...</p>
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
            Songs & Lyrics for English Learning
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Learn English through music with synchronized lyrics, vocabulary highlights, and pronunciation practice.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search songs, artists, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg">
              <SelectItem value="all">All Genres</SelectItem>
              {uniqueGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSongs.map((song) => (
            <Card key={song.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="font-heading text-lg leading-tight">{song.title}</CardTitle>
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  {song.artist}
                </CardDescription>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getDifficultyColor(song.difficulty_level)}>
                    {song.difficulty_level}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDuration(song.duration_seconds)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {song.genre.slice(0, 2).map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                {song.album && (
                  <p className="text-sm text-muted-foreground mb-2">Album: {song.album}</p>
                )}
                {song.release_year && (
                  <p className="text-sm text-muted-foreground mb-2">Released: {song.release_year}</p>
                )}
                {song.vocabulary_words && song.vocabulary_words.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Key Vocabulary:</p>
                    <div className="flex flex-wrap gap-1">
                      {song.vocabulary_words.slice(0, 3).map((word) => (
                        <Badge key={word} variant="outline" className="text-xs">{word}</Badge>
                      ))}
                      {song.vocabulary_words.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{song.vocabulary_words.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex gap-2 pt-3">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handlePlay(song)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                {song.lyrics && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakLyrics(song.lyrics!, song.id)}
                    disabled={isPlayingAudio === song.id}
                  >
                    <Mic className={`w-4 h-4 ${isPlayingAudio === song.id ? 'animate-pulse' : ''}`} />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredSongs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Audio Player Modal */}
      {selectedSong && (
        <AudioPlayer
          song={selectedSong}
          isOpen={isAudioPlayerOpen}
          onClose={handleCloseAudioPlayer}
        />
      )}
    </div>
  );
};

export default Songs;