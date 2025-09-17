import {
  cleanupLocalStorage,
  cleanupBackendDrafts,
  performComprehensiveCleanup,
  cleanupOnAbandon,
  registerUpload,
  isCleanupInProgress,
  getCleanupQueueLength,
} from "../cleanup-utils";
import { cleanupAbandonedDrafts } from "../../services/api";
import { createLocalStorageMock } from "../../../../../test-utils/test-helpers";

// Mock the API service
jest.mock("../../services/api", () => ({
  cleanupAbandonedDrafts: jest.fn(),
}));

// Mock window.showToast
const mockShowToast = jest.fn();
Object.defineProperty(window, "showToast", {
  value: mockShowToast,
  writable: true,
});

describe("cleanup-utils", () => {
  let localStorageMock: any;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Clear all mocks
    jest.clearAllMocks();
    mockShowToast.mockClear();

    // Reset global upload tracking
    (window as any).__activeUploads = [];

    // Use fake timers for consistent async behavior
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up global state
    (window as any).__activeUploads = [];

    // Restore real timers
    jest.useRealTimers();
  });

  describe("registerUpload", () => {
    it("should register AbortController for cleanup", () => {
      const controller = new AbortController();

      registerUpload(controller);

      expect((window as any).__activeUploads).toContain(controller);
    });

    it("should initialize uploads array if not exists", () => {
      delete (window as any).__activeUploads;

      const controller = new AbortController();
      registerUpload(controller);

      expect((window as any).__activeUploads).toEqual([controller]);
    });
  });

  describe("cleanupLocalStorage", () => {
    it("should remove project creation localStorage keys", async () => {
      // Setup localStorage with some data
      localStorageMock.setItem(
        "project-setup-guided-setup",
        '{"data": "test"}',
      );
      localStorageMock.setItem("self-study-guided-setup", '{"data": "test"}');
      localStorageMock.setItem("other-data", '{"data": "test"}');

      const cleanupPromise = cleanupLocalStorage();

      // Advance timers to resolve async operations
      jest.runAllTimers();
      await cleanupPromise;

      // Check that project keys were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("project-setup-guided-setup");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("self-study-guided-setup");

      // Check that other data remains
      expect(localStorageMock.getItem("other-data")).toBe('{"data": "test"}');
    });

    it("should handle localStorage errors gracefully", async () => {
      // Mock localStorage to throw error
      localStorageMock.removeItem = jest.fn().mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const cleanupPromise = cleanupLocalStorage();
      jest.runAllTimers();

      // Should not throw error
      await expect(cleanupPromise).resolves.not.toThrow();
    });

    it("should handle storage quota exceeded", async () => {
      // Mock localStorage to simulate quota exceeded by making removeItem throw
      localStorageMock.removeItem = jest.fn().mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      const cleanupPromise = cleanupLocalStorage();
      jest.runAllTimers();
      await cleanupPromise;

      // Should show error toast
      expect(mockShowToast).toHaveBeenCalledWith(
        "Storage limit reached. Please clear some data and try again.",
        "error",
      );
    });
  });

  describe("cleanupBackendDrafts", () => {
    it("should call backend cleanup API", async () => {
      const mockResponse = { deleted_count: 5, message: "Success" };
      (cleanupAbandonedDrafts as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cleanupBackendDrafts(24);

      expect(cleanupAbandonedDrafts).toHaveBeenCalledWith(24);
      expect(result).toEqual(mockResponse);
    });

    it("should handle API errors gracefully", async () => {
      (cleanupAbandonedDrafts as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      );

      const result = await cleanupBackendDrafts(24);

      expect(result).toBeNull();
    });
  });

  describe("cleanupOnAbandon", () => {
    it("should abort uploads and cleanup immediately", async () => {
      const mockAbortController = {
        abort: jest.fn(),
      };

      // Register an upload
      registerUpload(mockAbortController as any);

      // Setup localStorage
      localStorageMock.setItem(
        "project-setup-guided-setup",
        '{"data": "test"}',
      );

      const cleanupPromise = cleanupOnAbandon();

      // Check that upload was aborted immediately
      expect(mockAbortController.abort).toHaveBeenCalled();

      // Advance timers to trigger setTimeout cleanup
      jest.runAllTimers();
      await cleanupPromise;

      // Check that localStorage was cleaned
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("project-setup-guided-setup");
    });

    it("should handle localStorage errors in cleanupOnAbandon", () => {
      localStorageMock.removeItem = jest.fn().mockImplementation(() => {
        throw new Error("localStorage error");
      });

      // Should not throw error
      expect(() => cleanupOnAbandon()).not.toThrow();
    });
  });

  describe("performComprehensiveCleanup", () => {
    it("should perform all cleanup operations", async () => {
      const mockResponse = { deleted_count: 3, message: "Success" };
      (cleanupAbandonedDrafts as jest.Mock).mockResolvedValue(mockResponse);

      // Setup localStorage
      localStorageMock.setItem(
        "project-setup-guided-setup",
        '{"data": "test"}',
      );

      // Call the cleanup function
      await performComprehensiveCleanup();

      // Advance timers to trigger setTimeout calls
      jest.runAllTimers();
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that localStorage was cleaned
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("project-setup-guided-setup");

      // Check that backend cleanup was called
      expect(cleanupAbandonedDrafts).toHaveBeenCalledWith(24);
    }, 5000); // Reduce timeout since we're handling it properly

    it("should abort in-flight uploads", async () => {
      const mockAbortController = {
        abort: jest.fn(),
      };

      // Register an upload
      registerUpload(mockAbortController as any);

      const cleanupPromise = performComprehensiveCleanup();
      jest.runAllTimers();
      await cleanupPromise;

      // Check that upload was aborted
      expect(mockAbortController.abort).toHaveBeenCalled();
    }, 15000); // Increase timeout

    it("should handle backend cleanup errors gracefully", async () => {
      (cleanupAbandonedDrafts as jest.Mock).mockRejectedValue(
        new Error("Backend Error"),
      );

      const cleanupPromise = performComprehensiveCleanup();
      jest.runAllTimers();

      // Should not throw error
      await expect(cleanupPromise).resolves.not.toThrow();
    }, 15000); // Increase timeout
  });

  describe("state tracking", () => {
    it("should track cleanup progress state", async () => {
      expect(isCleanupInProgress()).toBe(false);

      // Start cleanup
      const cleanupPromise = performComprehensiveCleanup();

      // Should be in progress
      expect(isCleanupInProgress()).toBe(true);

      // Complete cleanup
      jest.runAllTimers();
      await cleanupPromise;

      // Should be completed
      expect(isCleanupInProgress()).toBe(false);
    }, 15000); // Increase timeout

    it("should track cleanup queue length", async () => {
      expect(getCleanupQueueLength()).toBe(0);

      // Start multiple cleanups
      const cleanup1 = performComprehensiveCleanup();
      const cleanup2 = performComprehensiveCleanup();
      const cleanup3 = performComprehensiveCleanup();

      // Should have queued operations
      expect(getCleanupQueueLength()).toBeGreaterThan(0);

      // Complete all cleanups
      jest.runAllTimers();
      await Promise.all([cleanup1, cleanup2, cleanup3]);
      
      // Wait a bit more for background operations
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should be empty
      expect(getCleanupQueueLength()).toBe(0);
    }, 5000); // Reduce timeout since we're handling async properly
  });

  describe("multi-tab stress test", () => {
    it("should handle storage events from other tabs", () => {
      // Simulate storage event from another tab
      const storageEvent = new StorageEvent("storage", {
        key: "project-setup-guided-setup",
        newValue: null,
        oldValue: '{"data": "test"}',
        url: window.location.href,
        storageArea: null,
      });

      // This should not break the cleanup logic
      expect(() => {
        window.dispatchEvent(storageEvent);
      }).not.toThrow();
    });
  });

  describe("localStorage quota checking", () => {
    it("should handle localStorage access errors", async () => {
      // Mock localStorage to throw error during quota check
      const originalKey = localStorageMock.key;
      localStorageMock.key = jest.fn().mockImplementation(() => {
        throw new Error("localStorage access error");
      });

      const cleanupPromise = cleanupLocalStorage();
      jest.runAllTimers();
      await cleanupPromise;

      // Should continue without error
      expect(mockShowToast).not.toHaveBeenCalled();

      // Restore original function
      localStorageMock.key = originalKey;
    }, 15000); // Increase timeout
  });
});
