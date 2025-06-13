'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Brain, BookOpen, Sparkles, Zap, Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingCards } from './components';
import { useFloatingAnimation } from './components/use-floating-animation';

export default function ProjectFlashcards() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { waveOffset, floatingCards } = useFloatingAnimation();

  return (
    <div className="relative">
      <div className="relative space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/projects" className="hover:text-emerald-600">Projects</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-900">Flashcards</span>
        </div>

        {/* New Heading Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50/80 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Biology 101 Flashcards</h1>
                    <p className="text-slate-600">Master your knowledge with interactive learning</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>24 Total Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>5 Topics Covered</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs">Mastered</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Ready to dive deeper?</h3>
                <p className="text-sm text-slate-600">Generate new flashcards or review existing ones</p>
              </div>
              <div className="flex gap-3">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Review
                </Button>
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Cards */}
        <div className="space-y-8">
          <FloatingCards waveOffset={waveOffset} floatingCards={floatingCards} />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 