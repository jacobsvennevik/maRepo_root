import axiosInstance from '@/lib/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    
    try {
      // First verify we can access localStorage
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('localStorage is not available');
      }

      const response = await axiosInstance.post<AuthResponse>(
        '/api/token/',
        {
          email: credentials.email,
          password: credentials.password
        }
      );

      if (!response.data.access || !response.data.refresh) {
        throw new Error('Server response missing required tokens');
      }

      // Store the tokens
      try {
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Verify storage
        const storedAuthToken = localStorage.getItem('authToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (!storedAuthToken || !storedRefreshToken) {
          throw new Error('Failed to store tokens in localStorage');
        }
      } catch (storageError) {
        throw new Error('Failed to store authentication tokens');
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  }

  static logout(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      // Verify removal
      const authToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
    } catch (error) {
    }
  }

  static isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  static getRefreshToken(): string | null {
    try {
      const token = localStorage.getItem('refreshToken');
      return token;
    } catch (error) {
      return null;
    }
  }

  static getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('authToken');
      return token;
    } catch (error) {
      return null;
    }
  }

  static async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post<AuthResponse>(
        '/api/token/refresh/',
        {
          refresh: refreshToken
        }
      );

      localStorage.setItem('authToken', response.data.access);
      
      // Verify storage
      const newToken = localStorage.getItem('authToken');
    } catch (error) {
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  }
} 