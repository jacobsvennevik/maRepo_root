import { useEffect, useCallback } from "react";
import { SelfStudyProjectSetup } from "../types";

interface UseAutoSaveProps {
  data: SelfStudyProjectSetup;
  key: string;
  enabled?: boolean;
}

export function useAutoSave({ data, key, enabled = true }: UseAutoSaveProps) {
  const saveToStorage = useCallback(
    (dataToSave: SelfStudyProjectSetup) => {
      if (!enabled) return;

      try {
        const serializedData = {
          ...dataToSave,
          learningMaterials: dataToSave.learningMaterials.map((material) => ({
            ...material,
            file: undefined, // Don't serialize File objects
          })),
        };
        localStorage.setItem(key, JSON.stringify(serializedData));
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    },
    [key, enabled],
  );

  const loadFromStorage = useCallback((): SelfStudyProjectSetup | null => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
    return null;
  }, [key, enabled]);

  const clearStorage = useCallback(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }, [key, enabled]);

  // Auto-save when data changes
  useEffect(() => {
    if (enabled && Object.keys(data).length > 0) {
      saveToStorage(data);
    }
  }, [data, saveToStorage, enabled]);

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}
