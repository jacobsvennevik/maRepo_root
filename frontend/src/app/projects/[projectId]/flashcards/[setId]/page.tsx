"use client";

import { useParams, useRouter } from "next/navigation";
import { FlashcardCarousel } from "@/features/flashcards/components/FlashcardCarousel";
import type { FlashcardSet } from "@/features/flashcards/types";
import { useEffect, useState } from "react";

export default function FlashcardSetCarouselPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const setIdParam = params.setId as string;
  const setId = Number(setIdParam);

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/backend/generation/api/flashcards/sets/${setId}/`);
        if (!res.ok) throw new Error(`Failed to load set ${setId}`);
        const data = (await res.json()) as FlashcardSet;
        setFlashcardSet(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load flashcard set");
      } finally {
        setIsLoading(false);
      }
    };
    if (!Number.isNaN(setId)) fetchSet();
  }, [setId]);

  if (Number.isNaN(setId)) return null;

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
      onBack={() => router.push(`/projects/${projectId}/flashcards`)}
      onEditCard={() => {}}
      onDiscardCard={() => {}}
      onAddCard={() => {}}
      onViewAll={() => {}}
    />
  );
}


