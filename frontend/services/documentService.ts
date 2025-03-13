// services/documentService.ts
import { apiClient } from './apiClient'

export async function uploadDocument(file: File, title: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  // If the backend expects file_type or other fields, add them here:
  // formData.append('file_type', 'pdf' or 'ppt' etc.)

  const response = await apiClient.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}
