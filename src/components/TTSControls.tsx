import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Volume2, VolumeX, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { TTSService, TTSOptions } from "@/lib/tts";
import { useNotifications } from "@/components/NotificationSystem";
import { getUserPreferences, saveUserPreferences } from "@/lib/userContext";

interface TTSControlsProps {
  text: string;
  isUser: boolean;
  autoSpeak?: boolean;
  className?: string;
}

export const TTSControls = ({ text, isUser, autoSpeak = false, className }: TTSControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const userPrefs = getUserPreferences();
  const [voice, setVoice] = useState<TTSOptions['voice']>(userPrefs.ttsVoice || 'alloy');
  const [speed, setSpeed] = useState<number>(userPrefs.ttsSpeed || 1.0);
  const notifications = useNotifications();

  // Refs to track state and prevent race conditions
  const hasAutoSpokenRef = useRef(false);
  const textRef = useRef(text);
  const mountedRef = useRef(true);

  // Check if text has changed (new message)
  useEffect(() => {
    if (textRef.current !== text) {
      textRef.current = text;
      hasAutoSpokenRef.current = false;
    }
  }, [text]);

  // Handle auto-speak for new AI messages only
  useEffect(() => {
    if (
      autoSpeak &&
      userPrefs.ttsAutoSpeak &&
      userPrefs.ttsEnabled &&
      !isUser &&
      text.trim() &&
      !hasAutoSpokenRef.current &&
      mountedRef.current
    ) {
      hasAutoSpokenRef.current = true;
      // Small delay to ensure UI is ready and prevent race conditions
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          handleSpeak();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoSpeak, userPrefs.ttsAutoSpeak, userPrefs.ttsEnabled, isUser, text]);

  // Track current audio state with proper cleanup
  useEffect(() => {
    const currentAudio = TTSService.getCurrentAudio();
    const isCurrentlyPlaying = TTSService.isCurrentlyPlaying();
    const isMyAudio = currentAudio === audioElement;

    setIsPlaying(isMyAudio && isCurrentlyPlaying);

    // Clear loading state if audio stopped playing or switched to another audio
    if ((!isCurrentlyPlaying || !isMyAudio) && isLoading) {
      setIsLoading(false);
    }

    // If another audio is playing, stop our audio
    if (currentAudio && !isMyAudio && audioElement) {
      setAudioElement(null);
      setIsPlaying(false);
    }
  }, [audioElement, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (audioElement) {
        audioElement.removeEventListener('ended', handleAudioEnd);
        audioElement.removeEventListener('error', handleAudioError);
      }
    };
  }, [audioElement]);

  const handleAudioEnd = useCallback(() => {
    if (mountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
      setAudioElement(null);
    }
  }, []);

  const handleAudioError = useCallback((error?: any) => {
    if (mountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
      setAudioElement(null);
      console.error('Audio playback error:', error);
      notifications.error(
        "Playback Error",
        "Failed to play audio. Please try again."
      );
    }
  }, [notifications]);

  const handleSpeak = useCallback(async () => {
    if (!mountedRef.current) return;

    if (isPlaying) {
      // Stop current playback
      TTSService.stopCurrentSpeech();
      if (mountedRef.current) {
        setIsPlaying(false);
        setAudioElement(null);
      }
      return;
    }

    // Prevent multiple simultaneous TTS calls
    if (isLoading) return;

    try {
      if (mountedRef.current) {
        setIsLoading(true);
      }

      const audio = await TTSService.speak(text, { voice, speed });

      if (!mountedRef.current) {
        // Component unmounted, clean up
        audio.pause();
        return;
      }

      setAudioElement(audio);

      // Set up event listeners
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', (e) => handleAudioError(e));

      // Update state before playing
      if (mountedRef.current) {
        setIsLoading(false);
        setIsPlaying(true);
      }

      // Play the audio
      await audio.play();

    } catch (error: any) {
      console.error('TTS failed:', error);

      if (!mountedRef.current) return;

      if (error.message.includes('API key')) {
        notifications.error(
          "OpenAI API Key Required",
          "Text-to-speech requires a valid OpenAI API key. Please configure VITE_OPENAI_API_KEY in your environment variables.",
          { duration: 8000 }
        );
      } else {
        notifications.error(
          "Speech Generation Failed",
          error.message || "Unable to generate speech. Please try again."
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isPlaying, isLoading, text, voice, speed, handleAudioEnd, handleAudioError, notifications]);

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
                onClick={() => {
                  const newVoice = voiceOption.value as TTSOptions['voice'];
                  setVoice(newVoice);
                  saveUserPreferences({ ttsVoice: newVoice });
                }}
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
                    onClick={() => {
                      setSpeed(speedOption.value);
                      saveUserPreferences({ ttsSpeed: speedOption.value });
                    }}
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
