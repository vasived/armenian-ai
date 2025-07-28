// Comprehensive progress tracking system for HagopAI
import { generateUniqueId } from './utils';

export interface UserProgress {
  // Learning Progress
  learning: {
    lessonsCompleted: string[];
    totalTimeSpent: number; // in minutes
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
    lessonProgress: Record<string, {
      completed: boolean;
      timeSpent: number;
      score: number;
      attempts: number;
      lastAttempt: string;
    }>;
  };
  
  // Chat Progress
  chat: {
    totalChats: number;
    totalMessages: number;
    averageSessionLength: number;
    favoriteMessages: number;
    mostUsedTopics: string[];
    responseTimePreference: number;
  };
  
  // Cultural Engagement
  cultural: {
    calendarEventsViewed: string[];
    culturalTopicsExplored: string[];
    armenianPhrasesLearned: number;
    traditionalGreetingsUsed: number;
  };
  
  // Theme & Customization
  customization: {
    themesUsed: string[];
    preferredTheme: string;
    customizationsApplied: number;
    accessibilityFeaturesUsed: string[];
  };
  
  // General Usage
  usage: {
    totalSessionTime: number;
    activeDays: number;
    featuresExplored: string[];
    firstLoginDate: string;
    lastActiveDate: string;
    achievements: string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'chat' | 'cultural' | 'usage';
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  unlocked: boolean;
  unlockedDate?: string;
}

const PROGRESS_KEY = 'hagopai_user_progress';
const ACHIEVEMENTS_KEY = 'hagopai_achievements';
const SESSION_START_KEY = 'hagopai_session_start';

// Default progress structure
const defaultProgress: UserProgress = {
  learning: {
    lessonsCompleted: [],
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    lessonProgress: {}
  },
  chat: {
    totalChats: 0,
    totalMessages: 0,
    averageSessionLength: 0,
    favoriteMessages: 0,
    mostUsedTopics: [],
    responseTimePreference: 1.2
  },
  cultural: {
    calendarEventsViewed: [],
    culturalTopicsExplored: [],
    armenianPhrasesLearned: 0,
    traditionalGreetingsUsed: 0
  },
  customization: {
    themesUsed: ['default'],
    preferredTheme: 'default',
    customizationsApplied: 0,
    accessibilityFeaturesUsed: []
  },
  usage: {
    totalSessionTime: 0,
    activeDays: 1,
    featuresExplored: [],
    firstLoginDate: new Date().toISOString(),
    lastActiveDate: new Date().toISOString(),
    achievements: []
  }
};

// Achievements definitions
const achievements: Achievement[] = [
  {
    id: 'first_chat',
    title: 'First Steps',
    description: 'Started your first conversation with HagopAI',
    icon: '💬',
    category: 'chat',
    requirements: { type: 'totalChats', target: 1 },
    unlocked: false
  },
  {
    id: 'chat_master',
    title: 'Chat Master',
    description: 'Completed 10 conversations',
    icon: '🎯',
    category: 'chat',
    requirements: { type: 'totalChats', target: 10 },
    unlocked: false
  },
  {
    id: 'first_lesson',
    title: 'Language Explorer',
    description: 'Completed your first Armenian lesson',
    icon: '📚',
    category: 'learning',
    requirements: { type: 'lessonsCompleted', target: 1 },
    unlocked: false
  },
  {
    id: 'language_student',
    title: 'Dedicated Student',
    description: 'Completed 5 Armenian lessons',
    icon: '🎓',
    category: 'learning',
    requirements: { type: 'lessonsCompleted', target: 5 },
    unlocked: false
  },
  {
    id: 'streak_week',
    title: 'Weekly Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    category: 'learning',
    requirements: { type: 'currentStreak', target: 7 },
    unlocked: false
  },
  {
    id: 'cultural_explorer',
    title: 'Cultural Explorer',
    description: 'Viewed 10 Armenian cultural events',
    icon: '🏛️',
    category: 'cultural',
    requirements: { type: 'calendarEventsViewed', target: 10 },
    unlocked: false
  },
  {
    id: 'theme_master',
    title: 'Style Master',
    description: 'Tried 3 different themes',
    icon: '🎨',
    category: 'customization',
    requirements: { type: 'themesUsed', target: 3 },
    unlocked: false
  },
  {
    id: 'power_user',
    title: 'Power User',
    description: 'Explored all major features',
    icon: '⚡',
    category: 'usage',
    requirements: { type: 'featuresExplored', target: 6 },
    unlocked: false
  }
];

export class ProgressManager {
  private progress: UserProgress;
  private achievements: Achievement[];

