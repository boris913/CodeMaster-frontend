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
  Settings,
  Monitor,
  Clock
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
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handlePlay = () => setPlaying(!playing);
  const handleMute = () => setMuted(!muted);
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
    setCurrentTime(state.playedSeconds);
    onProgress?.(state.playedSeconds);
  };

  const handleSeek = (value: number[]) => {
    const newPlayed = value[0];
    setPlayed(newPlayed);
    if (playerRef.current) {
      playerRef.current.seekTo(newPlayed);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    onComplete?.();
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
      playerRef.current.seekTo(Math.max(0, currentTime - 10));
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(Math.min(duration, currentTime + 10));
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn('relative aspect-video bg-black rounded-lg overflow-hidden group', className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseMove={() => {
        setShowControls(true);
      }}
    >
      <ReactPlayer
        ref={playerRef}
        url={src}
        playing={playing}
        muted={muted}
        volume={volume}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        config={{
          youtube: {
            playerVars: { showinfo: 0, controls: 0 }
          },
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />

      {/* Custom Controls */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          {title && (
            <div className="text-white font-medium truncate">{title}</div>
          )}
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            onClick={handlePlay}
          >
            {playing ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[played]}
              min={0}
              max={1}
              step={0.001}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
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
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleSkipBack}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleSkipForward}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
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
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleSpeedChange}
              >
                <span className="text-sm font-medium">{playbackRate}x</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Speed and Quality Indicators */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {playbackRate !== 1 && (
            <div className="px-2 py-1 rounded bg-black/50 text-white text-sm">
              {playbackRate}x
            </div>
          )}
          <div className="px-2 py-1 rounded bg-black/50 text-white text-sm flex items-center gap-1">
            <Monitor className="h-3 w-3" />
            1080p
          </div>
        </div>

        {/* Buffering Indicator */}
        {playing && !playerRef.current?.props.playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">Chargement...</div>
          </div>
        )}
      </div>
    </div>
  );
}