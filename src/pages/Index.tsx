import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserSettings } from "@/components/UserSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateAIResponse } from "@/lib/openai";
import { Bot, Sparkles, Globe, Trash2 } from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import hagopLogo from "@/assets/hagop-ai-logo.jpg";
import hagopIcon from "@/assets/hagop-ai-icon.jpg";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'hagopai_chat_history';

const saveChatHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('Could not save chat history:', error);
  }
};

const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.warn('Could not clear chat history:', error);
  }
};

const loadChatHistory = (): Message[] => {
  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.warn('Could not load chat history:', error);
  }
  return [];
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history on component mount
  useEffect(() => {
    const savedMessages = loadChatHistory();
    setMessages(savedMessages);
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    clearChatHistory();
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Convert messages to OpenAI format
    const conversationHistory = messages
      .filter(msg => msg.id !== "welcome") // Exclude welcome message
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

    // Add current user message
    conversationHistory.push({
      role: 'user' as const,
      content
    });

    // Get AI response (includes built-in error handling and fallbacks)
    const aiResponseContent = await generateAIResponse(conversationHistory);

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponseContent,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 transition-colors duration-300">
      <div className="w-full h-screen flex flex-col relative">
        {/* Modern Header */}
        <header className="glass-effect border-b border-border/20 backdrop-blur-xl cultural-glow">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative group">
                  <ArmenianIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-armenian rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
                    HagopAI
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 font-medium">
                    <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Your Armenian Cultural Companion</span>
                    <span className="sm:hidden">Armenian AI</span>
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent" />
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-armenian/10 border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="font-medium">AI Ready</span>
                </div>
                <div className="text-xs opacity-70">
                  English • Western Armenian
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live AI</span>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </Button>
              )}
              <UserSettings />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="px-4 sm:px-6 py-6 sm:py-10 text-center border-b border-border/10 bg-gradient-hero">
          <div className="w-full mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 sm:mb-3 leading-tight">
              Parev! Your Armenian Friend in the Digital World
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Whether you need help with Armenian traditions, family questions, work advice, or just want to chat about life -
              HagopAI is here for you. Talk to me in English or Western Armenian
              (like <span className="font-medium text-primary">"parev"</span> or <span className="font-medium text-primary">"shnorhakaloutyoun"</span>) and let's have a real conversation!
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 m-3 sm:m-6 flex flex-col overflow-hidden shadow-2xl warm-card cultural-glow">
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && <LoadingIndicator />}

            {/* Scroll target */}
            <div ref={messagesEndRef} />

            {/* Empty state with tips */}
            {messages.length === 0 && !isLoading && (
              <div className="mt-6 sm:mt-10 text-center text-muted-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                  <div className="p-4 sm:p-5 rounded-xl warm-card hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <Globe className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold mb-1">Armenian Culture</div>
                    <div className="text-xs opacity-80 leading-relaxed">Traditions, history, customs, holidays</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl warm-card hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-accent group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold mb-1">Family & Life</div>
                    <div className="text-xs opacity-80 leading-relaxed">Advice, relationships, wisdom, values</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl warm-card hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-armenian-orange group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold mb-1">Language Help</div>
                    <div className="text-xs opacity-80 leading-relaxed">Armenian learning, translation, culture</div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-xl warm-card hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-sm font-semibold mb-1">Business & Tech</div>
                    <div className="text-xs opacity-80 leading-relaxed">Career, programming, startups, advice</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </Card>
      </div>
    </div>
  );
};

export default Index;
