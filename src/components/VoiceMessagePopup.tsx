import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, X, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMessagePopupProps {
  show: boolean;
  onClose: () => void;
}

export const VoiceMessagePopup = ({ show, onClose }: VoiceMessagePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for exit animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
      <Card className={cn(
        "p-6 max-w-sm pointer-events-auto",
        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
        "border-blue-200 dark:border-blue-800",
        "shadow-xl shadow-blue-500/10",
        "transition-all duration-300 ease-out",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-4 opacity-0 scale-95"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Mic className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Voice Messages
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Coming Soon
                </span>
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

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We're working on bringing you voice message support to make conversations with HagopAI even more natural!
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Soon you'll be able to speak in Armenian or English!
            </span>
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all ease-linear",
              isVisible ? "w-0" : "w-full"
            )}
            style={{ 
              transitionDuration: isVisible ? '4000ms' : '0ms',
              width: isVisible ? '100%' : '0%'
            }}
          />
        </div>
      </Card>
    </div>
  );
};
