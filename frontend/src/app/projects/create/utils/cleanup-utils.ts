import { cleanupAbandonedDrafts } from '../services/api';

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
const checkLocalStorageQuota = (): { canWrite: boolean; usagePercent: number } => {
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
      usagePercent
    };
  } catch (error) {
    console.warn('Failed to check localStorage quota:', error);
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
      console.warn('Failed to abort upload:', error);
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
 * Clean up localStorage for all project creation flows
 */
export const cleanupLocalStorage = () => {
  return executeCleanupSafely(async () => {
    try {
      const quotaCheck = checkLocalStorageQuota();
      
      if (!quotaCheck.canWrite) {
        console.error(`localStorage quota exceeded: ${quotaCheck.usagePercent.toFixed(1)}% used`);
        // Show user-friendly error
        if (typeof window !== 'undefined' && window.showToast) {
          window.showToast('Storage limit reached. Please clear some data and try again.', 'error');
        }
        return;
      }
      
      const keysToRemove = [
        'project-setup-guided-setup',
        'self-study-guided-setup'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Cleaned up all project creation localStorage');
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  });
};

/**
 * Clean up abandoned draft projects in the backend
 */
export const cleanupBackendDrafts = async (hours: number = 24) => {
  return executeCleanupSafely(async () => {
    try {
      const result = await cleanupAbandonedDrafts(hours);
      console.log('🧹 Backend cleanup result:', result);
      return result;
    } catch (error) {
      console.warn('Failed to cleanup backend drafts:', error);
      // Don't throw error as this is not critical for user experience
      return null;
    }
  });
};

/**
 * Comprehensive cleanup function to be called when starting new projects
 */
export const performComprehensiveCleanup = async () => {
  return executeCleanupSafely(async () => {
    console.log('🧹 Starting comprehensive cleanup...');
    
    // Abort any in-flight uploads first
    abortInFlightUploads();
    
    // Clean up localStorage
    await cleanupLocalStorage();
    
    // Clean up backend drafts (non-blocking)
    try {
      await cleanupBackendDrafts();
    } catch (error) {
      console.warn('Backend cleanup failed, continuing...', error);
    }
    
    console.log('🧹 Comprehensive cleanup completed');
  });
};

/**
 * Cleanup function specifically for when users abandon projects
 */
export const cleanupOnAbandon = () => {
  console.log('🧹 Cleaning up abandoned project data...');
  
  // Abort in-flight uploads immediately
  abortInFlightUploads();
  
  // Clean up localStorage immediately
  cleanupLocalStorage().catch(error => {
    console.warn('localStorage cleanup failed:', error);
  });
  
  // Schedule backend cleanup for next tick to avoid blocking UI
  setTimeout(() => {
    cleanupBackendDrafts().catch(error => {
      console.warn('Background cleanup failed:', error);
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