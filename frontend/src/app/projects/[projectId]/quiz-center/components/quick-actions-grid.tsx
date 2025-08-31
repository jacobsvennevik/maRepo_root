import { Plus, Brain, Upload, Target, BarChart3, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickActions = [
  {
    title: "Create New Quiz",
    description: "Build custom quizzes from scratch",
    icon: Plus,
    color: "from-green-400 to-green-600",
    action: "create",
  },
  {
    title: "Auto-Generate",
    description: "From your flashcards",
    icon: Brain,
    color: "from-purple-400 to-purple-600",
    action: "auto-generate",
  },
  {
    title: "Import Quiz",
    description: "Upload existing quizzes",
    icon: Upload,
    color: "from-blue-400 to-blue-600",
    action: "import",
  },
  {
    title: "Practice by Topic",
    description: "Focus on specific areas",
    icon: Target,
    color: "from-orange-400 to-orange-600",
    action: "practice",
  },
  {
    title: "Analytics",
    description: "View performance trends",
    icon: BarChart3,
    color: "from-emerald-400 to-emerald-600",
    action: "analytics",
  },
  {
    title: "Achievements",
    description: "Track your progress",
    icon: Trophy,
    color: "from-pink-400 to-pink-600",
    action: "achievements",
  },
];

interface QuickActionsGridProps {
  onAction: (action: string) => void;
}

export function QuickActionsGrid({ onAction }: QuickActionsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <Card
          key={index}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onAction(action.action)}
        >
          <CardContent className="p-6 text-center">
            <div
              className={`p-4 rounded-xl bg-gradient-to-r ${action.color} mx-auto w-16 h-16 flex items-center justify-center mb-4`}
            >
              <action.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              {action.title}
            </h3>
            <p className="text-sm text-slate-600">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
