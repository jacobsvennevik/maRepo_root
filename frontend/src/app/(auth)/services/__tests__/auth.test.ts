import { AuthService } from "../auth";

// Mock axios completely to avoid interceptor issues
jest.mock("../../../../lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  setupAxiosInterceptors: jest.fn(),
}));

import axiosInstance from "../../../../lib/axios";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    let store: { [key: string]: string } = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      },
      writable: true,
    });
  });

  describe("login", () => {
    it("should login successfully and store tokens", async () => {
      const mockResponse = {
        data: {
          access: "mock-access-token",
          refresh: "mock-refresh-token",
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/token/", {
        email: "test@example.com",
        password: "password123",
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "authToken",
        "mock-access-token",
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "mock-refresh-token",
      );

      expect(result).toEqual({
        access: "mock-access-token",
        refresh: "mock-refresh-token",
      });
    });

    it("should handle login failure", async () => {
      const mockError = {
        response: {
          status: 401,
          data: { detail: "Invalid credentials" },
        },
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(mockError);

      await expect(
        AuthService.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid credentials");

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should clear tokens from localStorage", () => {
      AuthService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith("authToken");
      expect(localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    });
  });

  describe("getAuthToken", () => {
    it("should return token from localStorage", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue("mock-token");

      const token = AuthService.getAuthToken();

      expect(localStorage.getItem).toHaveBeenCalledWith("authToken");
      expect(token).toBe("mock-token");
    });

    it("should return null if no token", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const token = AuthService.getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe("getRefreshToken", () => {
    it("should return refresh token from localStorage", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue("mock-refresh-token");

      const token = AuthService.getRefreshToken();

      expect(localStorage.getItem).toHaveBeenCalledWith("refreshToken");
      expect(token).toBe("mock-refresh-token");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true if auth token exists", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue("mock-token");

      const isAuth = AuthService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it("should return false if no auth token", () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const isAuth = AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });
});
