import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, X, Sparkles, Trophy, Crown, Star } from "lucide-react";
import { Achievement } from "@/lib/progressManager";
import { cn } from "@/lib/utils";

export const EnhancedAchievementNotification = () => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
      setShouldRender(true);
      setIsVisible(false);
      setIsExiting(false);
      
      // Delayed entrance for dramatic effect
      setTimeout(() => setIsVisible(true), 100);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        handleClose();
      }, 6000);
    };

    window.addEventListener('achievementUnlocked', handleAchievement as EventListener);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievement as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setIsVisible(false);
    setTimeout(() => {
      setAchievement(null);
      setShouldRender(false);
      setIsExiting(false);
    }, 500);
  };

  if (!shouldRender || !achievement) return null;

  return (
    <>
      {/* Backdrop overlay for extra drama */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-all duration-500",
          isVisible && !isExiting ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />
      
      {/* Achievement Card */}
      <div 
        className={cn(
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]",
          "transition-all duration-500 ease-out",
          isVisible && !isExiting
            ? "scale-100 opacity-100 rotate-0" 
            : isExiting
            ? "scale-90 opacity-0 rotate-6"
            : "scale-75 opacity-0 -rotate-12"
        )}
      >
        <Card className={cn(
          "relative p-8 max-w-md w-full mx-4",
          "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50",
          "dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-red-950/30",
          "border-2 border-yellow-300 dark:border-yellow-600",
          "shadow-2xl shadow-yellow-500/20",
          "overflow-hidden"
        )}>
          {/* Animated background sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 text-yellow-400 animate-pulse">
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="absolute top-6 right-6 text-orange-400 animate-pulse delay-300">
              <Star className="h-4 w-4" />
            </div>
            <div className="absolute bottom-4 left-6 text-yellow-500 animate-pulse delay-500">
              <Crown className="h-3 w-3" />
            </div>
            <div className="absolute bottom-6 right-4 text-orange-500 animate-pulse delay-700">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header with trophy */}
          <div className="text-center mb-6">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl",
                "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500",
                "shadow-lg shadow-yellow-500/50",
                "animate-bounce"
              )}>
                {achievement.icon}
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-ping opacity-20" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Achievement Unlocked!
              </span>
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Achievement content */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {achievement.title}
            </h3>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {achievement.description}
            </p>
            
            <div className="flex justify-center">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm px-4 py-2",
                  "bg-gradient-to-r from-yellow-100 to-orange-100",
                  "dark:from-yellow-900/40 dark:to-orange-900/40",
                  "border-yellow-400 dark:border-yellow-600",
                  "text-yellow-800 dark:text-yellow-200",
                  "font-semibold"
                )}
              >
                {achievement.category}
              </Badge>
            </div>

            {/* Celebration button */}
            <Button
              onClick={handleClose}
              className={cn(
                "mt-6 px-8 py-3 text-white font-semibold",
                "bg-gradient-to-r from-yellow-500 to-orange-500",
                "hover:from-yellow-600 hover:to-orange-600",
                "shadow-lg shadow-yellow-500/30",
                "transform transition-all duration-200",
                "hover:scale-105 active:scale-95"
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Awesome!
            </Button>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div 
              className={cn(
                "h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
                "transition-all ease-linear",
                isVisible && !isExiting ? "w-0" : "w-full"
              )}
              style={{ 
                transitionDuration: isVisible && !isExiting ? '6000ms' : '0ms',
                width: isVisible && !isExiting ? '100%' : '0%'
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
};
