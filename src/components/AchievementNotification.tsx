import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, X, Sparkles } from "lucide-react";
import { Achievement } from "@/lib/progressManager";
import { cn } from "@/lib/utils";

export const AchievementNotification = () => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        handleClose();
      }, 5000);
    };

    window.addEventListener('achievementUnlocked', handleAchievement as EventListener);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievement as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setAchievement(null), 300);
  };

  if (!achievement) return null;

  return (
    <div 
      className={cn(
        "fixed top-6 right-6 z-[100] transition-all duration-300 transform",
        isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
      )}
    >
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800 shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl animate-bounce">
              {achievement.icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Achievement Unlocked!
              </span>
              <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
            </div>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {achievement.title}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {achievement.description}
            </p>
            
            <Badge 
              variant="outline" 
              className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
            >
              {achievement.category}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
