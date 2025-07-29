import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  FileIcon,
  File,
  Music,
  Video,
  Archive,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileAttachment as FileAttachmentType } from "@/lib/chatHistory";

interface FileAttachmentProps {
  attachment: FileAttachmentType;
  isUser: boolean;
  className?: string;
}

export const FileAttachment = ({ attachment, isUser, className }: FileAttachmentProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('text/') || mimeType.includes('code')) return <Code className="h-5 w-5" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="h-5 w-5" />;
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('sheet')) 
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
    if (mimeType.includes('zip')) return 'Archive';
    return 'File';
  };

  const isPreviewable = () => {
    return attachment.mimeType.startsWith('image/') || 
           attachment.mimeType.includes('pdf') ||
           attachment.mimeType.startsWith('text/');
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  const openPreview = () => {
    if (isPreviewable()) {
      setPreviewOpen(true);
    } else {
      downloadFile();
    }
  };

  return (
    <>
      <Card className={cn(
        "p-3 max-w-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        isUser
          ? "bg-white/10 border-white/20 hover:bg-white/15"
          : "bg-muted/50 border-border/30 hover:bg-muted/70",
        className
      )}>
        {/* Image Preview */}
        {attachment.mimeType.startsWith('image/') && (
          <div className="mb-3">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={openPreview}
            />
          </div>
        )}

        {/* File Info */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            isUser 
              ? "bg-white/20" 
              : "bg-primary/20"
          )}>
            <div className={cn(
              isUser ? "text-white/80" : "text-primary"
            )}>
              {getFileIcon(attachment.mimeType)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm truncate",
              isUser ? "text-white" : "text-foreground"
            )}>
              {attachment.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-xs",
                isUser ? "text-white/70" : "text-muted-foreground"
              )}>
                {getFileTypeLabel(attachment.mimeType)}
              </span>
              <span className={cn(
                "text-xs",
                isUser ? "text-white/60" : "text-muted-foreground"
              )}>
                {formatFileSize(attachment.size)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {isPreviewable() && (
              <Button
                onClick={openPreview}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0",
                  isUser 
                    ? "hover:bg-white/20 text-white/70 hover:text-white" 
                    : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <Button
              onClick={downloadFile}
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0",
                isUser 
                  ? "hover:bg-white/20 text-white/70 hover:text-white" 
                  : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
              )}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="truncate">{attachment.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {attachment.mimeType.startsWith('image/') && (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
            
            {attachment.mimeType.includes('pdf') && (
              <iframe
                src={attachment.url}
                className="w-full h-[70vh] rounded-lg"
                title={attachment.name}
              />
            )}
            
            {attachment.mimeType.startsWith('text/') && (
              <div className="p-4 bg-muted rounded-lg">
                <iframe
                  src={attachment.url}
                  className="w-full h-[60vh] border-0"
                  title={attachment.name}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={downloadFile} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
