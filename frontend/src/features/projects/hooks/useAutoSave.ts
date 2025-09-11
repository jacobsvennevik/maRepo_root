'use client';

import { useEffect, useCallback } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  key: string;
  enabled?: boolean;
  debounceMs?: number;
}

export function useAutoSave<T>({
  data,
  key,
  enabled = true,
  debounceMs = 1000,
}: UseAutoSaveOptions<T>) {
  const saveToStorage = useCallback(
    (dataToSave: T) => {
      try {
        localStorage.setItem(
          `project-setup-${key}`,
          JSON.stringify({
            data: dataToSave,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    },
    [key],
  );

  const loadFromStorage = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`project-setup-${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if data is less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
    return null;
  }, [key]);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(`project-setup-${key}`);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }, [key]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      saveToStorage(data);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, enabled, debounceMs, saveToStorage]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}
