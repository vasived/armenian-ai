import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/lib/favorites";
import { useNotifications } from "@/components/NotificationSystem";
import { AudioMessage } from "@/components/AudioMessage";

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string) => {
  // Split by line breaks to preserve them
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const parts = [];
    let remaining = line;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Look for **bold** text
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before the bold
        if (boldMatch.index > 0) {
          parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        // Add the bold text
        parts.push(<strong key={`${lineIndex}-${partIndex++}`} className="font-bold">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Look for *italic* text
      const italicMatch = remaining.match(/\*(.*?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        // Add text before the italic
        if (italicMatch.index > 0) {
          parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining.slice(0, italicMatch.index)}</span>);
        }
        // Add the italic text
        parts.push(<em key={`${lineIndex}-${partIndex++}`} className="italic">{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No more formatting found, add the rest
      parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining}</span>);
      break;
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  messageId?: string;
  sessionId?: string;
  sessionTitle?: string;
  type?: 'text' | 'audio';
  audioUrl?: string;
  audioDuration?: number;
}

export const ChatMessage = ({ message, isUser, timestamp, messageId, sessionId, sessionTitle, type = 'text', audioUrl, audioDuration }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    if (messageId) {
      setFavorited(isFavorited(messageId));
    }
  }, [messageId]);

  const handleCopy = async () => {
    // Don't allow copying audio messages
    if (type === 'audio') {
      notifications.info(
        "Cannot Copy",
        "Voice messages cannot be copied to clipboard"
      );
      return;
    }

    // Fallback function using the older method
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      } catch (err) {
        document.body.removeChild(textArea);
        throw err;
      }
    };

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
      } else {
        // Fallback to older method
        const success = fallbackCopy(message);
        if (!success) {
          throw new Error('Fallback copy method failed');
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      notifications.success(
        "Message Copied",
        "Text copied to clipboard",
        {
          icon: <Copy className="h-5 w-5 text-white" />,
          duration: 2000
        }
      );
    } catch (error) {
      console.error('Failed to copy message:', error);
      notifications.error(
        "Copy Failed",
        "Unable to copy text to clipboard. Please select and copy manually."
      );
    }
  };

  const handleToggleFavorite = () => {
    if (!messageId || !sessionId || !sessionTitle || !timestamp) return;

    try {
      if (favorited) {
        removeFromFavorites(messageId);
        setFavorited(false);
        notifications.info(
          "Removed from Favorites",
          "Message has been unfavorited",
          {
            icon: <Star className="h-5 w-5 text-white" />,
            duration: 2000
          }
        );
      } else {
        addToFavorites(messageId, message, isUser, timestamp, sessionId, sessionTitle);
        setFavorited(true);
        notifications.success(
          "Added to Favorites",
          "Message saved to your favorites",
          {
            icon: <Star className="h-5 w-5 text-white" />,
            duration: 2000
          }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      notifications.error(
        "Favorite Error",
        "Failed to update favorite status"
      );
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
          {/* Message Content */}
          <div className="space-y-2">
            {type === 'audio' && audioUrl && audioDuration ? (
              <div className="-m-1">
                <AudioMessage
                  audioUrl={audioUrl}
                  duration={audioDuration}
                  isUser={isUser}
                />
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                {parseMarkdown(message)}
              </div>
            )}

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

              <div className="flex items-center gap-1">
                {messageId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={cn(
                      "h-7 w-7 p-0 transition-all duration-200",
                      "opacity-0 group-hover:opacity-100 group-hover:scale-110",
                      isUser
                        ? "hover:bg-white/20 text-white/70 hover:text-white"
                        : "hover:bg-accent hover:shadow-md",
                      favorited && "opacity-100 scale-105"
                    )}
                  >
                    <Star className={cn(
                      "h-3.5 w-3.5 transition-all duration-200",
                      favorited ? "fill-yellow-400 text-yellow-400 scale-110" : ""
                    )} />
                  </Button>
                )}

                {/* Only show copy button for text messages */}
                {type !== 'audio' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      "h-7 w-7 p-0 transition-all duration-200",
                      "opacity-0 group-hover:opacity-100 group-hover:scale-110",
                      isUser
                        ? "hover:bg-white/20 text-white/70 hover:text-white"
                        : "hover:bg-accent hover:shadow-md",
                      copied && "opacity-100 scale-105"
                    )}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
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
