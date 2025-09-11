"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Star, Eye, Clock } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  showProgress?: boolean;
}

interface FloatingStatsCardsProps {
  waveOffset: number;
  floatingCards: boolean;
}

/**
 * Component that displays animated floating statistics cards with ocean theme.
 * @param {object} props
 * @param {number} props.waveOffset - Current wave animation offset
 * @param {boolean} props.floatingCards - Whether cards should float/animate
 */
export function FloatingStatsCards({
  waveOffset,
  floatingCards,
}: FloatingStatsCardsProps) {
  const oceanStats: StatCard[] = [
    {
      title: "Learning Depth",
      value: "75%",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50/80 backdrop-blur-sm",
      borderColor: "border-blue-200/50",
      description: "Deep dive progress",
      showProgress: true,
    },
    {
      title: "Knowledge Cards",
      value: "24",
      icon: <Star className="h-6 w-6 text-cyan-600" />,
      color: "from-cyan-400 to-cyan-600",
      bgColor: "bg-cyan-50/80 backdrop-blur-sm",
      borderColor: "border-cyan-200/50",
      description: "Swimming in knowledge",
    },
    {
      title: "Milestones Reached",
      value: "3",
      icon: <Eye className="h-6 w-6 text-indigo-600" />,
      color: "from-indigo-400 to-indigo-600",
      bgColor: "bg-indigo-50/80 backdrop-blur-sm",
      borderColor: "border-indigo-200/50",
      description: "Guiding your journey",
    },
    {
      title: "Study Time",
      value: "12h",
      icon: <Clock className="h-6 w-6 text-teal-600" />,
      color: "from-teal-400 to-teal-600",
      bgColor: "bg-teal-50/80 backdrop-blur-sm",
      borderColor: "border-teal-200/50",
      description: "Sailing through content",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {oceanStats.map((stat, index) => (
        <Card
          key={index}
          className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-xl transition-all duration-500 ${
            floatingCards ? "animate-float" : ""
          }`}
          style={{
            animationDelay: `${index * 0.2}s`,
            transform: floatingCards
              ? `translateY(${Math.sin(waveOffset * 0.1 + index) * 5}px)`
              : "translateY(0)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
              >
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">{stat.description}</p>
            {stat.showProgress && (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Depth</span>
                  <span className="font-medium text-slate-900">75%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
