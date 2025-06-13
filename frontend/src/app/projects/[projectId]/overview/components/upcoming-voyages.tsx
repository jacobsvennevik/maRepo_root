'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from 'lucide-react';

interface VoyageItem {
  id: number;
  destination: string;
  due: string;
  priority: string;
  depth: string;
}

interface UpcomingVoyagesProps {
  waveOffset: number;
  floatingCards: boolean;
}

export function UpcomingVoyages({ waveOffset, floatingCards }: UpcomingVoyagesProps) {
  const upcomingVoyages: VoyageItem[] = [
    { id: 1, destination: "Review Chapter 5 concepts", due: "Today", priority: "high", depth: "Deep waters" },
    { id: 2, destination: "Navigate practice test", due: "Tomorrow", priority: "medium", depth: "Medium depth" },
    { id: 3, destination: "Explore research paper", due: "In 2 days", priority: "low", depth: "Shallow waters" }
  ];

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'Deep waters': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Medium depth': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Shallow waters': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm border-cyan-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-cyan-600" />
          Upcoming Voyages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingVoyages.map((voyage, index) => (
            <div 
              key={voyage.id} 
              className="p-4 rounded-lg border border-cyan-200/50 hover:border-cyan-300 transition-colors duration-300 cursor-pointer group bg-gradient-to-r from-cyan-50/50 to-blue-50/50"
              style={{
                animationDelay: `${index * 0.15}s`,
                transform: floatingCards ? `translateY(${Math.sin(waveOffset * 0.08 + index) * 2}px)` : 'translateY(0)'
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-slate-900 group-hover:text-cyan-600 transition-colors">
                  {voyage.destination}
                </p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDepthColor(voyage.depth)}`}>
                  {voyage.priority}
                </div>
              </div>
              <p className="text-xs text-slate-500">Due: {voyage.due}</p>
              <p className="text-xs text-cyan-600 mt-1">{voyage.depth}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 