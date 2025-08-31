import { Target, CheckCircle, TrendingUp, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalTests: number;
  completedTests: number;
  averageScore: number;
}

export function StatsCards({
  totalTests,
  completedTests,
  averageScore,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Quizzes",
      value: totalTests,
      icon: Target,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Completed",
      value: completedTests,
      icon: CheckCircle,
      color: "from-green-400 to-green-600",
    },
    {
      title: "Avg Score",
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Streak",
      value: "3",
      icon: Flame,
      color: "from-orange-400 to-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-r ${stat.color} text-white`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
