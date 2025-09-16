"use client";

import { useParams, useRouter } from "next/navigation";
import { FlashcardCarousel } from "@/features/flashcards/components/FlashcardCarousel";
import type { FlashcardSet } from "@/features/flashcards/types";
import { useEffect, useState } from "react";
import { axiosGeneration } from "@/lib/axios";

export default function FlashcardSetCarouselPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const setIdParam = params.setId as string;
  const setId = Number(setIdParam);
  const isMockSet = setIdParam.startsWith('mock_');

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        setIsLoading(true);
        
        if (isMockSet) {
          // Handle mock flashcard set
          const mockFlashcardSet: FlashcardSet = {
            id: 999999, // Use a high number to avoid conflicts
            title: "Mock Flashcard Set",
            description: "Sample flashcard set for testing",
            owner: parseInt(projectId),
            difficulty_level: 'INTERMEDIATE' as const,
            target_audience: 'Students',
            estimated_study_time: 15,
            tags: ['mock', 'test'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            flashcard_count: 3,
            is_public: false,
            study_stats: {
              total_cards: 3,
              due_cards: 3,
              mastered_cards: 0,
              learning_cards: 0,
              review_cards: 0,
              retention_rate: 0,
              streak_days: 0,
              next_review: '2024-01-01T00:00:00Z'
            },
            flashcards: [
              {
                id: 1,
                question: 'What is the capital of France?',
                answer: 'Paris',
                concept_id: 'geography-capitals',
                difficulty: 'BEGINNER' as const,
                bloom_level: 'remember' as const,
                card_type: 'definition' as const,
                related_concepts: ['France', 'European capitals'],
                hints: ['Think of the City of Light'],
                examples: ['France is a country in Western Europe'],
                common_misconceptions: ['Some think it might be Lyon or Marseille'],
                learning_objective: 'Identify European capitals',
                tags: ['geography', 'capitals'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                algorithm: 'sm2' as const,
                learning_state: 'new' as const,
                interval: 1,
                repetitions: 0,
                ease_factor: 2.5,
                leitner_box: 1,
                next_review: new Date().toISOString(),
                total_reviews: 0,
                correct_reviews: 0,
                metrics: {},
                flashcard_set: {} as FlashcardSet, // Circular reference, will be set below
                accuracy_rate: 0,
                is_overdue: false,
                is_due: true,
                days_until_due: 0,
                retention_rate: 0,
                memory_strength: 0
              },
              {
                id: 2,
                question: 'What is 2 + 2?',
                answer: '4',
                concept_id: 'math-arithmetic',
                difficulty: 'BEGINNER' as const,
                bloom_level: 'remember' as const,
                card_type: 'question' as const,
                related_concepts: ['addition', 'basic math'],
                hints: ['Count on your fingers'],
                examples: ['2 + 2 = 4'],
                common_misconceptions: ['Some might think it equals 22'],
                learning_objective: 'Perform basic arithmetic',
                tags: ['math', 'arithmetic'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                algorithm: 'sm2' as const,
                learning_state: 'new' as const,
                interval: 1,
                repetitions: 0,
                ease_factor: 2.5,
                leitner_box: 1,
                next_review: new Date().toISOString(),
                total_reviews: 0,
                correct_reviews: 0,
                metrics: {},
                flashcard_set: {} as FlashcardSet,
                accuracy_rate: 0,
                is_overdue: false,
                is_due: true,
                days_until_due: 0,
                retention_rate: 0,
                memory_strength: 0
              },
              {
                id: 3,
                question: 'Who wrote Romeo and Juliet?',
                answer: 'William Shakespeare',
                concept_id: 'literature-shakespeare',
                difficulty: 'INTERMEDIATE' as const,
                bloom_level: 'remember' as const,
                card_type: 'definition' as const,
                related_concepts: ['Shakespeare', 'English literature', 'tragedy'],
                hints: ['Famous English playwright from the 16th century'],
                examples: ['He also wrote Hamlet and Macbeth'],
                common_misconceptions: ['Some might think it was Christopher Marlowe'],
                learning_objective: 'Identify famous literary works and their authors',
                tags: ['literature', 'shakespeare'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                algorithm: 'sm2' as const,
                learning_state: 'new' as const,
                interval: 1,
                repetitions: 0,
                ease_factor: 2.5,
                leitner_box: 1,
                next_review: new Date().toISOString(),
                total_reviews: 0,
                correct_reviews: 0,
                metrics: {},
                flashcard_set: {} as FlashcardSet,
                accuracy_rate: 0,
                is_overdue: false,
                is_due: true,
                days_until_due: 0,
                retention_rate: 0,
                memory_strength: 0
              }
            ]
          };
          
          // Set circular references
          mockFlashcardSet.flashcards?.forEach(card => {
            card.flashcard_set = mockFlashcardSet;
          });
          
          setFlashcardSet(mockFlashcardSet);
        } else {
          // Handle real flashcard set - use authenticated generation client
          const res = await axiosGeneration.get<FlashcardSet>(`/projects/${projectId}/flashcard-sets/${setId}/`);
          setFlashcardSet(res.data);
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to load flashcard set");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!Number.isNaN(setId) || isMockSet) {
      fetchSet();
    }
  }, [setId, setIdParam, isMockSet, projectId]);

  if (!isMockSet && Number.isNaN(setId)) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !flashcardSet) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-red-600">
        {error ?? "Flashcard set not found"}
      </div>
    );
  }

  return (
    <FlashcardCarousel
      flashcardSet={flashcardSet}
      projectId={projectId}
      onBack={() => router.push(`/projects/${projectId}/flashcards`)}
      onEditCard={() => {}}
      onDiscardCard={() => {}}
      onAddCard={() => {}}
      onViewAll={() => {}}
    />
  );
}


