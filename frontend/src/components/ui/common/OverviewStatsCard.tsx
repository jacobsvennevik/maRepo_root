import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface OverviewStatsCardProps {
  // Top row left: can be custom content or simple stats list
  leftContent?: ReactNode;
  // Right pill value/label
  rightValue: ReactNode;
  rightLabel: string;
  // Grid items: 4 cells following the flashcards/tests style
  gridItems: Array<{
    icon: ReactNode;
    value: ReactNode;
    label: string;
  }>;
  gradientFromToClassName?: string; // e.g. "from-blue-50 to-purple-50/80"
}

export function OverviewStatsCard({
  leftContent,
  rightValue,
  rightLabel,
  gridItems,
  gradientFromToClassName = "from-blue-50 to-purple-50/80",
}: OverviewStatsCardProps) {
  return (
    <Card className={`bg-gradient-to-r ${gradientFromToClassName} backdrop-blur-sm border-blue-200/50`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-left">
            {leftContent}
          </div>
          <div className="text-right">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">{rightValue}</div>
                <div className="text-xs">{rightLabel}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {gridItems.map((item, idx) => (
            <div key={idx} className="text-center p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="text-xs text-slate-600">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


