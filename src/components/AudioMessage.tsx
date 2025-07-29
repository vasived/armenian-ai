import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, Pause, Download, Mic, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioMessageProps {
  audioUrl: string;
  duration: number;
  isUser: boolean;
  className?: string;
}

export const AudioMessage = ({ audioUrl, duration, isUser, className }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedData = () => setIsLoaded(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    // Set initial playback rate
    audio.playbackRate = playbackSpeed;
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current || !isLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const speedOptions = [
    { value: 0.5, label: '0.5×' },
    { value: 0.75, label: '0.75×' },
    { value: 1, label: '1×' },
    { value: 1.25, label: '1.25×' },
    { value: 1.5, label: '1.5×' },
    { value: 2, label: '2×' }
  ];

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-message-${Date.now()}.webm`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Voice Message Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "p-1.5 rounded-full",
          isUser 
            ? "bg-white/20" 
            : "bg-primary/20"
        )}>
          <Mic className={cn(
            "h-3 w-3",
            isUser ? "text-white/80" : "text-primary"
          )} />
        </div>
        <span className={cn(
          "text-xs font-medium",
          isUser ? "text-white/80" : "text-muted-foreground"
        )}>
          Voice Message
        </span>
      </div>

      {/* Audio Player */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        isUser 
          ? "bg-white/10 border border-white/20" 
          : "bg-muted/50 border border-border/30"
      )}>
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={!isLoaded}
          size="sm"
          variant="ghost"
          className={cn(
            "h-10 w-10 rounded-full flex-shrink-0 transition-all duration-200",
            isUser 
              ? "hover:bg-white/20 text-white/90 hover:text-white border border-white/30" 
              : "hover:bg-primary/10 text-primary border border-primary/30",
            isPlaying && "scale-105"
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Waveform and Progress */}
        <div className="flex-1 min-w-0">
          {/* Waveform Visual */}
          <div className="flex items-center justify-center gap-1 mb-2 h-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all duration-200",
                  isUser ? "bg-white/40" : "bg-primary/40"
                )}
                style={{
                  height: `${Math.random() * 16 + 8}px`,
                  opacity: progress > (i * 5) ? 0.8 : 0.3,
                  backgroundColor: progress > (i * 5) 
                    ? isUser ? "rgba(255,255,255,0.8)" : "hsl(var(--primary))" 
                    : undefined
                }}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className={cn(
            "w-full h-1 rounded-full overflow-hidden",
            isUser ? "bg-white/20" : "bg-primary/20"
          )}>
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-200",
                isUser ? "bg-white/80" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex items-center justify-between mt-1">
            <span className={cn(
              "text-xs font-mono",
              isUser ? "text-white/70" : "text-muted-foreground"
            )}>
              {formatTime(currentTime)}
            </span>
            <div className="flex items-center gap-2">
              {playbackSpeed !== 1 && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full",
                  isUser
                    ? "bg-white/20 text-white/80"
                    : "bg-primary/20 text-primary"
                )}>
                  {playbackSpeed}×
                </span>
              )}
              <span className={cn(
                "text-xs font-mono",
                isUser ? "text-white/70" : "text-muted-foreground"
              )}>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Speed Control */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 flex-shrink-0 opacity-60 hover:opacity-100 transition-all duration-200",
                isUser
                  ? "hover:bg-white/20 text-white/70 hover:text-white"
                  : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
              )}
            >
              <Gauge className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20">
            {speedOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => changePlaybackSpeed(option.value)}
                className={cn(
                  "justify-center text-sm",
                  playbackSpeed === option.value && "bg-accent font-semibold"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Download Button */}
        <Button
          onClick={downloadAudio}
          size="sm"
          variant="ghost"
          className={cn(
            "h-8 w-8 flex-shrink-0 opacity-60 hover:opacity-100 transition-all duration-200",
            isUser
              ? "hover:bg-white/20 text-white/70 hover:text-white"
              : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
          )}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className={cn(
          "flex items-center justify-center py-2 text-xs",
          isUser ? "text-white/60" : "text-muted-foreground"
        )}>
          Loading audio...
        </div>
      )}
    </div>
  );
};
