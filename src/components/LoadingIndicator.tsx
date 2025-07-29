import { Sparkles } from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";

export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start animate-in slide-in-from-left-4 duration-500">
      <div className="flex gap-3 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-md animate-pulse">
          <ArmenianIcon className="h-6 w-6 text-white" />
        </div>

        {/* Message Content */}
        <div className="relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm bg-card border border-border/20 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '2s' }} />
              <span className="text-sm text-muted-foreground font-medium">
                HagopAI is thinking...
              </span>
            </div>

            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 bg-gradient-armenian rounded-full animate-bounce shadow-sm"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Message Tail */}
          <div className="absolute top-4 -left-1.5 w-3 h-3 bg-card border-l border-t border-border/20 transform rotate-45" />
        </div>
      </div>
    </div>
  );
};
