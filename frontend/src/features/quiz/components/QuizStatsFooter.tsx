import { BookOpen, Sparkles, Flame, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { OverviewStatsCard } from "@/components/ui/common/OverviewStatsCard";

interface QuizStatsFooterProps {
  // Optional title above the left-side metrics (matches flashcards' "Your Progress")
  title?: string;
  totalQuizzes: number;
  averageScore: number; // 0-100
  completedCount: number;
  streakLabel?: string; // e.g., "3-day Streak"
  // Grid stats (match flashcards visual style)
  dueToday?: number;
  learningCount?: number;
  accuracyPct?: number; // mirror averageScore if not provided
  setsCount?: number; // number of sessions/sets
  pillLabel?: string; // e.g., "Completed" | "Mastered"
}

export function QuizStatsFooter({
  title = "Your Progress",
  totalQuizzes,
  averageScore,
  completedCount,
  streakLabel = "3-day Streak",
  dueToday = 0,
  learningCount = 0,
  accuracyPct,
  setsCount,
  pillLabel = "Completed",
}: QuizStatsFooterProps) {
  return (
    <OverviewStatsCard
      leftContent={(
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          )}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>{totalQuizzes} Total Quizzes</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>{averageScore}% Average Score</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{streakLabel}</span>
            </div>
          </div>
        </div>
      )}
      rightValue={completedCount}
      rightLabel={pillLabel}
      gridItems={[
        { icon: <Clock className="h-5 w-5 text-orange-600" />, value: dueToday, label: "Due Today" },
        { icon: <BookOpen className="h-5 w-5 text-blue-600" />, value: learningCount, label: "Learning" },
        { icon: <TrendingUp className="h-5 w-5 text-green-600" />, value: `${(accuracyPct ?? averageScore).toFixed(1)}%`, label: "Accuracy" },
        { icon: <BarChart3 className="h-5 w-5 text-purple-600" />, value: typeof setsCount === 'number' ? setsCount : totalQuizzes, label: "Sets" },
      ]}
    />
  );
}


