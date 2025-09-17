/**
 * Cleanup utilities for project data
 */

export const performComprehensiveCleanup = async (projectId?: string): Promise<void> => {
  // Mock implementation for tests
  console.log('Performing comprehensive cleanup', projectId);
};

export const cleanupOnAbandon = async (projectId: string): Promise<void> => {
  // Mock implementation for tests
  console.log('Cleaning up abandoned project', projectId);
};

export const isCleanupInProgress = (): boolean => {
  // Mock implementation for tests
  return false;
};

export const scheduleCleanup = (projectId: string, delay: number = 5000): void => {
  // Mock implementation for tests
  console.log('Scheduling cleanup for project', projectId, 'in', delay, 'ms');
};

export default {
  performComprehensiveCleanup,
  cleanupOnAbandon,
  isCleanupInProgress,
  scheduleCleanup,
};
