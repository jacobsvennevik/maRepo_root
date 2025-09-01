"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Brain,
  BookOpen,
  Sparkles,
  Zap,
  Plus,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectFlashcards } from "./hooks/use-project-flashcards";
import { ProjectFlashcardStats } from "./components/project-flashcard-stats";
import { QuickActions } from "./components/quick-actions";

export default function ProjectFlashcards() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { flashcardSets, stats, isLoading, error } =
    useProjectFlashcards(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading flashcards: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="space-y-3">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <Link href="/projects" className="hover:text-emerald-600">
            Projects
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link
            href={`/projects/${projectId}`}
            className="hover:text-emerald-600"
          >
            Project
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-900">Flashcards</span>
        </div>

        {/* Page Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Project Flashcards
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Master your knowledge with interactive learning
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions projectId={projectId} />

        {/* Flashcard Sets */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Your Flashcard Sets
                </h3>
                <p className="text-sm text-slate-600">
                  Manage and study your flashcard collections
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Link href={`/projects/${projectId}/flashcards/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Set
                </Link>
              </Button>
            </div>

            {flashcardSets.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No flashcard sets yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Create your first flashcard set to start studying
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcardSets.map((set) => (
                  <Card
                    key={set.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-slate-900">
                          {set.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <BookOpen className="h-3 w-3" />
                          <span>{set.total_cards}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Due today:</span>
                          <span className="font-medium text-orange-600">
                            {set.due_cards}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Learning:</span>
                          <span className="font-medium text-blue-600">
                            {set.learning_cards}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Accuracy:</span>
                          <span className="font-medium text-green-600">
                            {set.average_accuracy.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        >
                          <Link
                            href={`/projects/${projectId}/flashcards/${set.id}/study`}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Study
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={`/projects/${projectId}/flashcards/${set.id}`}
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Dashboard - Moved to bottom */}
        <ProjectFlashcardStats stats={stats} />

        {/* Floating Cards Animation - Removed as no longer needed */}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
