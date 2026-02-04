'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  SkipBack, 
  SkipForward, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
  startAt?: number;
  className?: string;
}

export function VideoPlayer({
  src,
  title,
  onProgress,
  onComplete,
  startAt = 0,
  className
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(startAt);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, playing]);

  // Sauvegarder la position toutes les 5 secondes pendant la lecture
  useEffect(() => {
    if (playing && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentSeconds = playerRef.current.getCurrentTime();
          onProgress(currentSeconds);
        }
      }, 5000); // Sauvegarder toutes les 5 secondes

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [playing, onProgress]);

  const handlePlay = () => setPlaying(!playing);
  const handleMute = () => setMuted(!muted);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgress = (state: { 
    played: number; 
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      
      // Appeler onProgress pour les mises à jour en temps réel
      if (onProgress) {
        onProgress(state.playedSeconds);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const newPlayed = value[0];
    setPlayed(newPlayed);
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(newPlayed);
      const newTime = newPlayed * duration;
      setCurrentTime(newTime);
      // Sauvegarder immédiatement après un seek
      if (onProgress) {
        onProgress(newTime);
      }
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onComplete) {
      onComplete();
    }
    // Sauvegarder la position finale
    if (onProgress) {
      onProgress(duration);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handleSkipBack = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      playerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  // Sauvegarder la position avant de quitter
  useEffect(() => {
    return () => {
      if (onProgress && currentTime > 0) {
        onProgress(currentTime);
      }
    };
  }, [currentTime, onProgress]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => {
        setShowControls(true);
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={src}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        progressInterval={100}
      />

      {/* Custom Controls */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          {title && (
            <div className="text-white font-medium drop-shadow-lg">
              {title}
            </div>
          )}
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            onClick={handlePlay}
          >
            {playing ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <Slider
              value={[played]}
              min={0}
              max={0.999999}
              step={0.001}
              onValueChange={handleSeek}
              onPointerDown={handleSeekMouseDown}
              className="flex-1"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handlePlay}
              >
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleSkipBack}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleSkipForward}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleMute}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleSpeedChange}
              >
                <Settings className="h-4 w-4 mr-1" />
                {playbackRate}x
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Speed and Quality Indicators */}
      <div className="absolute top-4 right-4 flex gap-2">
        {playbackRate !== 1 && (
          <div className="rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            {playbackRate}x
          </div>
        )}
      </div>

      {/* Buffering Indicator */}
      {playing && !playerRef.current?.props.playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Chargement...</div>
        </div>
      )}
    </div>
  );
}
