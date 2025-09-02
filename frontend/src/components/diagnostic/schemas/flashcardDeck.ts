import { z } from 'zod';

export const FlashcardDeckSchema = z.object({
  title: z.string().min(3, 'Please provide a deck title'),
  description: z.string().min(10, 'Please provide a short description'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  language: z.string(),
  // 🚫 No 'assessmentType', 'kind', etc. — flashcards only
});

export type FlashcardDeckForm = z.infer<typeof FlashcardDeckSchema>;
