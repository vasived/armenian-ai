import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Volume2,
  Award,
  Brain,
  Heart,
  Coffee,
  Users,
  RotateCcw,
  Trash2,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { cn } from "@/lib/utils";
import { progressManager } from "@/lib/progressManager";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  category: 'basics' | 'family' | 'culture' | 'business' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  description: string;
  completed: boolean;
  phrases: Array<{
    armenian: string;
    english: string;
    pronunciation: string;
  }>;
  culturalNote?: string;
}

interface LearningModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const lessons: Lesson[] = [
  {
    id: 'basics-1',
    title: 'Essential Greetings',
    category: 'basics',
    difficulty: 'beginner',
    duration: 10,
    description: 'Learn the most common Armenian greetings and polite expressions.',
    completed: false,
    phrases: [
      { armenian: 'Parev', english: 'Hello', pronunciation: 'pah-REV' },
      { armenian: 'Inch bes', english: 'How are you?', pronunciation: 'inch BESS' },
      { armenian: 'Lav em', english: 'I am good', pronunciation: 'lahv em' },
      { armenian: 'Shnorhakaloutyoun', english: 'Thank you', pronunciation: 'shnor-ha-ga-loo-TYOON' },
      { armenian: 'Knerek', english: 'Please/You\'re welcome', pronunciation: 'k-neh-REHK' }
    ],
    culturalNote: 'Armenian greetings are warm and personal. "Parev" can be used at any time of day.'
  },
  {
    id: 'family-1',
    title: 'Family Members',
    category: 'family',
    difficulty: 'beginner',
    duration: 15,
    description: 'Essential family vocabulary for Armenian conversations.',
    completed: false,
    phrases: [
      { armenian: 'Mama', english: 'Mother', pronunciation: 'mah-MAH' },
      { armenian: 'Haba', english: 'Father', pronunciation: 'hah-BAH' },
      { armenian: 'Yeghbayr', english: 'Brother', pronunciation: 'yeh-gh-BAYR' },
      { armenian: 'Khoyr', english: 'Sister', pronunciation: 'khoyr' },
      { armenian: 'Tatik', english: 'Grandmother', pronunciation: 'tah-TEEK' },
      { armenian: 'Babik', english: 'Grandfather', pronunciation: 'bah-BEEK' }
    ],
    culturalNote: 'Family is central to Armenian culture. These terms are used with great respect and affection.'
  },
  {
    id: 'culture-1',
    title: 'Food & Hospitality',
    category: 'culture',
    difficulty: 'intermediate',
    duration: 20,
    description: 'Learn about Armenian food culture and hospitality expressions.',
    completed: false,
    phrases: [
      { armenian: 'Bari galust', english: 'Welcome', pronunciation: 'bah-ree gah-LOOST' },
      { armenian: 'Keretsek', english: 'Let\'s eat', pronunciation: 'keh-reh-TSEK' },
      { armenian: 'Hamov e', english: 'It\'s delicious', pronunciation: 'hah-MOV eh' },
      { armenian: 'Aghbarig', english: 'Cheers/To your health', pronunciation: 'ahgh-bah-REEG' },
      { armenian: 'Shad lav e', english: 'Very good', pronunciation: 'shahd lahv eh' }
    ],
    culturalNote: 'Armenian hospitality is legendary. Refusing food or drink can be considered impolite.'
  },
  {
    id: 'business-1',
    title: 'Professional Conversations',
    category: 'business',
    difficulty: 'intermediate',
    duration: 25,
    description: 'Business and professional vocabulary for workplace interactions.',
    completed: false,
    phrases: [
      { armenian: 'Gorts', english: 'Work/Job', pronunciation: 'gorts' },
      { armenian: 'Khosnag', english: 'Meeting', pronunciation: 'khoss-NAHG' },
      { armenian: 'Tsragir', english: 'Project', pronunciation: 'tsrah-GEER' },
      { armenian: 'Hajoghutyan', english: 'Success', pronunciation: 'hah-jo-ghoo-TYAHN' },
      { armenian: 'Ashkhadank', english: 'Let\'s work', pronunciation: 'ahsh-khah-DAHNK' }
    ],
    culturalNote: 'Armenians value hard work and professional relationships. Building trust is essential in business.'
  },
  {
    id: 'advanced-1',
    title: 'Expressing Emotions',
    category: 'advanced',
    difficulty: 'advanced',
    duration: 30,
    description: 'Advanced expressions for emotions and complex feelings.',
    completed: false,
    phrases: [
      { armenian: 'Sirem kez', english: 'I love you', pronunciation: 'see-rem kehz' },
      { armenian: 'Karevor e', english: 'It\'s important', pronunciation: 'kah-reh-vor eh' },
      { armenian: 'Nayinch', english: 'Homesickness', pronunciation: 'nah-YINCH' },
      { armenian: 'Hpardutyan', english: 'Pride', pronunciation: 'h-par-doo-TYAHN' },
      { armenian: 'Hogebantsutyun', english: 'Spirituality', pronunciation: 'ho-geh-ban-tsoo-TYOON' }
    ],
    culturalNote: 'Armenians are deeply emotional people. These expressions help convey the depth of Armenian feelings.'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'basics': return <Star className="h-4 w-4" />;
    case 'family': return <Heart className="h-4 w-4" />;
    case 'culture': return <Coffee className="h-4 w-4" />;
    case 'business': return <Users className="h-4 w-4" />;
    case 'advanced': return <Brain className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'basics': return 'bg-blue-500';
    case 'family': return 'bg-red-500';
    case 'culture': return 'bg-orange-500';
    case 'business': return 'bg-green-500';
    case 'advanced': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const LearningMode = ({ open, onOpenChange }: LearningModeProps) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState<Date | null>(null);
  const [phraseScores, setPhraseScores] = useState<number[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  // Get progress from progressManager
  const learningStats = progressManager.getLearningStats();
  const userProgress = progressManager.getProgress();

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.learning.lessonProgress[lessonId]?.completed || false;
  };

  const getLessonAttempts = (lessonId: string) => {
    return userProgress.learning.lessonProgress[lessonId]?.attempts || 0;
  };

  const getLessonScore = (lessonId: string) => {
    return userProgress.learning.lessonProgress[lessonId]?.score || 0;
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentPhraseIndex(0);
    setShowTranslation(false);
    setLessonStartTime(new Date());
    setPhraseScores([]);

    // Track feature usage
    progressManager.trackFeatureUsage('learning_mode');
  };

  const nextPhrase = () => {
    if (selectedLesson && currentPhraseIndex < selectedLesson.phrases.length - 1) {
      // Score the current phrase (better score if translation wasn't shown immediately)
      const score = showTranslation ? 70 : 100;
      setPhraseScores(prev => [...prev, score]);

      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setShowTranslation(false);
    }
  };

  const prevPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex(currentPhraseIndex - 1);
      setShowTranslation(false);
      // Remove the last score if going back
      setPhraseScores(prev => prev.slice(0, -1));
    }
  };

  const completeLesson = () => {
    if (selectedLesson && lessonStartTime) {
      // Calculate final score and time
      const finalScore = showTranslation ? 70 : 100;
      const allScores = [...phraseScores, finalScore];
      const avgScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);

      const timeSpent = Math.round((Date.now() - lessonStartTime.getTime()) / (1000 * 60)); // minutes

      // Update progress through progressManager
      progressManager.updateLessonProgress(selectedLesson.id, true, timeSpent, avgScore);

      toast({
        title: "Lesson Completed! 🎉",
        description: `Score: ${avgScore}% | Time: ${timeSpent} minutes`,
      });

      setSelectedLesson(null);
    }
  };

  const resetAllProgress = () => {
    progressManager.resetLearningProgress();
    setShowResetConfirm(false);
    toast({
      title: "Progress Reset",
      description: "All learning progress has been reset. Start fresh!",
    });
  };

  const completedLessons = learningStats.completedLessons;
  const totalLessons = lessons.length;
  const overallProgress = (completedLessons / totalLessons) * 100;

  if (selectedLesson) {
    const currentPhrase = selectedLesson.phrases[currentPhraseIndex];
    const lessonProgress = ((currentPhraseIndex + 1) / selectedLesson.phrases.length) * 100;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight 
                className="h-5 w-5 cursor-pointer" 
                onClick={() => setSelectedLesson(null)}
              />
              {selectedLesson.title}
              <Badge variant="outline">
                {currentPhraseIndex + 1} of {selectedLesson.phrases.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {/* Progress */}
            <div className="w-full max-w-md">
              <Progress value={lessonProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                Progress: {Math.round(lessonProgress)}%
              </p>
            </div>

            {/* Current Phrase */}
            <Card className="p-8 max-w-2xl w-full text-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-primary">
                    {currentPhrase.armenian}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {currentPhrase.pronunciation}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    {showTranslation ? 'Hide' : 'Show'} Translation
                  </Button>
                </div>

                {showTranslation && (
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-xl font-semibold">
                      {currentPhrase.english}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={prevPhrase}
                disabled={currentPhraseIndex === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={() => setShowTranslation(true)}
                disabled={showTranslation}
              >
                Reveal
              </Button>

              {currentPhraseIndex === selectedLesson.phrases.length - 1 ? (
                <Button
                  onClick={completeLesson}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Complete Lesson
                </Button>
              ) : (
                <Button onClick={nextPhrase}>
                  Next
                </Button>
              )}
            </div>

            {/* Cultural Note */}
            {selectedLesson.culturalNote && (
              <Card className="p-4 max-w-2xl w-full bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <ArmenianIcon className="h-5 w-5 mt-0.5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Cultural Note
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      {selectedLesson.culturalNote}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Armenian Learning Mode
              <Badge variant="secondary" className="ml-2">
                {completedLessons}/{totalLessons} completed
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-destructive hover:text-destructive gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Progress
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-destructive">Reset All Learning Progress?</h4>
                <p className="text-sm text-muted-foreground">This will delete all completed lessons and statistics.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={resetAllProgress}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedLessons}</p>
                <p className="text-sm text-muted-foreground">Lessons</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{learningStats.totalTimeSpent}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{learningStats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{learningStats.averageScorePerLesson}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Overall Progress</h3>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{Math.round(overallProgress)}% Complete</span>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Longest streak: {learningStats.longestStreak} days</span>
            <span>{totalLessons - completedLessons} lessons remaining</span>
          </div>
        </Card>

        {/* Lessons Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
            {lessons.map((lesson) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const attempts = getLessonAttempts(lesson.id);
              const score = getLessonScore(lesson.id);

              return (
                <Card
                  key={lesson.id}
                  className={cn(
                    "p-6 cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-105",
                    isCompleted && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  )}
                  onClick={() => startLesson(lesson)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg text-white",
                          getCategoryColor(lesson.category)
                        )}>
                          {getCategoryIcon(lesson.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs text-white border-0",
                                getDifficultyColor(lesson.difficulty)
                              )}
                            >
                              {lesson.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {lesson.duration}min
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Play className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Preview */}
                    <div className="bg-accent/30 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <p className="text-sm text-primary font-semibold">
                        {lesson.phrases[0].armenian}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.phrases[0].english}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {lesson.phrases.length} phrases
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
