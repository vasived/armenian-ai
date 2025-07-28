import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  MessageSquare,
  Calendar,
  Trash2,
  Edit3,
  Check,
  X,
  Menu,
  Bot,
  Clock,
  Search
} from "lucide-react";
import { ChatSession } from "@/lib/chatHistory";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  onRenameChat: (sessionId: string, newTitle: string) => void;
  className?: string;
  keyPrefix?: string;
}

export const ChatSidebar = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  className,
  keyPrefix = 'desktop'
}: ChatSidebarProps) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatId, setNewChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const previousSessionsRef = useRef<ChatSession[]>(sessions);

  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredSessions = sortedSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveEditing = () => {
    if (editingSessionId && editingTitle.trim()) {
      onRenameChat(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <Button
          onClick={onNewChat}
          className="w-full gap-2 bg-gradient-armenian hover:bg-gradient-armenian/90 text-white shadow-lg"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No chats found" : "No chat history yet"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {searchQuery ? "Try a different search term" : "Start a conversation to see it here"}
              </p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={`mobile-${session.id}`}
                className="p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-all"
                onClick={() => onSelectChat(session.id)}
              >
                <h4 className="text-sm font-medium truncate">{session.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.messages.length} messages
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>{sessions.length} chat{sessions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/20">
        <Button 
          onClick={onNewChat}
          className="w-full gap-2 bg-gradient-armenian hover:bg-gradient-armenian/90 text-white shadow-lg"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
        
        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? "No chats found" : "No chat history yet"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {searchQuery ? "Try a different search term" : "Start a conversation to see it here"}
              </p>
            </div>
          ) : (
            <>
              {/* Today's chats */}
              {filteredSessions.filter(s => formatDate(s.updatedAt) === "Today").length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Clock className="h-3 w-3" />
                    Today
                  </div>
                  {filteredSessions
                    .filter(session => formatDate(session.updatedAt) === "Today")
                    .map(session => (
                      <ChatSessionItem
                        key={`${keyPrefix}-${session.id}`}
                        session={session}
                        isActive={session.id === activeSessionId}
                        isEditing={editingSessionId === session.id}
                        editingTitle={editingTitle}
                        onSelect={() => onSelectChat(session.id)}
                        onEdit={() => startEditing(session)}
                        onDelete={() => onDeleteChat(session.id)}
                        onSaveEdit={saveEditing}
                        onCancelEdit={cancelEditing}
                        onTitleChange={setEditingTitle}
                      />
                    ))}
                </div>
              )}

              {/* Yesterday's chats */}
              {filteredSessions.filter(s => formatDate(s.updatedAt) === "Yesterday").length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Calendar className="h-3 w-3" />
                    Yesterday
                  </div>
                  {filteredSessions
                    .filter(session => formatDate(session.updatedAt) === "Yesterday")
                    .map(session => (
                      <ChatSessionItem
                        key={`${keyPrefix}-${session.id}`}
                        session={session}
                        isActive={session.id === activeSessionId}
                        isEditing={editingSessionId === session.id}
                        editingTitle={editingTitle}
                        onSelect={() => onSelectChat(session.id)}
                        onEdit={() => startEditing(session)}
                        onDelete={() => onDeleteChat(session.id)}
                        onSaveEdit={saveEditing}
                        onCancelEdit={cancelEditing}
                        onTitleChange={setEditingTitle}
                      />
                    ))}
                </div>
              )}

              {/* Older chats */}
              {filteredSessions.filter(s => !["Today", "Yesterday"].includes(formatDate(s.updatedAt))).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Calendar className="h-3 w-3" />
                    Earlier
                  </div>
                  {filteredSessions
                    .filter(session => !["Today", "Yesterday"].includes(formatDate(session.updatedAt)))
                    .map(session => (
                      <ChatSessionItem
                        key={`${keyPrefix}-${session.id}`}
                        session={session}
                        isActive={session.id === activeSessionId}
                        isEditing={editingSessionId === session.id}
                        editingTitle={editingTitle}
                        onSelect={() => onSelectChat(session.id)}
                        onEdit={() => startEditing(session)}
                        onDelete={() => onDeleteChat(session.id)}
                        onSaveEdit={saveEditing}
                        onCancelEdit={cancelEditing}
                        onTitleChange={setEditingTitle}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>{sessions.length} chat{sessions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex flex-col", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
};

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (title: string) => void;
}

const ChatSessionItem = ({
  session,
  isActive,
  isEditing,
  editingTitle,
  onSelect,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onTitleChange
}: ChatSessionItemProps) => {
  const messageCount = session.messages.length;
  const lastMessage = session.messages[session.messages.length - 1];

  return (
    <div className={cn(
      "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
      "hover:bg-accent/50 hover:shadow-sm",
      isActive && "bg-accent shadow-sm ring-1 ring-primary/20"
    )}>
      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onSaveEdit} className="h-6 px-2">
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-6 px-2">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div onClick={onSelect} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium truncate flex-1">
                {session.title}
              </h4>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-6 w-6 p-0 hover:bg-background"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {lastMessage && (
              <p className="text-xs text-muted-foreground truncate">
                {lastMessage.isUser ? "You: " : "HagopAI: "}
                {lastMessage.content}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
              <span>{session.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
