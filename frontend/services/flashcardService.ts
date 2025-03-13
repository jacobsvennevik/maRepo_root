// services/flashcardService.ts
import { apiClient } from './apiClient'

export async function getFlashcardSets() {
  // Example DRF endpoint: GET /flashcardsets/
  const response = await apiClient.get('/flashcardsets/')
  return response.data
}

export async function generateFlashcards(documentId: number) {
  // Example DRF endpoint: POST /flashcards/generate/
  const response = await apiClient.post('/flashcards/generate/', {
    document_id: documentId
  })
  return response.data
}
