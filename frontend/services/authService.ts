// services/authService.ts
import { apiClient } from './apiClient'

interface RegisterData {
  username: string
  email: string
  password1: string
  password2: string
}

export async function registerUser(data: RegisterData) {
  // Example DRF endpoint: POST /auth/register/
  const response = await apiClient.post('/auth/register/', data)
  return response.data
}

export async function loginUser(username: string, password: string) {
  // Example DRF endpoint: POST /auth/login/
  const response = await apiClient.post('/auth/login/', {
    username,
    password
  })
  // You might get a token or session cookie in response
  return response.data
}

export async function logoutUser() {
  // Example DRF endpoint: POST /auth/logout/
  const response = await apiClient.post('/auth/logout/')
  return response.data
}
