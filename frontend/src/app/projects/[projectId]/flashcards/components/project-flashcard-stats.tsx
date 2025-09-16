import { BookOpen, Clock, BarChart3, TrendingUp } from "lucide-react";
import { OverviewStatsCard } from "@/components/ui/common/OverviewStatsCard";
import { FlashcardStats } from "../hooks/use-project-flashcards";

interface ProjectFlashcardStatsProps {
  stats: FlashcardStats;
}

export function ProjectFlashcardStats({ stats }: ProjectFlashcardStatsProps) {
  return (
    <OverviewStatsCard
      leftContent={(
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Progress</h3>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>{stats.total_cards} Total Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span>{stats.total_sets} Sets</span>
            </div>
          </div>
        </div>
      )}
      rightValue={stats.mastered_cards}
      rightLabel="Mastered"
      gridItems={[
        { icon: <Clock className="h-5 w-5 text-orange-600" />, value: stats.due_today, label: "Due Today" },
        { icon: <BookOpen className="h-5 w-5 text-blue-600" />, value: stats.learning_cards, label: "Learning" },
        { icon: <TrendingUp className="h-5 w-5 text-green-600" />, value: `${stats.average_accuracy.toFixed(1)}%`, label: "Accuracy" },
        { icon: <BarChart3 className="h-5 w-5 text-purple-600" />, value: stats.total_sets, label: "Sets" },
      ]}
    />
  );
}
