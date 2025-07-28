import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatSidebar } from "@/components/ChatSidebar";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserSettings } from "@/components/UserSettings";
import { QuickActions } from "@/components/QuickActions";
import { FavoritesDialog } from "@/components/FavoritesDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { generateAIResponse } from "@/lib/openai";
import { generateMessageId } from "@/lib/utils";
import {
  Bot,
  Sparkles,
  Globe,
  ArrowRight,
  Heart,
  Coffee,
  BookOpen,
  Users,
  Lightbulb,
  MessageCircle,
  Menu,
  Plus,
  Search,
  MessageSquare
} from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { 
  ChatSession, 
  Message,
  saveChatSessions,
  loadChatSessions,
  getActiveChat,
  setActiveChat,
  generateChatTitle,
  createNewChatSession,
  updateChatSession,
  deleteChatSession
} from "@/lib/chatHistory";

const Index = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat sessions on component mount
  useEffect(() => {
    const savedSessions = loadChatSessions();

    // Debug: Check for duplicate message IDs
    const allMessages = savedSessions.flatMap(s => s.messages);
    const messageIds = allMessages.map(m => m.id);
    const duplicateIds = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      console.warn('Found duplicate message IDs:', duplicateIds);
      // Clear localStorage to fix corruption
      localStorage.removeItem('hagopai_chat_sessions');
      setSessions([]);
      return;
    }

    setSessions(savedSessions);

    const lastActiveChat = getActiveChat();
    if (lastActiveChat && savedSessions.find(s => s.id === lastActiveChat)) {
      setActiveSessionId(lastActiveChat);
    } else if (savedSessions.length > 0) {
      setActiveSessionId(savedSessions[0].id);
      setActiveChat(savedSessions[0].id);
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveChatSessions(sessions);
    }
  }, [sessions]);

  // Update active chat in localStorage
  useEffect(() => {
    if (activeSessionId) {
      setActiveChat(activeSessionId);
    }
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newSession = createNewChatSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    
    toast({
      title: "New Chat Started",
      description: "Ready for a fresh conversation!",
    });
  };

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleDeleteChat = (sessionId: string) => {
    setSessions(prev => deleteChatSession(prev, sessionId));
    
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
    
    toast({
      title: "Chat Deleted",
      description: "Chat history has been removed.",
    });
  };

  const handleRenameChat = (sessionId: string, newTitle: string) => {
    setSessions(prev => updateChatSession(prev, sessionId, { title: newTitle }));
    
    toast({
      title: "Chat Renamed",
      description: "Chat title has been updated.",
    });
  };

  const handleSendMessage = async (content: string) => {
    let currentSessionId = activeSessionId;

    // Create new session if none exists
    if (!currentSessionId) {
      const newSession = createNewChatSession();
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
    }

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    // Get current session and build conversation history
    const currentSession = sessions.find(s => s.id === currentSessionId);
    const existingMessages = currentSession?.messages || [];

    // Build conversation history with existing messages + new user message
    const conversationHistory = [...existingMessages, userMessage]
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

    // Update session with user message and title
    setSessions(prev => updateChatSession(prev, currentSessionId!, {
      messages: [...existingMessages, userMessage],
      title: prev.find(s => s.id === currentSessionId)?.title === 'New Chat'
        ? generateChatTitle(content)
        : prev.find(s => s.id === currentSessionId)?.title
    }));

    setIsLoading(true);

    // Get AI response
    const aiResponseContent = await generateAIResponse(conversationHistory);

    const aiResponse: Message = {
      id: generateMessageId(),
      content: aiResponseContent,
      isUser: false,
      timestamp: new Date()
    };

    // Update session with AI response
    setSessions(prev => {
      const currentSession = prev.find(s => s.id === currentSessionId);
      const updatedMessages = [...(currentSession?.messages || []), aiResponse];
      return updateChatSession(prev, currentSessionId!, {
        messages: updatedMessages
      });
    });

    setIsLoading(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'voice':
        toast({
          title: "Voice Messages",
          description: "Voice recording feature coming soon!",
        });
        break;
      case 'favorites':
        // This will be handled by the FavoritesDialog
        break;
      case 'search':
        toast({
          title: "Global Search",
          description: "Search across all conversations feature coming soon!",
        });
        break;
      case 'export':
        if (activeSession) {
          const content = activeSession.messages
            .map(m => `${m.isUser ? 'You' : 'HagopAI'}: ${m.content}`)
            .join('\n\n');
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeSession.title}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Chat Exported",
            description: "Your conversation has been downloaded as a text file.",
          });
        }
        break;
      case 'calendar':
        toast({
          title: "Armenian Calendar",
          description: "Cultural calendar feature coming soon!",
        });
        break;
      case 'learning':
        toast({
          title: "Learning Mode",
          description: "Interactive Armenian lessons coming soon!",
        });
        break;
      case 'themes':
        toast({
          title: "Theme Customizer",
          description: "Custom themes feature coming soon!",
        });
        break;
      case 'analytics':
        toast({
          title: "Usage Analytics",
          description: "Analytics dashboard coming soon!",
        });
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const examplePrompts = [
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Family & Culture",
      prompt: "Tell me about Armenian family traditions",
      color: "text-red-500"
    },
    {
      icon: <Coffee className="h-5 w-5" />,
      title: "Daily Life",
      prompt: "How do I maintain Armenian identity in diaspora?",
      color: "text-orange-500"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Language Help",
      prompt: "Teach me some Western Armenian phrases",
      color: "text-blue-500"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Business & Career",
      prompt: "Career advice for Armenian professionals",
      color: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        className="w-80 border-r border-border/20 bg-card/30 backdrop-blur-sm"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Trigger */}
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
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-border/20">
                      <Button
                        onClick={handleNewChat}
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
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>

                    {/* Chat History */}
                    <ScrollArea className="flex-1 px-2">
                      <div className="space-y-1 p-2">
                        {sessions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No chat history yet</p>
                            <p className="text-xs mt-1 opacity-70">Start a conversation to see it here</p>
                          </div>
                        ) : (
                          sessions.map(session => (
                            <div
                              key={`mobile-${session.id}`}
                              className="p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-all"
                              onClick={() => handleSelectChat(session.id)}
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
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ArmenianIcon className="h-10 w-10" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-armenian rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">HagopAI</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5" />
                    Your Armenian Cultural Companion
                    <Globe className="h-3.5 w-3.5 text-accent" />
                  </p>
                </div>
              </div>

              {activeSession && (
                <div className="hidden md:flex items-center gap-3 ml-6 pl-6 border-l border-border/20">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{activeSession.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeSession.messages.length} messages
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Live AI</span>
              </div>
              {/* Debug button to clear all data */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.clear();
                  setSessions([]);
                  setActiveSessionId(null);
                  toast({
                    title: "Data Cleared",
                    description: "All chat history has been cleared.",
                  });
                }}
                className="text-xs opacity-50 hover:opacity-100"
              >
                Clear All
              </Button>
              <FavoritesDialog>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </Button>
              </FavoritesDialog>
              <UserSettings />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-armenian rounded-full flex items-center justify-center shadow-2xl">
                    <ArmenianIcon className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold gradient-text">Parev! Welcome to HagopAI</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Your Armenian friend in the digital world. Ask me about culture, family, business, 
                    language - or just chat about life!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {examplePrompts.map((example, index) => (
                    <Card 
                      key={index}
                      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group bg-gradient-to-br from-card to-card/50"
                      onClick={() => handleSendMessage(example.prompt)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${example.color} group-hover:scale-110 transition-transform`}>
                          {example.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-2">{example.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {example.prompt}
                          </p>
                          <ArrowRight className="h-4 w-4 mt-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Powered by AI</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>English & Western Armenian</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    messageId={message.id}
                    sessionId={activeSessionId || undefined}
                    sessionTitle={activeSession?.title || 'Untitled Chat'}
                  />
                ))}
                {isLoading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <QuickActions onAction={handleQuickAction} />
    </div>
  );
};

export default Index;
