import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InteractiveText from '@/components/InteractiveText';

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
  const playRetryRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [lyricsLines, setLyricsLines] = useState<LyricsLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  // Track lyrics in local state to trigger renders when fetched
  const [lyricsText, setLyricsText] = useState<string | null>(song.lyrics ?? null);
  // Reset lyrics when song changes
  useEffect(() => {
    setLyricsText(song.lyrics ?? null);
  }, [song.id]);

  const handleSaveWord = (word: string) => {
    setSavedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  // Fetch audio and lyrics from API or use existing
  useEffect(() => {
    const fetchAudioAndLyrics = async () => {
      if (!isOpen) return;
      
      // If song already has an audio URL, use it directly
      if (song.audio_url) {
        console.log('Using existing audio URL:', song.audio_url);
        setAudioUrl(song.audio_url);
      } else {
        setIsLoadingAudio(true);
        try {
          const { data, error } = await supabase.functions.invoke('fetch-song-audio', {
            body: { title: song.title, artist: song.artist }
          });

          if (error) throw error;

          if (data?.audio_url) {
            console.log('Fetched audio URL:', data.audio_url);
            setAudioUrl(data.audio_url);
            if (data.matched === false) {
              toast({
                title: "Found a similar track",
                description: `${data.title} — ${data.artist}`,
              });
            }
          } else {
            toast({
              title: "Audio Not Found",
              description: "Could not find audio for this song.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error fetching audio:', error);
          toast({
            title: "Error",
            description: "Failed to load audio from API.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingAudio(false);
        }
      }
      
      // Fetch lyrics if not present
      if (!lyricsText) {
        try {
          console.log('Fetching lyrics for:', song.title, '-', song.artist);
          const { data, error } = await supabase.functions.invoke('fetch-lyrics', {
            body: { artist: song.artist, title: song.title }
          });

          if (error) throw error;
          
          if (data?.lyrics) {
            console.log('Lyrics fetched successfully');
            setLyricsText(data.lyrics);
          } else {
            console.log('No lyrics found for this song');
            toast({
              title: 'No lyrics found',
              description: 'We could not find lyrics for this track.',
            });
          }
        } catch (error) {
          console.error('Error fetching lyrics:', error);
        }
      }
    };

    fetchAudioAndLyrics();
  }, [song.id, song.audio_url, isOpen, song.title, song.artist, toast]);

  // Fetch synchronized lyrics or generate fallback timestamps
  useEffect(() => {
    const fetchLyricsLines = async () => {
      // Only fetch lyrics if song ID is a valid UUID (from database)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(song.id);
      
      if (isUUID) {
        try {
          const { data, error } = await supabase
            .from('lyrics_lines')
            .select('*')
            .eq('song_id', song.id)
            .order('line_number');

          if (error) throw error;
          
          if (data && data.length > 0) {
            setLyricsLines(data);
            return;
          }
        } catch (error) {
          console.error('Error fetching lyrics lines:', error);
        }
      }
      
      // Generate fallback timestamps for songs with plain text lyrics
      if (lyricsText && duration > 0) {
        const lines = lyricsText.split('\n').filter(line => line.trim());
        const timePerLine = lines.length > 0 ? duration / lines.length : 0;
        
        const syntheticLines: LyricsLine[] = lines.map((text, index) => ({
          id: `synthetic-${index}`,
          line_number: index,
          start_time_seconds: index * timePerLine,
          end_time_seconds: (index + 1) * timePerLine,
          text: text.trim()
        }));
        
        console.log('Generated synthetic lyrics lines:', syntheticLines.length);
        setLyricsLines(syntheticLines);
      } else {
        setLyricsLines([]);
      }
    };

    if (song.id && isOpen) {
      fetchLyricsLines();
    }
  }, [song.id, lyricsText, isOpen, duration]);

  // Update current lyrics line based on time
  useEffect(() => {
    const currentLine = lyricsLines.findIndex(line => 
      currentTime >= line.start_time_seconds && currentTime <= line.end_time_seconds
    );
    setCurrentLineIndex(currentLine);
  }, [currentTime, lyricsLines]);

  // Load audio when URL is available
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    console.log('Setting audio source:', audioUrl);
    audio.src = audioUrl;
    audio.load();
  }, [audioUrl]);

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
      console.error('Audio loading error:', e);
      console.error('Failed to load:', audio.src);
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Failed to load audio file. Please check the file path.",
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
  }, [toast]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
              // If play() was interrupted by a load/pause, retry once shortly after
              if ((error as any)?.name === 'AbortError' && !playRetryRef.current) {
                playRetryRef.current = true;
                setTimeout(() => {
                  audio.play()
                    .then(() => {
                      setIsPlaying(true);
                      playRetryRef.current = false;
                    })
                    .catch((e2) => {
                      console.error('Retry play failed:', e2);
                      setIsPlaying(false);
                      toast({
                        title: "Playback Error",
                        description: "Unable to play audio. The file may not exist.",
                        variant: "destructive",
                      });
                      playRetryRef.current = false;
                    });
                }, 120);
                return;
              }
              setIsPlaying(false);
              toast({
                title: "Playback Error",
                description: "Unable to play audio. The file may not exist.",
                variant: "destructive",
              });
            });
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setIsPlaying(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Playing {song.title}</DialogTitle>
          <DialogDescription>Audio player modal</DialogDescription>
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
                {isLoadingAudio && (
                  <p className="text-sm text-muted-foreground mt-2">Loading audio...</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Audio element */}
            <audio ref={audioRef} preload="metadata" playsInline crossOrigin="anonymous">
              Your browser does not support the audio element.
            </audio>

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
                disabled={!audioUrl || isLoadingAudio}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
              <div className="flex-1 overflow-y-auto space-y-2">
                {lyricsLines.length > 0 ? (
                  lyricsLines.map((line, index) => (
                    <div
                      key={line.id}
                      className={`p-2 rounded transition-all duration-300 ${
                        index === currentLineIndex
                          ? 'bg-primary/20 font-semibold scale-105'
                          : 'opacity-60'
                      }`}
                    >
                      <InteractiveText
                        content={line.text}
                        words={{}}
                        savedWords={savedWords}
                        onSaveWord={handleSaveWord}
                      />
                    </div>
                  ))
                ) : lyricsText ? (
                  <InteractiveText
                    content={lyricsText}
                    words={{}}
                    savedWords={savedWords}
                    onSaveWord={handleSaveWord}
                  />
                ) : (
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