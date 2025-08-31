import { cleanupAbandonedDrafts } from "../services/api";

/**
 * Cleanup utility functions to prevent memory leaks and localStorage accumulation
 */

// Track active cleanup operations to prevent race conditions
let cleanupInProgress = false;
const cleanupQueue: (() => Promise<void>)[] = [];

/**
 * Execute cleanup operations sequentially to prevent race conditions
 */
const executeCleanupSafely = async (cleanupFn: () => Promise<void>) => {
  if (cleanupInProgress) {
    // Queue the cleanup operation
    return new Promise<void>((resolve, reject) => {
      cleanupQueue.push(async () => {
        try {
          await cleanupFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  cleanupInProgress = true;

  try {
    await cleanupFn();

    // Process queued operations
    while (cleanupQueue.length > 0) {
      const nextCleanup = cleanupQueue.shift();
      if (nextCleanup) {
        await nextCleanup();
      }
    }
  } finally {
    cleanupInProgress = false;
  }
};

/**
 * Check localStorage quota and warn if approaching limits
 */
const checkLocalStorageQuota = (): {
  canWrite: boolean;
  usagePercent: number;
} => {
  try {
    // Estimate current usage
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }

    // Most browsers have ~5MB limit, use 4MB as safe threshold
    const maxSize = 4 * 1024 * 1024; // 4MB
    const usagePercent = (totalSize / maxSize) * 100;

    return {
      canWrite: totalSize < maxSize,
      usagePercent,
    };
  } catch (error) {
    console.warn("Failed to check localStorage quota:", error);
    return { canWrite: true, usagePercent: 0 };
  }
};

/**
 * Abort in-flight uploads to prevent memory leaks
 */
const abortInFlightUploads = () => {
  // Store abort controllers for active uploads
  const activeUploads = (window as any).__activeUploads || [];

  activeUploads.forEach((controller: AbortController) => {
    try {
      controller.abort();
    } catch (error) {
      console.warn("Failed to abort upload:", error);
    }
  });

  // Clear the array
  (window as any).__activeUploads = [];
};

/**
 * Register an upload for cleanup
 */
export const registerUpload = (controller: AbortController) => {
  if (!(window as any).__activeUploads) {
    (window as any).__activeUploads = [];
  }
  (window as any).__activeUploads.push(controller);
};

/**
 * Clean up localStorage without blocking operations
 */
export const cleanupLocalStorage = () => {
  return new Promise<void>((resolve) => {
    // Use setTimeout to make this non-blocking
    setTimeout(() => {
      try {
        const keysToRemove = [
          "project-setup-guided-setup",
          "self-study-guided-setup",
        ];

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });

        console.log("🧹 Cleaned up localStorage");
      } catch (error) {
        console.warn("Failed to cleanup localStorage:", error);
      } finally {
        resolve();
      }
    }, 0);
  });
};

/**
 * Clean up abandoned draft projects in the background
 */
export const cleanupBackendDrafts = async (hours: number = 24) => {
  try {
    const result = await cleanupAbandonedDrafts(hours);
    console.log("🧹 Backend cleanup result:", result);
    return result;
  } catch (error) {
    console.warn("Failed to cleanup backend drafts:", error);
    return null;
  }
};

/**
 * Non-blocking comprehensive cleanup
 */
export const performComprehensiveCleanup = async () => {
  console.log("🧹 Starting non-blocking cleanup...");

  // Clean up localStorage immediately (non-blocking)
  cleanupLocalStorage();

  // Clean up backend drafts in background
  setTimeout(() => {
    cleanupBackendDrafts().catch((error) => {
      console.warn("Background cleanup failed:", error);
    });
  }, 100);

  console.log("🧹 Cleanup initiated");
};

/**
 * Cleanup function specifically for when users abandon projects
 */
export const cleanupOnAbandon = () => {
  console.log("🧹 Cleaning up abandoned project data...");

  // Abort in-flight uploads immediately
  abortInFlightUploads();

  // Clean up localStorage immediately
  cleanupLocalStorage().catch((error) => {
    console.warn("localStorage cleanup failed:", error);
  });

  // Schedule backend cleanup for next tick to avoid blocking UI
  setTimeout(() => {
    cleanupBackendDrafts().catch((error) => {
      console.warn("Background cleanup failed:", error);
    });
  }, 0);
};

/**
 * Check if cleanup is currently in progress
 */
export const isCleanupInProgress = () => cleanupInProgress;

/**
 * Get cleanup queue length
 */
export const getCleanupQueueLength = () => cleanupQueue.length;
