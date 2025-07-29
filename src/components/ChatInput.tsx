import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-card rounded-2xl border border-border/20 shadow-lg">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about Armenian culture, family, business, tech... in English or Western Armenian (like 'parev, inch bes?')"
            disabled={isLoading}
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-20 sm:pr-24 text-base leading-6"
          />

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
              disabled={isLoading}
            >
              <Smile className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              size="sm"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200",
                message.trim() && !isLoading
                  ? "bg-gradient-armenian hover:bg-gradient-armenian/90 text-white shadow-lg scale-100"
                  : "bg-muted text-muted-foreground scale-90"
              )}
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex items-center justify-between mt-3 px-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Enter</kbd> to send,
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Shift+Enter</kbd> for new line
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            Tap send or press Enter
          </div>

          {message.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {message.length} characters
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
