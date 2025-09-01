import axiosInstance from "@/lib/axios";

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
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage is not available");
      }

      const response = await axiosInstance.post<AuthResponse>("/api/token/", {
        email: credentials.email,
        password: credentials.password,
      });

      if (!response.data.access || !response.data.refresh) {
        throw new Error("Server response missing required tokens");
      }

      // Store the tokens
      try {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        // Verify storage
        const storedAuthToken = localStorage.getItem("access_token");
        const storedRefreshToken = localStorage.getItem("refresh_token");

        if (!storedAuthToken || !storedRefreshToken) {
          throw new Error("Failed to store tokens in localStorage");
        }

        // Dispatch custom event to notify auth state change
        window.dispatchEvent(new Event('auth-change'));
      } catch (storageError) {
        throw new Error("Failed to store authentication tokens");
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Verify removal
      const authToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      // Dispatch custom event to notify auth state change
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {}
  }

  static isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem("access_token");
      return !!token;
    } catch (error) {
      return false;
    }
  }

  static getRefreshToken(): string | null {
    try {
      const token = localStorage.getItem("refresh_token");
      return token;
    } catch (error) {
      return null;
    }
  }

  static getAuthToken(): string | null {
    try {
      const token = localStorage.getItem("access_token");
      return token;
    } catch (error) {
      return null;
    }
  }

  static async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post<AuthResponse>(
        "/api/token/refresh/",
        {
          refresh: refreshToken,
        },
      );

      localStorage.setItem("access_token", response.data.access);

      // Verify storage
      const newToken = localStorage.getItem("access_token");

      // Dispatch custom event to notify auth state change
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      this.logout();
      throw new Error("Session expired. Please login again.");
    }
  }
}
