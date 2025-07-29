import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TTSService, TTSOptions } from "@/lib/tts";
import { useNotifications } from "@/components/NotificationSystem";
import { getUserPreferences } from "@/lib/userContext";
import OpenAI from 'openai';

interface LiveVoiceChatProps {
  show: boolean;
  onClose: () => void;
  onConversation?: (userText: string, aiResponse: string) => void;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

export const LiveVoiceChat = ({ show, onClose, onConversation }: LiveVoiceChatProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [state, setState] = useState<ConversationState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const voiceActivityRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const userPrefs = getUserPreferences();
  const notifications = useNotifications();

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Initialize component visibility
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
      checkMicrophonePermission();
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
      stopListening();
    }
  }, [show]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopListening();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(permission.state === 'granted');
        
        permission.addEventListener('change', () => {
          setHasPermission(permission.state === 'granted');
        });
      }
    } catch (err) {
      console.warn('Permission API not supported');
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;
      setHasPermission(true);
      return stream;
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please try again.');
      }
      return null;
    }
  };

  const startListening = useCallback(async () => {
    if (state !== 'idle' || isProcessingRef.current) return;

    if (!streamRef.current) {
      const stream = await requestMicrophoneAccess();
      if (!stream) return;
    }

    // Set up voice activity detection
    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start monitoring voice activity
      monitorVoiceActivity();
    } catch (err) {
      console.warn('Voice activity detection not available:', err);
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (mountedRef.current) {
          setState('listening');
          setCurrentTranscript('');
          setError(null);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (mountedRef.current) {
          setCurrentTranscript(finalTranscript + interimTranscript);
          
          if (finalTranscript.trim()) {
          // Reset silence timer on final transcript
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Set timer to process after silence (longer delay for better accuracy)
          silenceTimerRef.current = setTimeout(() => {
            if (mountedRef.current && finalTranscript.trim() && !voiceActivityRef.current && state === 'listening') {
              processUserInput(finalTranscript.trim());
            }
          }, 3000); // Process after 3 seconds of silence and no voice activity
        }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (mountedRef.current) {
          if (event.error === 'no-speech') {
            // Restart listening if no speech detected
            setTimeout(() => {
              if (mountedRef.current && state === 'listening') {
                recognition.start();
              }
            }, 1000);
          } else {
            setError(`Speech recognition error: ${event.error}`);
            setState('idle');
          }
        }
      };

      recognition.onend = () => {
        if (mountedRef.current && state === 'listening') {
          // Restart listening automatically
          setTimeout(() => {
            if (mountedRef.current && state === 'listening') {
              recognition.start();
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      setError('Speech recognition not supported in this browser.');
    }
  }, [state]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    voiceActivityRef.current = false;
    if (mountedRef.current) {
      setState('idle');
      setCurrentTranscript('');
    }
  }, []);

  const processUserInput = useCallback(async (userText: string) => {
    if (isProcessingRef.current || !mountedRef.current) return;
    
    isProcessingRef.current = true;
    
    try {
      setState('processing');
      setCurrentTranscript(userText);
      
      // Stop current speech if playing
      TTSService.stopCurrentSpeech();

      // Add user message to history
      const newHistory = [...conversationHistory, { role: 'user' as const, content: userText }];
      setConversationHistory(newHistory);

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are HagopAI, a friendly Armenian AI assistant. Keep responses conversational and brief for voice chat (1-3 sentences max). Use the user's preferences: ${JSON.stringify(userPrefs)}`
          },
          ...newHistory
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
      
      if (mountedRef.current) {
        setLastAIResponse(aiResponse);
        setConversationHistory([...newHistory, { role: 'assistant', content: aiResponse }]);
        
        // Callback for conversation logging
        onConversation?.(userText, aiResponse);

        // Speak AI response
        setState('speaking');
        
        const audio = await TTSService.speak(aiResponse, { 
          voice: userPrefs.ttsVoice || 'alloy', 
          speed: userPrefs.ttsSpeed || 1.0 
        });
        
        audio.addEventListener('ended', () => {
          if (mountedRef.current) {
            setState('idle');
            setLastAIResponse('');
            // Don't auto-restart listening to prevent AI from talking to itself
            // User needs to manually start conversation again
          }
        });
        
        await audio.play();
      }
    } catch (error: any) {
      console.error('Failed to process conversation:', error);
      if (mountedRef.current) {
        setError(error.message || 'Failed to process conversation');
        setState('idle');
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [conversationHistory, userPrefs, onConversation, show, startListening]);

  const toggleConversation = useCallback(() => {
    if (state === 'idle') {
      startListening();
    } else {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  const monitorVoiceActivity = useCallback(() => {
    if (!analyserRef.current || !mountedRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkActivity = () => {
      if (!analyserRef.current || !mountedRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const threshold = 20; // Adjust this value to fine-tune sensitivity

      const hasVoiceActivity = average > threshold;

      if (hasVoiceActivity !== voiceActivityRef.current) {
        voiceActivityRef.current = hasVoiceActivity;

        if (hasVoiceActivity && state === 'listening') {
          // Reset silence timer when voice activity is detected
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      }

      if (state === 'listening') {
        requestAnimationFrame(checkActivity);
      }
    };

    checkActivity();
  }, [state]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      stopListening();
      setConversationHistory([]);
      setError(null);
      setHasPermission(null);
    }, 300);
  };

  if (!shouldRender) return null;

  const getStateDisplay = () => {
    switch (state) {
      case 'listening':
        return { text: 'Listening...', color: 'text-green-600 dark:text-green-400' };
      case 'processing':
        return { text: 'Thinking...', color: 'text-blue-600 dark:text-blue-400' };
      case 'speaking':
        return { text: 'Speaking...', color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { text: 'Ready to chat', color: 'text-muted-foreground' };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-[100] pointer-events-none">
      <Card className={cn(
        "p-4 sm:p-6 w-full sm:max-w-md pointer-events-auto",
        "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30",
        "border-purple-200 dark:border-purple-800",
        "shadow-xl shadow-purple-500/10",
        "transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              state === 'listening' ? "bg-green-500 animate-pulse" :
              state === 'processing' ? "bg-blue-500 animate-pulse" :
              state === 'speaking' ? "bg-purple-500 animate-pulse" :
              "bg-gray-500"
            )}>
              {state === 'processing' ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : state === 'speaking' ? (
                <Volume2 className="h-5 w-5 text-white" />
              ) : (
                <MessageCircle className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Live Voice Chat
              </h3>
              <div className={cn("text-xs font-medium", stateDisplay.color)}>
                {stateDisplay.text}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current transcript or AI response */}
        {(currentTranscript || lastAIResponse) && (
          <div className="mb-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {lastAIResponse ? 'AI:' : 'You:'}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {lastAIResponse || currentTranscript}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Permission Check */}
        {hasPermission === false && !error && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-400 text-sm">
              Microphone access is required for live voice chat.
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          <Button
            onClick={toggleConversation}
            disabled={hasPermission === false || !!error}
            className={cn(
              "w-full text-white transition-all duration-200",
              state === 'idle' ? "bg-green-500 hover:bg-green-600" :
              state === 'listening' ? "bg-red-500 hover:bg-red-600" :
              "bg-gray-500 cursor-not-allowed"
            )}
            size="lg"
          >
            {state === 'listening' ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : state === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : state === 'speaking' ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                AI Speaking...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Conversation
              </>
            )}
          </Button>

          {conversationHistory.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setConversationHistory([])}
              className="w-full"
              size="sm"
            >
              Clear History ({conversationHistory.length / 2} exchanges)
            </Button>
          )}
        </div>

        {/* Conversation indicator */}
        {state === 'listening' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Listening for your voice...
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};
