import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  MessageSquare,
  Clock,
  Calendar,
  Star,
  Heart,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Target,
  Zap,
  Trophy,
  Flame,
  BookOpen,
  Palette
} from "lucide-react";
import { loadChatSessions } from "@/lib/chatHistory";
import { loadFavorites } from "@/lib/favorites";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { cn } from "@/lib/utils";
import { progressManager, Achievement } from "@/lib/progressManager";

interface AnalyticsData {
  totalChats: number;
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  favoritesCount: number;
  averageMessagesPerChat: number;
  activeDays: number;
  longestChat: {
    title: string;
    messageCount: number;
  };
  mostActiveDay: string;
  responseTime: number;
  culturalTopics: Array<{
    topic: string;
    count: number;
    percentage: number;
  }>;
  learningProgress: {
    completedLessons: number;
    totalTime: number;
    streak: number;
  };
  monthlyActivity: Array<{
    month: string;
    messages: number;
  }>;
}

interface AnalyticsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnalyticsDashboard = ({ open, onOpenChange }: AnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      generateAnalytics();
    }
  }, [open]);

  const generateAnalytics = () => {
    setIsLoading(true);

    // Get data from progress manager
    const userProgress = progressManager.getProgress();
    const learningStats = progressManager.getLearningStats();
    const chatStats = progressManager.getChatStats();
    const usageStats = progressManager.getUsageStats();
    const achievements = progressManager.getAchievements();

    // Get additional data from localStorage
    const sessions = loadChatSessions();
    const favorites = loadFavorites();

    // Calculate enhanced stats
    const totalChats = Math.max(sessions.length, chatStats.totalChats);
    const allMessages = sessions.flatMap(s => s.messages);
    const totalMessages = Math.max(allMessages.length, chatStats.totalMessages);
    const userMessages = allMessages.filter(m => m.isUser).length;
    const aiMessages = allMessages.filter(m => !m.isUser).length;
    const favoritesCount = favorites.length;
    const averageMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;

    // Find longest chat
    const longestChat = sessions.reduce((longest, session) => {
      return session.messages.length > longest.messageCount 
        ? { title: session.title, messageCount: session.messages.length }
        : longest;
    }, { title: 'No chats yet', messageCount: 0 });

    // Calculate active days
    const messageDates = allMessages.map(m => 
      new Date(m.timestamp).toDateString()
    );
    const uniqueDays = new Set(messageDates);
    const activeDays = uniqueDays.size;

    // Find most active day
    const dayCount: Record<string, number> = {};
    messageDates.forEach(date => {
      dayCount[date] = (dayCount[date] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCount).reduce((most, [day, count]) => {
      return count > most.count ? { day, count } : most;
    }, { day: 'No activity yet', count: 0 }).day;

    // Analyze cultural topics
    const culturalKeywords = {
      'Family': ['family', 'mama', 'haba', 'tatik', 'babik', 'yeghbayr', 'khoyr'],
      'Food': ['food', 'keretsek', 'hamov', 'dolma', 'pilaf', 'lavash', 'baklava'],
      'Language': ['armenian', 'parev', 'shnorhakaloutyoun', 'inch bes', 'language'],
      'Culture': ['culture', 'tradition', 'armenian', 'heritage', 'customs'],
      'Business': ['work', 'business', 'professional', 'career', 'job'],
      'Religion': ['church', 'christmas', 'easter', 'prayer', 'religious'],
      'History': ['history', 'genocide', 'armenia', 'historical', 'heritage']
    };

    const topicCounts: Record<string, number> = {};
    Object.keys(culturalKeywords).forEach(topic => {
      topicCounts[topic] = 0;
    });

    allMessages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(culturalKeywords).forEach(([topic, keywords]) => {
        keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            topicCounts[topic] += 1;
          }
        });
      });
    });

    const culturalTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: totalMessages > 0 ? (count / totalMessages) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly activity (last 6 months)
    const monthlyActivity = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthMessages = allMessages.filter(m => {
        const messageDate = new Date(m.timestamp);
        return messageDate.getMonth() === month.getMonth() && 
               messageDate.getFullYear() === month.getFullYear();
      }).length;
      monthlyActivity.push({ month: monthStr, messages: monthMessages });
    }

    const analyticsData: AnalyticsData = {
      totalChats,
      totalMessages,
      userMessages,
      aiMessages,
      favoritesCount,
      averageMessagesPerChat,
      activeDays: usageStats.activeDays,
      longestChat,
      mostActiveDay,
      responseTime: 1.2,
      culturalTopics,
      learningProgress: {
        completedLessons: learningStats.completedLessons,
        totalTime: learningStats.totalTimeSpent,
        streak: learningStats.currentStreak
      },
      monthlyActivity
    };

    setAnalytics(analyticsData);
    setIsLoading(false);
  };

  if (!analytics || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Loading Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Analyzing your HagopAI journey...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your HagopAI Analytics
            <Badge variant="secondary" className="ml-2">
              {analytics.activeDays} active days
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.totalChats}</p>
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.favoritesCount}</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.activeDays}</p>
                    <p className="text-sm text-muted-foreground">Active Days</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Conversation Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Conversation Breakdown
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Your Messages</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ 
                            width: `${(analytics.userMessages / analytics.totalMessages) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analytics.userMessages}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HagopAI Responses</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ 
                            width: `${(analytics.aiMessages / analytics.totalMessages) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{analytics.aiMessages}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Average: {analytics.averageMessagesPerChat.toFixed(1)} messages per chat
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Cultural Topics
                </h3>
                <div className="space-y-3">
                  {analytics.culturalTopics.slice(0, 5).map((topic, index) => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          index === 0 && "bg-red-500",
                          index === 1 && "bg-blue-500",
                          index === 2 && "bg-green-500",
                          index === 3 && "bg-yellow-500",
                          index === 4 && "bg-purple-500"
                        )} />
                        {topic.topic}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{topic.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({topic.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {analytics.culturalTopics.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Start chatting to see your cultural interests!
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Learning Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learning Journey
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-2">
                    <Award className="h-8 w-8 mx-auto text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.learningProgress.completedLessons}</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg mb-2">
                    <Clock className="h-8 w-8 mx-auto text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.learningProgress.totalTime}min</p>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg mb-2">
                    <Zap className="h-8 w-8 mx-auto text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold">{analytics.learningProgress.streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </Card>

            {/* Monthly Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Over Time
              </h3>
              <div className="space-y-3">
                {analytics.monthlyActivity.map((month, index) => (
                  <div key={month.month} className="flex items-center gap-4">
                    <span className="text-sm w-20 text-muted-foreground">
                      {month.month}
                    </span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-armenian transition-all duration-700"
                        style={{ 
                          width: `${Math.max((month.messages / Math.max(...analytics.monthlyActivity.map(m => m.messages))) * 100, 5)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {month.messages}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
                <Badge variant="secondary" className="ml-2">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200",
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800"
                        : "bg-muted/30 border-border/50 opacity-60"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {achievement.unlocked ? (
                        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30">
                          Unlocked
                        </Badge>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {achievement.requirements.current || 0}/{achievement.requirements.target}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Learning Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Learning Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-2">
                    <BookOpen className="h-8 w-8 mx-auto text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{learningStats.completedLessons}</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg Score: {learningStats.averageScorePerLesson}%
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg mb-2">
                    <Flame className="h-8 w-8 mx-auto text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold">{learningStats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {learningStats.longestStreak} days
                  </p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg mb-2">
                    <Clock className="h-8 w-8 mx-auto text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{learningStats.totalTimeSpent}</p>
                  <p className="text-sm text-muted-foreground">Minutes Studied</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep learning!
                  </p>
                </div>
              </div>
            </Card>

            {/* Fun Facts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fun Facts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">Longest Chat</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "{analytics.longestChat.title}" with {analytics.longestChat.messageCount} messages
                  </p>
                </div>
                <div className="p-4 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Most Active Day</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analytics.mostActiveDay}
                  </p>
                </div>
                <div className="p-4 bg-accent/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-medium">Features Explored</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {usageStats.featuresExplored}/8 features discovered
                  </p>
                </div>
              </div>
            </Card>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button onClick={generateAnalytics} variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Refresh Analytics
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
