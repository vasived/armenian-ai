import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Play, Pause, Send, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  show: boolean;
  onClose: () => void;
  onSendVoiceMessage: (audioBlob: Blob, duration: number, transcript?: string) => void;
}

export const VoiceRecorder = ({ show, onClose, onSendVoiceMessage }: VoiceRecorderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check microphone permission
  useEffect(() => {
    const checkPermission = async () => {
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
    
    if (show) {
      checkPermission();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
      handleStop();
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // You could detect Armenian if supported

      recognition.onstart = () => {
        setIsTranscribing(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    const stream = await requestMicrophoneAccess();
    if (!stream) return;

    try {
      const options = {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        setAudioBlob(audioBlob);

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Stop speech recognition
        stopSpeechRecognition();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscript('');

      // Start speech recognition
      startSpeechRecognition();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        startSpeechRecognition();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        stopSpeechRecognition();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleStop = () => {
    if (isRecording) {
      stopRecording();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const playAudio = () => {
    if (audioUrl && !isPlaying) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioUrl);
        audioElementRef.current.onended = () => setIsPlaying(false);
      }
      audioElementRef.current.play();
      setIsPlaying(true);
    } else if (audioElementRef.current && isPlaying) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setRecordingTime(0);
    setError(null);
    setTranscript('');
    stopSpeechRecognition();
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, recordingTime, transcript.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      discardRecording();
      setError(null);
      setHasPermission(null);
      stopSpeechRecognition();
    }, 300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-[100] pointer-events-none">
      <Card className={cn(
        "p-4 sm:p-6 w-full sm:max-w-sm pointer-events-auto",
        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
        "border-blue-200 dark:border-blue-800",
        "shadow-xl shadow-blue-500/10",
        "transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"
            )}>
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Voice Message
              </h3>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {isRecording ? (isPaused ? 'Paused' : 'Recording') : audioBlob ? 'Ready to send' : 'Ready to record'}
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

        {/* Timer and Transcript */}
        {(isRecording || audioBlob) && (
          <div className="text-center mb-4">
            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100">
              {formatTime(recordingTime)}
            </div>
            {transcript && (
              <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg text-xs text-gray-600 dark:text-gray-400 max-h-16 overflow-y-auto">
                <span className="font-medium">Transcript:</span> {transcript}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Permission Check */}
        {hasPermission === false && !error && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-400 text-sm">
              Microphone access is required to record voice messages.
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              disabled={hasPermission === false}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="flex gap-2">
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {isPaused ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                size="lg"
              >
                Stop
              </Button>
            </div>
          )}

          {audioBlob && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  onClick={discardRecording}
                  variant="outline"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={sendVoiceMessage}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Voice Message
              </Button>
            </div>
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && !isPaused && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Recording...
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};
