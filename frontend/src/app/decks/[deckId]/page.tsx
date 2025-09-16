"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FlashcardCarousel } from "@/features/flashcards/components/FlashcardCarousel";
import type { FlashcardSet } from "@/features/flashcards/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function DeckCarouselPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdParam = params.deckId as string;
  const deckId = Number(deckIdParam);

  const [deck, setDeck] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backHref = useMemo(() => {
    const from = searchParams?.get("from");
    return (from || "/projects") as any;
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchDeck = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reuse backend endpoint already used elsewhere in the app
        const res = await fetch(`/backend/generation/api/flashcards/sets/${deckId}/`);
        if (!res.ok) {
          throw new Error("Deck not found");
        }
        const data = (await res.json()) as FlashcardSet;
        if (isMounted) setDeck(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load deck");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (!Number.isNaN(deckId)) fetchDeck();
    return () => {
      isMounted = false;
    };
  }, [deckId]);

  if (Number.isNaN(deckId)) return null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <Card>
          <CardContent className="p-12">
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href={backHref} aria-label="Back to Decks">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Decks
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-4">
          {error ?? "Deck not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="px-0 h-auto text-sm text-gray-600">
                <Link href={backHref} aria-label="Back to Decks">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Decks
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{deck.title}</h1>
            {deck.description && (
              <p className="text-gray-600 mt-1">{deck.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Carousel */}
      <FlashcardCarousel
        flashcardSet={deck}
        onBack={() => router.push(backHref)}
        onEditCard={() => {}}
        onDiscardCard={() => {}}
        onAddCard={() => {}}
        onViewAll={() => {}}
      />
    </div>
  );
}



