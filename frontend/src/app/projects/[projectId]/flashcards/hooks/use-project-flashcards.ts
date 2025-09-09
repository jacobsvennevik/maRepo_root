import { useState, useEffect } from "react";
import { axiosApi } from "@/lib/axios-api";
import { axiosGeneration } from "@/lib/axios-generation";
import axios from "axios";
import { 
  unwrapFlashcardSets, 
  refreshFlashcardSets, 
  calculateFlashcardStats,
  type FlashcardSetApi 
} from "../utils/data-transformation";

export interface FlashcardSet extends FlashcardSetApi {}

export interface FlashcardStats {
  total_sets: number;
  total_cards: number;
  due_today: number;
  learning_cards: number;
  mastered_cards: number;
  average_accuracy: number;
}

export interface DueCardsResponse {
  project_id: string;
  total_cards: number;
  due_cards: number;
  learning_cards: number;
  session_cards: any[];
  session_start: string;
}

export function useProjectFlashcards(projectId: string) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [stats, setStats] = useState<FlashcardStats>({
    total_sets: 0,
    total_cards: 0,
    due_today: 0,
    learning_cards: 0,
    mastered_cards: 0,
    average_accuracy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    const sets = await refreshFlashcardSets(projectId);
    setFlashcardSets(sets);
    setStats(calculateFlashcardStats(sets));
  };

  useEffect(() => {
    // Removed AbortController signal to avoid XHR network errors on some browsers during fast route changes
    
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await refreshData();
      } catch (err: any) {
        // Don't set error if request was aborted or canceled
        if (err.name === 'AbortError' || axios.isCancel?.(err) || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        
        console.error("Failed to fetch project flashcards:", err);
        
        // Check if it's a network/connection error
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || !err.response) {
          setError("Cannot connect to server. Please check your connection.");
        } else {
          setError(err.response?.data?.error || "Failed to load flashcards");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchFlashcards();
    }

    // No cleanup needed for simple GET without an abort signal
    return () => {};
  }, [projectId]);

  const createFlashcardSet = async (title: string) => {
    try {
      const response = await axiosApi.post(
        `/projects/${projectId}/flashcard-sets/`,
        { title },
      );
      await refreshData();
      return response.data;
    } catch (err: any) {
      console.error("Failed to create flashcard set:", err);
      throw new Error(err.response?.data?.error || "Failed to create flashcard set");
    }
  };

  const generateFlashcards = async (
    sourceType: string,
    numCards: number = 10,
    difficulty: string = "medium",
  ) => {
    try {
      const response = await axiosGeneration.post(
        `/projects/${projectId}/flashcards/generate/`,
        {
          source_type: sourceType,
          num_cards: numCards,
          difficulty: difficulty,
        },
      );
      await refreshData();
      return response.data;
    } catch (err: any) {
      console.error("Failed to generate flashcards:", err);
      throw new Error(err.response?.data?.error || "Failed to generate flashcards");
    }
  };

  const getDueCards = async (
    limit: number = 20,
    algorithm?: string,
  ): Promise<DueCardsResponse> => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (algorithm) {
        params.append("algorithm", algorithm);
      }

      const response = await axiosGeneration.get(
        `/projects/${projectId}/flashcards/due/?${params}`,
      );
      return response.data;
    } catch (err: any) {
      console.error("Failed to get due cards:", err);
      throw new Error(err.response?.data?.error || "Failed to get due cards");
    }
  };

  const submitReview = async (
    flashcardId: number,
    quality: number,
    responseTimeSeconds?: number,
  ) => {
    try {
      const response = await axiosApi.post(
        `/flashcards/${flashcardId}/review/`,
        {
          quality,
          response_time_seconds: responseTimeSeconds,
        },
      );
      await refreshData();
      return response.data;
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      throw new Error(err.response?.data?.error || "Failed to submit review");
    }
  };

  const submitBulkReviews = async (
    reviews: Array<{
      flashcardId: number;
      quality: number;
      responseTimeSeconds?: number;
    }>,
  ) => {
    try {
      const reviewsData = reviews.map((review) => ({
        flashcard_id: review.flashcardId,
        quality: review.quality,
        response_time_seconds: review.responseTimeSeconds || 0,
      }));

      const response = await axiosApi.post(
        `/flashcards/reviews/`,
        { reviews: reviewsData },
      );
      await refreshData();
      return response.data;
    } catch (err: any) {
      console.error("Failed to submit bulk reviews:", err);
      throw new Error(err.response?.data?.error || "Failed to submit bulk reviews");
    }
  };

  return {
    flashcardSets,
    stats,
    isLoading,
    error,
    createFlashcardSet,
    generateFlashcards,
    getDueCards,
    submitReview,
    submitBulkReviews,
  };
}
