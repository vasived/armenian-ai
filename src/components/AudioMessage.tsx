import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download } from "lucide-react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedData = () => setIsLoaded(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
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
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

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
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border max-w-xs",
      isUser 
        ? "bg-chat-user border-chat-user/20" 
        : "bg-chat-ai border-chat-ai/20",
      className
    )}>
      <Button
        onClick={togglePlayback}
        disabled={!isLoaded}
        size="sm"
        variant="ghost"
        className={cn(
          "h-10 w-10 rounded-full flex-shrink-0",
          isUser ? "hover:bg-white/10" : "hover:bg-black/10"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium opacity-70">
            Voice Message
          </span>
          <span className="text-xs opacity-60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-200",
              isUser ? "bg-white/70" : "bg-primary/70"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button
        onClick={downloadAudio}
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 flex-shrink-0",
          isUser ? "hover:bg-white/10" : "hover:bg-black/10"
        )}
      >
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
};
