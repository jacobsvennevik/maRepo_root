// services/apiClient.ts
import axios from 'axios'

// Adjust this to point to your Django server
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true // if you handle cookies/CSRF
})

// Optional: set interceptors for auth tokens
apiClient.interceptors.request.use((config) => {
  // If you store tokens in localStorage or Zustand, attach them here
  // config.headers.Authorization = `Bearer ${token}`
  return config
})
