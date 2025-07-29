import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  Star, 
  Download, 
  Search, 
  Calendar, 
  BookOpen, 
  Palette,
  Zap,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAction: (action: string) => void;
  className?: string;
}

export const QuickActions = ({ onAction, className }: QuickActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      id: 'voice',
      icon: <Mic className="h-4 w-4" />,
      label: 'Voice Message',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Record a voice message'
    },
    {
      id: 'favorites',
      icon: <Star className="h-4 w-4" />,
      label: 'Favorites',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'View starred messages'
    },
    {
      id: 'search',
      icon: <Search className="h-4 w-4" />,
      label: 'Global Search',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Search all conversations'
    },
    {
      id: 'export',
      icon: <Download className="h-4 w-4" />,
      label: 'Export Chat',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Download as PDF'
    },
    {
      id: 'calendar',
      icon: <Calendar className="h-4 w-4" />,
      label: 'Armenian Calendar',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Cultural events & holidays'
    },
    {
      id: 'learning',
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Learning Mode',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Interactive lessons'
    },
    {
      id: 'themes',
      icon: <Palette className="h-4 w-4" />,
      label: 'Themes',
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Customize appearance'
    },
    {
      id: 'analytics',
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Analytics',
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'Usage insights'
    }
  ];

  return (
    <div className={cn("fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50", className)}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="mb-3 sm:mb-4 space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-none">
          {actions.map((action) => (
            <Card
              key={action.id}
              className="p-3 backdrop-blur-sm bg-card/90 border-border/20 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group w-full sm:w-auto"
              onClick={() => {
                onAction(action.id);
                setIsExpanded(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg text-white transition-colors flex-shrink-0",
                  action.color
                )}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="lg"
        className={cn(
          "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg transition-all duration-300 transform",
          "bg-gradient-armenian hover:bg-gradient-armenian/90",
          "border-2 border-white/20",
          isExpanded ? "rotate-45 scale-110" : "hover:scale-105"
        )}
      >
        {isExpanded ? (
          <span className="text-xl sm:text-2xl font-bold text-white">×</span>
        ) : (
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        )}
      </Button>

      {/* Background overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
