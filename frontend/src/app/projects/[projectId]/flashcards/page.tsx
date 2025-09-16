"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Brain } from "lucide-react";
import { useProjectFlashcards } from "./hooks/use-project-flashcards";
import { ProjectFlashcardStats } from "./components/project-flashcard-stats";
import { QuickActions } from "./components/quick-actions";
import { DeckGrid } from "@/features/flashcards";
import { FlashcardSet } from "@/features/flashcards/types";

export default function ProjectFlashcards() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { flashcardSets, stats, isLoading, error } =
    useProjectFlashcards(projectId);

  // Transform the data to match the new FlashcardSet interface
  const transformedDecks: FlashcardSet[] = flashcardSets.map(set => ({
    id: set.id,
    title: set.title,
    description: `Flashcard set with ${set.total_cards} cards`,
    owner: set.owner, // Keep the actual owner ID from the API
    difficulty_level: 'INTERMEDIATE' as const,
    target_audience: 'Students',
    estimated_study_time: set.total_cards * 2, // Estimate 2 minutes per card
    tags: [],
    created_at: set.created_at,
    updated_at: set.created_at, // Use created_at as updated_at fallback
    flashcard_count: set.total_cards,
    is_public: false,
    study_stats: {
      total_cards: set.total_cards,
      due_cards: set.due_cards,
      mastered_cards: set.review_cards,
      learning_cards: set.learning_cards,
      review_cards: set.review_cards,
      retention_rate: set.average_accuracy / 100,
      streak_days: 0,
      next_review: set.created_at,
    },
    flashcards: [],
    learning_objectives: [],
    themes: [],
  }));

  const handleEdit = (deck: FlashcardSet) => {
    console.log('Edit deck:', deck);
    // TODO: Implement edit functionality
  };

  const handleDelete = (deck: FlashcardSet) => {
    console.log('Delete deck:', deck);
    // TODO: Implement delete functionality
  };

  const handleShare = (deck: FlashcardSet) => {
    console.log('Share deck:', deck);
    // TODO: Implement share functionality
  };

  const handleToggleFavorite = (deck: FlashcardSet) => {
    console.log('Toggle favorite:', deck);
    // TODO: Implement favorite functionality
  };

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
        <DeckGrid
          decks={transformedDecks}
          isLoading={isLoading}
          error={error}
          projectId={projectId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShare={handleShare}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Stats Dashboard */}
        <ProjectFlashcardStats stats={stats} />
      </div>
    </div>
  );
}
