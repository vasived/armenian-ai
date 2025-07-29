import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileAttachment } from "@/lib/chatHistory";

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !isLoading) {
      onSend(message.trim() || "📎 File attachment", attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage("");
      setAttachedFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      const fileAttachment: FileAttachment = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        mimeType: file.type
      };

      setAttachedFiles(prev => [...prev, fileAttachment]);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Clean up the URL
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.url);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* File Attachments Preview */}
      {attachedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 text-sm max-w-xs"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(file.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

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

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
              size="sm"
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full transition-all duration-200",
                (message.trim() || attachedFiles.length > 0) && !isLoading
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
