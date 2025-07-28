import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Star, 
  Search, 
  Calendar, 
  MessageSquare, 
  User, 
  Bot,
  Trash2,
  Edit,
  Tag,
  StickyNote
} from "lucide-react";
import { FavoriteMessage, loadFavorites, removeFromFavorites, updateFavoriteNote, searchFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoritesDialogProps {
  children: React.ReactNode;
}

export const FavoritesDialog = ({ children }: FavoritesDialogProps) => {
  const [favorites, setFavorites] = useState<FavoriteMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFavorites(loadFavorites());
    }
  }, [open]);

  const filteredFavorites = searchQuery 
    ? searchFavorites(searchQuery)
    : favorites;

  const handleRemoveFavorite = (messageId: string) => {
    const updated = removeFromFavorites(messageId);
    setFavorites(updated);
  };

  const handleSaveNote = (messageId: string) => {
    const updated = updateFavoriteNote(messageId, noteText);
    setFavorites(updated);
    setEditingNote(null);
    setNoteText("");
  };

  const startEditingNote = (messageId: string, currentNote?: string) => {
    setEditingNote(messageId);
    setNoteText(currentNote || "");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Favorite Messages
            <Badge variant="secondary" className="ml-2">
              {filteredFavorites.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites by content, tags, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Favorites List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-1">
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">
                  {searchQuery ? "No favorites found" : "No favorites yet"}
                </p>
                <p className="text-sm">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Star messages to save them here for quick access"
                  }
                </p>
              </div>
            ) : (
              filteredFavorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="p-4 rounded-lg border border-border/20 bg-card/50 hover:bg-card transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        favorite.isUser 
                          ? "bg-gradient-armenian" 
                          : "bg-accent"
                      )}>
                        {favorite.isUser ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {favorite.isUser ? "You" : "HagopAI"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {favorite.timestamp.toLocaleDateString()}
                          <MessageSquare className="h-3 w-3 ml-2" />
                          {favorite.sessionTitle}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingNote(favorite.id, favorite.note)}
                        className="h-8 w-8 p-0"
                      >
                        {favorite.note ? (
                          <StickyNote className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Edit className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {favorite.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {favorite.tags && favorite.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1 flex-wrap">
                        {favorite.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {editingNote === favorite.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note about this favorite..."
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(favorite.id)}
                          className="h-7 px-3"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNote(null)}
                          className="h-7 px-3"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : favorite.note ? (
                    <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground border-l-2 border-blue-500">
                      <div className="flex items-center gap-1 mb-1">
                        <StickyNote className="h-3 w-3" />
                        <span className="font-medium">Note:</span>
                      </div>
                      {favorite.note}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
