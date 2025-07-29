import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Volume2, VolumeX, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { TTSService, TTSOptions } from "@/lib/tts";
import { useNotifications } from "@/components/NotificationSystem";

interface TTSControlsProps {
  text: string;
  isUser: boolean;
  className?: string;
}

export const TTSControls = ({ text, isUser, className }: TTSControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [voice, setVoice] = useState<TTSOptions['voice']>('alloy');
  const [speed, setSpeed] = useState<number>(1.0);
  const notifications = useNotifications();

  useEffect(() => {
    // Check if this audio is currently playing
    const currentAudio = TTSService.getCurrentAudio();
    setIsPlaying(currentAudio === audioElement && TTSService.isCurrentlyPlaying());

    // Clean up when component unmounts
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleAudioEnd);
        audioElement.removeEventListener('error', handleAudioError);
      }
    };
  }, [audioElement]);

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setAudioElement(null);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setIsLoading(false);
    setAudioElement(null);
    notifications.error(
      "Playback Error",
      "Failed to play audio. Please try again."
    );
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      // Stop current playback
      TTSService.stopCurrentSpeech();
      setIsPlaying(false);
      setAudioElement(null);
      return;
    }

    try {
      setIsLoading(true);
      
      const audio = await TTSService.speak(text, { voice, speed });
      setAudioElement(audio);
      
      // Set up event listeners
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioError);
      
      // Play the audio
      await audio.play();
      setIsPlaying(true);
      
    } catch (error: any) {
      console.error('TTS failed:', error);
      notifications.error(
        "Speech Generation Failed",
        error.message || "Unable to generate speech. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const voices = TTSService.getAvailableVoices();
  const speedOptions = [
    { value: 0.5, label: '0.5×' },
    { value: 0.75, label: '0.75×' },
    { value: 1.0, label: '1×' },
    { value: 1.25, label: '1.25×' },
    { value: 1.5, label: '1.5×' },
    { value: 2.0, label: '2×' }
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Main Speak Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSpeak}
        disabled={isLoading}
        className={cn(
          "h-7 w-7 p-0 transition-all duration-200",
          "opacity-0 group-hover:opacity-100 group-hover:scale-110",
          isUser
            ? "hover:bg-white/20 text-white/70 hover:text-white"
            : "hover:bg-accent hover:shadow-md",
          (isPlaying || isLoading) && "opacity-100 scale-105"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Voice Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              isUser
                ? "hover:bg-white/20 text-white/70 hover:text-white"
                : "hover:bg-accent hover:shadow-md"
            )}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Voice</div>
            {voices.map((voiceOption) => (
              <DropdownMenuItem
                key={voiceOption.value}
                onClick={() => setVoice(voiceOption.value as TTSOptions['voice'])}
                className={cn(
                  "text-sm cursor-pointer",
                  voice === voiceOption.value && "bg-accent font-semibold"
                )}
              >
                <div>
                  <div>{voiceOption.label}</div>
                  <div className="text-xs text-muted-foreground">{voiceOption.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
            
            <div className="border-t mt-2 pt-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">Speed</div>
              <div className="flex flex-wrap gap-1">
                {speedOptions.map((speedOption) => (
                  <button
                    key={speedOption.value}
                    onClick={() => setSpeed(speedOption.value)}
                    className={cn(
                      "px-2 py-1 text-xs rounded border hover:bg-accent transition-colors",
                      speed === speedOption.value 
                        ? "bg-accent font-semibold border-accent-foreground" 
                        : "border-border"
                    )}
                  >
                    {speedOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
