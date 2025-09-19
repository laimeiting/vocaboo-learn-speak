import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LyricsLine {
  id: string;
  line_number: number;
  start_time_seconds: number;
  end_time_seconds: number;
  text: string;
}

interface AudioPlayerProps {
  song: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    lyrics?: string;
    audio_url?: string;
    vocabulary_words?: string[];
    subtitle_languages: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ song, isOpen, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [lyricsLines, setLyricsLines] = useState<LyricsLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const { toast } = useToast();

  // Fetch synchronized lyrics
  useEffect(() => {
    const fetchLyricsLines = async () => {
      try {
        const { data, error } = await supabase
          .from('lyrics_lines')
          .select('*')
          .eq('song_id', song.id)
          .order('line_number');

        if (error) throw error;
        setLyricsLines(data || []);
      } catch (error) {
        console.error('Error fetching lyrics lines:', error);
      }
    };

    if (song.id && isOpen) {
      fetchLyricsLines();
    }
  }, [song.id, isOpen]);

  // Update current lyrics line based on time
  useEffect(() => {
    const currentLine = lyricsLines.findIndex(line => 
      currentTime >= line.start_time_seconds && currentTime <= line.end_time_seconds
    );
    setCurrentLineIndex(currentLine);
  }, [currentTime, lyricsLines]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio file.",
        variant: "destructive",
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = (value[0] / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    onClose();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Use a simple audio beep as fallback if no audio_url provided
  const audioUrl = song.audio_url || 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjaL1fLNeSsFJHfH8N2QQAoUXrTp66hVFA==';

  // Split lyrics into lines for display
  const lyricsDisplayLines = song.lyrics ? song.lyrics.split('\n').filter(line => line.trim()) : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Playing {song.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Left side - Audio controls */}
          <div className="w-1/2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{song.title}</h2>
                <p className="text-lg text-muted-foreground">{song.artist}</p>
                {song.album && (
                  <p className="text-sm text-muted-foreground">{song.album}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Audio element */}
            <audio ref={audioRef} src={audioUrl} />

            {/* Progress bar */}
            <div className="mb-6">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => skip(-10)}>
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => skip(10)}>
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            {/* Volume controls */}
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            {/* Vocabulary words */}
            {song.vocabulary_words && song.vocabulary_words.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Vocabulary</h3>
                <div className="flex flex-wrap gap-2">
                  {song.vocabulary_words.map((word) => (
                    <Badge key={word} variant="secondary">{word}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Lyrics */}
          <div className="w-1/2 border-l bg-muted/20 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lyrics</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLyrics(!showLyrics)}
                >
                  <Subtitles className="w-4 h-4" />
                </Button>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {song.subtitle_languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showLyrics && (
              <div className="flex-1 overflow-y-auto">
                {lyricsLines.length > 0 ? (
                  // Synchronized lyrics
                  <div className="space-y-2">
                    {lyricsLines.map((line, index) => (
                      <p
                        key={line.id}
                        className={`text-lg leading-relaxed transition-colors duration-300 ${
                          index === currentLineIndex
                            ? 'text-primary font-semibold bg-primary/10 px-2 py-1 rounded'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  // Static lyrics
                  <div className="space-y-2">
                    {lyricsDisplayLines.map((line, index) => (
                      <p key={index} className="text-lg leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                
                {!song.lyrics && lyricsLines.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No lyrics available for this song.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AudioPlayer;