  constructor() {
    this.progress = this.loadProgress();
    this.achievements = this.loadAchievements();
    this.startSession();
  }

  // Load/Save Progress
  private loadProgress(): UserProgress {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultProgress, ...parsed };
      }
    } catch (error) {
      console.warn('Could not load progress:', error);
    }
    return { ...defaultProgress };
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.warn('Could not save progress:', error);
    }
  }

  private loadAchievements(): Achievement[] {
    try {
      const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load achievements:', error);
    }
    return [...achievements];
  }

  private saveAchievements(): void {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.warn('Could not save achievements:', error);
    }
  }

  // Session Management
  private startSession(): void {
    const now = new Date().toISOString();
    localStorage.setItem(SESSION_START_KEY, now);
    this.progress.usage.lastActiveDate = now;
    
    // Check for new day
    const lastActive = new Date(this.progress.usage.lastActiveDate);
    const today = new Date();
    if (lastActive.toDateString() !== today.toDateString()) {
      this.progress.usage.activeDays += 1;
    }
    
    this.saveProgress();
  }

  public endSession(): void {
    const sessionStart = localStorage.getItem(SESSION_START_KEY);
    if (sessionStart) {
      const sessionTime = (Date.now() - new Date(sessionStart).getTime()) / (1000 * 60); // minutes
      this.progress.usage.totalSessionTime += sessionTime;
      this.saveProgress();
    }
  }

  // Learning Progress
  public updateLessonProgress(lessonId: string, completed: boolean, timeSpent: number = 0, score: number = 100): void {
    if (!this.progress.learning.lessonProgress[lessonId]) {
      this.progress.learning.lessonProgress[lessonId] = {
        completed: false,
        timeSpent: 0,
        score: 0,
        attempts: 0,
        lastAttempt: new Date().toISOString()
      };
    }

    const lessonProgress = this.progress.learning.lessonProgress[lessonId];
    lessonProgress.attempts += 1;
    lessonProgress.timeSpent += timeSpent;
    lessonProgress.lastAttempt = new Date().toISOString();

    if (completed && !lessonProgress.completed) {
      lessonProgress.completed = true;
      lessonProgress.score = Math.max(lessonProgress.score, score);
      this.progress.learning.lessonsCompleted.push(lessonId);
      this.progress.learning.totalTimeSpent += timeSpent;
      
      // Update streak
      this.updateLearningStreak();
    }

    this.checkAchievements();
    this.saveProgress();
  }

  private updateLearningStreak(): void {
    const today = new Date().toDateString();
    const lastStudy = this.progress.learning.lastStudyDate;
    
    if (lastStudy === today) {
      // Already studied today
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudy === yesterday.toDateString()) {
      // Consecutive day
      this.progress.learning.currentStreak += 1;
    } else if (lastStudy === '') {
      // First study session
      this.progress.learning.currentStreak = 1;
    } else {
      // Streak broken
      this.progress.learning.currentStreak = 1;
    }
    
    this.progress.learning.longestStreak = Math.max(
      this.progress.learning.longestStreak,
      this.progress.learning.currentStreak
    );
    
    this.progress.learning.lastStudyDate = today;
  }

  // Chat Progress
  public updateChatProgress(newMessage: boolean = false, newChat: boolean = false): void {
    if (newChat) {
      this.progress.chat.totalChats += 1;
    }
    if (newMessage) {
      this.progress.chat.totalMessages += 1;
    }
    
    this.checkAchievements();
    this.saveProgress();
  }

  // Cultural Progress
  public updateCulturalProgress(eventId?: string, topic?: string): void {
    if (eventId && !this.progress.cultural.calendarEventsViewed.includes(eventId)) {
      this.progress.cultural.calendarEventsViewed.push(eventId);
    }
    
    if (topic && !this.progress.cultural.culturalTopicsExplored.includes(topic)) {
      this.progress.cultural.culturalTopicsExplored.push(topic);
    }
    
    this.checkAchievements();
    this.saveProgress();
  }

  // Customization Progress
  public updateCustomizationProgress(theme?: string, feature?: string): void {
    if (theme) {
      this.progress.customization.preferredTheme = theme;
      if (!this.progress.customization.themesUsed.includes(theme)) {
        this.progress.customization.themesUsed.push(theme);
        this.progress.customization.customizationsApplied += 1;
      }
    }
    
    if (feature && !this.progress.customization.accessibilityFeaturesUsed.includes(feature)) {
      this.progress.customization.accessibilityFeaturesUsed.push(feature);
    }
    
    this.checkAchievements();
    this.saveProgress();
  }

  // Feature Usage
  public trackFeatureUsage(feature: string): void {
    if (!this.progress.usage.featuresExplored.includes(feature)) {
      this.progress.usage.featuresExplored.push(feature);
    }
    
    this.checkAchievements();
    this.saveProgress();
  }

  // Achievement System
  private checkAchievements(): void {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let currentValue = 0;
        
        switch (achievement.requirements.type) {
          case 'totalChats':
            currentValue = this.progress.chat.totalChats;
            break;
          case 'lessonsCompleted':
            currentValue = this.progress.learning.lessonsCompleted.length;
            break;
          case 'currentStreak':
            currentValue = this.progress.learning.currentStreak;
            break;
          case 'calendarEventsViewed':
            currentValue = this.progress.cultural.calendarEventsViewed.length;
            break;
          case 'themesUsed':
            currentValue = this.progress.customization.themesUsed.length;
            break;
          case 'featuresExplored':
            currentValue = this.progress.usage.featuresExplored.length;
            break;
        }
        
        achievement.requirements.current = currentValue;
        
        if (currentValue >= achievement.requirements.target) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date().toISOString();
          this.progress.usage.achievements.push(achievement.id);
          
          // Show achievement notification
          this.showAchievementNotification(achievement);
        }
      }
    });
    
    this.saveAchievements();
  }

  private showAchievementNotification(achievement: Achievement): void {
    // Create a custom event for achievement unlocked
    const event = new CustomEvent('achievementUnlocked', {
      detail: achievement
    });
    window.dispatchEvent(event);
  }

  // Reset Functions
  public resetLearningProgress(): void {
    this.progress.learning = {
      lessonsCompleted: [],
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: '',
      lessonProgress: {}
    };
    this.saveProgress();
  }

  public resetAllProgress(): void {
    this.progress = { ...defaultProgress };
    this.achievements = [...achievements];
    this.saveProgress();
    this.saveAchievements();
  }

  // Getters
  public getProgress(): UserProgress {
    return { ...this.progress };
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getLearningStats() {
    return {
      completedLessons: this.progress.learning.lessonsCompleted.length,
      totalTimeSpent: this.progress.learning.totalTimeSpent,
      currentStreak: this.progress.learning.currentStreak,
      longestStreak: this.progress.learning.longestStreak,
      averageScorePerLesson: this.getAverageScore()
    };
  }

  private getAverageScore(): number {
    const completedLessons = Object.values(this.progress.learning.lessonProgress)
      .filter(lesson => lesson.completed);
    
    if (completedLessons.length === 0) return 0;
    
    const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0);
    return Math.round(totalScore / completedLessons.length);
  }

  public getChatStats() {
    return {
      totalChats: this.progress.chat.totalChats,
      totalMessages: this.progress.chat.totalMessages,
      averageMessagesPerChat: this.progress.chat.totalChats > 0 
        ? Math.round(this.progress.chat.totalMessages / this.progress.chat.totalChats)
        : 0,
      favoriteMessages: this.progress.chat.favoriteMessages
    };
  }

  public getUsageStats() {
    return {
      totalSessionTime: Math.round(this.progress.usage.totalSessionTime),
      activeDays: this.progress.usage.activeDays,
      featuresExplored: this.progress.usage.featuresExplored.length,
      achievements: this.progress.usage.achievements.length
    };
  }
}

// Global instance
export const progressManager = new ProgressManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  progressManager.endSession();
});
