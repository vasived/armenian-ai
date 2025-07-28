import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  User, 
  Bot,
  ArrowRight,
  Filter
} from "lucide-react";
import { ChatSession, Message, loadChatSessions } from "@/lib/chatHistory";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { cn } from "@/lib/utils";

interface SearchResult {
  message: Message;
  session: ChatSession;
  matchType: 'content' | 'context';
}

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChat: (sessionId: string) => void;
}

export const GlobalSearchDialog = ({ open, onOpenChange, onSelectChat }: GlobalSearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'user' | 'ai'>('all');

  useEffect(() => {
    if (open) {
      setSessions(loadChatSessions());
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      performSearch(query, filterType);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, filterType, sessions]);

  const performSearch = (searchQuery: string, filter: 'all' | 'user' | 'ai') => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    const searchResults: SearchResult[] = [];

    sessions.forEach(session => {
      session.messages.forEach(message => {
        // Filter by message type
        if (filter === 'user' && !message.isUser) return;
        if (filter === 'ai' && message.isUser) return;

        const messageContent = message.content.toLowerCase();
        const sessionTitle = session.title.toLowerCase();
        
        // Check if all search terms are found
        const contentMatches = searchTerms.every(term => messageContent.includes(term));
        const contextMatches = searchTerms.every(term => 
          sessionTitle.includes(term) || messageContent.includes(term)
        );

        if (contentMatches || contextMatches) {
          searchResults.push({
            message,
            session,
            matchType: contentMatches ? 'content' : 'context'
          });
        }
      });
    });

    // Sort by relevance (content matches first, then by date)
    searchResults.sort((a, b) => {
      if (a.matchType !== b.matchType) {
        return a.matchType === 'content' ? -1 : 1;
      }
      return new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime();
    });

    setResults(searchResults.slice(0, 50)); // Limit to 50 results
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectChat(result.session.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
            {results.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {results.length} results
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-base"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="h-7"
            >
              All Messages
            </Button>
            <Button
              variant={filterType === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('user')}
              className="h-7"
            >
              Your Messages
            </Button>
            <Button
              variant={filterType === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ai')}
              className="h-7"
            >
              HagopAI Responses
            </Button>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-1">
            {query.trim() === '' ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">Search your conversations</p>
                <p className="text-sm">Type to search across all your chats with HagopAI</p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                <p>Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No results found</p>
                <p className="text-sm">Try different keywords or check your spelling</p>
              </div>
            ) : (
              results.map((result, index) => (
                <div
                  key={`${result.session.id}-${result.message.id}-${index}`}
                  className="p-4 rounded-lg border border-border/20 bg-card/50 hover:bg-card transition-colors cursor-pointer group"
                  onClick={() => handleSelectResult(result)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        result.message.isUser 
                          ? "bg-gradient-armenian" 
                          : "bg-accent"
                      )}>
                        {result.message.isUser ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <ArmenianIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {result.message.isUser ? "You" : "HagopAI"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {result.message.timestamp.toLocaleDateString()}
                          <MessageSquare className="h-3 w-3 ml-1" />
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(result.session.title, query) 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={result.matchType === 'content' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {result.matchType === 'content' ? 'Content' : 'Context'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm leading-relaxed">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(
                          result.message.content.length > 200 
                            ? result.message.content.substring(0, 200) + "..." 
                            : result.message.content, 
                          query
                        ) 
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
