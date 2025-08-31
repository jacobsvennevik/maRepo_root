import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export interface FlashcardSet {
  id: number;
  title: string;
  total_cards: number;
  due_cards: number;
  learning_cards: number;
  review_cards: number;
  new_cards: number;
  average_accuracy: number;
  created_at: string;
}

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

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch flashcard sets for the project
        const response = await axiosInstance.get(
          `/api/generation/projects/${projectId}/flashcard-sets/`,
        );
        const sets = response.data;

        setFlashcardSets(sets);

        // Calculate aggregate stats
        const totalCards = sets.reduce(
          (sum: number, set: FlashcardSet) => sum + set.total_cards,
          0,
        );
        const dueToday = sets.reduce(
          (sum: number, set: FlashcardSet) => sum + set.due_cards,
          0,
        );
        const learningCards = sets.reduce(
          (sum: number, set: FlashcardSet) => sum + set.learning_cards,
          0,
        );
        const reviewCards = sets.reduce(
          (sum: number, set: FlashcardSet) => sum + set.review_cards,
          0,
        );
        const avgAccuracy =
          sets.length > 0
            ? sets.reduce(
                (sum: number, set: FlashcardSet) => sum + set.average_accuracy,
                0,
              ) / sets.length
            : 0;

        setStats({
          total_sets: sets.length,
          total_cards: totalCards,
          due_today: dueToday,
          learning_cards: learningCards,
          mastered_cards: reviewCards, // Cards in review state are considered mastered
          average_accuracy: avgAccuracy,
        });
      } catch (err: any) {
        console.error("Failed to fetch project flashcards:", err);
        setError(err.response?.data?.error || "Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchFlashcards();
    }
  }, [projectId]);

  const createFlashcardSet = async (title: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/generation/projects/${projectId}/flashcard-sets/`,
        {
          title,
        },
      );

      // Refresh the data
      const updatedResponse = await axiosInstance.get(
        `/api/generation/projects/${projectId}/flashcard-sets/`,
      );
      setFlashcardSets(updatedResponse.data);

      return response.data;
    } catch (err: any) {
      console.error("Failed to create flashcard set:", err);
      throw new Error(
        err.response?.data?.error || "Failed to create flashcard set",
      );
    }
  };

  const generateFlashcards = async (
    sourceType: string,
    numCards: number = 10,
    difficulty: string = "medium",
  ) => {
    try {
      const response = await axiosInstance.post(
        `/api/generation/projects/${projectId}/flashcards/generate/`,
        {
          source_type: sourceType,
          num_cards: numCards,
          difficulty: difficulty,
        },
      );

      // Refresh the data
      const updatedResponse = await axiosInstance.get(
        `/api/generation/projects/${projectId}/flashcard-sets/`,
      );
      setFlashcardSets(updatedResponse.data);

      return response.data;
    } catch (err: any) {
      console.error("Failed to generate flashcards:", err);
      throw new Error(
        err.response?.data?.error || "Failed to generate flashcards",
      );
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

      const response = await axiosInstance.get(
        `/api/generation/projects/${projectId}/flashcards/due/?${params}`,
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
      const response = await axiosInstance.post(
        `/api/generation/flashcards/${flashcardId}/review/`,
        {
          quality,
          response_time_seconds: responseTimeSeconds,
        },
      );

      // Refresh stats after review
      const updatedResponse = await axiosInstance.get(
        `/api/generation/projects/${projectId}/flashcard-sets/`,
      );
      setFlashcardSets(updatedResponse.data);

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

      const response = await axiosInstance.post(
        `/api/generation/flashcards/reviews/`,
        {
          reviews: reviewsData,
        },
      );

      // Refresh stats after bulk review
      const updatedResponse = await axiosInstance.get(
        `/api/generation/projects/${projectId}/flashcard-sets/`,
      );
      setFlashcardSets(updatedResponse.data);

      return response.data;
    } catch (err: any) {
      console.error("Failed to submit bulk reviews:", err);
      throw new Error(
        err.response?.data?.error || "Failed to submit bulk reviews",
      );
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
