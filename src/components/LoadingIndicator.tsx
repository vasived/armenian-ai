import { Sparkles } from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md">
          <ArmenianIcon className="h-6 w-6 text-white animate-pulse" />
        </div>

        {/* Message Content */}
        <div className="relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm bg-card border border-border/20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">
                HagopAI is thinking...
              </span>
            </div>
            
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gradient-armenian rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gradient-armenian rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gradient-armenian rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Message Tail */}
          <div className="absolute top-4 -left-1.5 w-3 h-3 bg-card border-l border-t border-border/20 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};
