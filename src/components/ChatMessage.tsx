import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/lib/favorites";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  messageId?: string;
  sessionId?: string;
  sessionTitle?: string;
}

export const ChatMessage = ({ message, isUser, timestamp, messageId, sessionId, sessionTitle }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (messageId) {
      setFavorited(isFavorited(messageId));
    }
  }, [messageId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleToggleFavorite = () => {
    if (!messageId || !sessionId || !sessionTitle || !timestamp) return;

    if (favorited) {
      removeFromFavorites(messageId);
      setFavorited(false);
    } else {
      addToFavorites(messageId, message, isUser, timestamp, sessionId, sessionTitle);
      setFavorited(true);
    }
  };

  return (
    <div className={cn(
      "flex w-full group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md",
          isUser
            ? "bg-gradient-armenian"
            : "bg-gradient-to-br from-accent to-accent/70"
        )}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <ArmenianIcon className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          "relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm",
          isUser
            ? "bg-gradient-armenian text-white"
            : "bg-card border border-border/20"
        )}>
          {/* Message Text */}
          <div className="space-y-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>

            {/* Timestamp and Actions */}
            <div className={cn(
              "flex items-center justify-between gap-2 mt-2",
              isUser ? "flex-row-reverse" : "flex-row"
            )}>
              {timestamp && (
                <span className={cn(
                  "text-xs opacity-70",
                  isUser ? "text-white/70" : "text-muted-foreground"
                )}>
                  {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn(
                  "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                  isUser
                    ? "hover:bg-white/20 text-white/70 hover:text-white"
                    : "hover:bg-accent"
                )}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Message Tail */}
          <div className={cn(
            "absolute top-4 w-3 h-3 transform rotate-45",
            isUser
              ? "-right-1.5 bg-gradient-armenian"
              : "-left-1.5 bg-card border-l border-t border-border/20"
          )} />
        </div>
      </div>
    </div>
  );
};
