import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  show: {
    id: string;
    title: string;
    description: string;
    type: 'tv_show' | 'movie';
    duration_minutes: number;
    trailer_url?: string;
    video_url?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ show, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  // Track progress when video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progressPercentage = (video.currentTime / video.duration) * 100;
      setProgress(progressPercentage);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Save progress to database
  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progressPercentage = Math.round((currentTime / duration) * 100);
      
      await supabase
        .from('user_show_progress')
        .upsert({
          user_id: user.id,
          show_id: show.id,
          progress_percentage: progressPercentage,
          last_watched_at: new Date().toISOString(),
          completed: progressPercentage >= 90
        }, {
          onConflict: 'user_id,show_id'
        });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        saveProgress();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, show.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (value[0] / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      saveProgress();
    }
    setIsPlaying(false);
    onClose();
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&cc_load_policy=1&cc_lang_pref=en`;
    }
    return url;
  };

  const videoUrl = show.video_url || show.trailer_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-0 bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Watching {show.title}</DialogTitle>
        </DialogHeader>
        
        <div 
          className="relative w-full h-full group cursor-pointer"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Element or YouTube Embed */}
          {isYouTube ? (
            <iframe
              className="w-full h-full"
              src={getEmbedUrl(videoUrl)}
              title={show.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              src={videoUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                saveProgress();
                toast({
                  title: "Episode Complete!",
                  description: "Your progress has been saved.",
                });
              }}
              onClick={togglePlay}
            />
          )}

          {/* Controls Overlay - Only show for non-YouTube videos */}
          {!isYouTube && (
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">{show.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Center play button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              )}

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(-10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Volume controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                          setIsFullscreen(false);
                        } else {
                          videoRef.current?.requestFullscreen();
                          setIsFullscreen(true);
                        }
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;