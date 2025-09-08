/**
 * React hook for real-time study progress updates.
 */
import { useState, useEffect, useCallback } from 'react';
import { webSocketService, StudyProgressUpdate } from '@/services/websocket';

export interface StudyStats {
  total_cards: number;
  reviewed_today: number;
  due_cards: number;
  study_streak: number;
  completion_rate: number;
  cards_by_difficulty?: number[];
}

export function useStudyProgress() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for study progress updates
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent<StudyProgressUpdate>) => {
      const data = event.detail;
      setStats(data.progress_stats);
      setLastUpdate(new Date());
    };

    const handleInitialStats = (event: CustomEvent<StudyStats>) => {
      setStats(event.detail);
      setLastUpdate(new Date());
    };

    window.addEventListener('study-progress-update', handleProgressUpdate as EventListener);
    window.addEventListener('initial-study-stats', handleInitialStats as EventListener);

    return () => {
      window.removeEventListener('study-progress-update', handleProgressUpdate as EventListener);
      window.removeEventListener('initial-study-stats', handleInitialStats as EventListener);
    };
  }, []);

  // Review flashcard function
  const reviewFlashcard = useCallback((flashcardId: string, rating: number) => {
    webSocketService.reviewFlashcard(flashcardId, rating);
  }, []);

  // Get study progress function
  const getStudyProgress = useCallback(() => {
    webSocketService.getStudyProgress();
  }, []);

  // Ping server function
  const ping = useCallback(() => {
    webSocketService.ping();
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    webSocketService.reconnect();
  }, []);

  return {
    stats,
    isConnected,
    lastUpdate,
    reviewFlashcard,
    getStudyProgress,
    ping,
    reconnect,
  };
}

/**
 * React hook for real-time project updates.
 */
import { ProjectUpdate } from '@/services/websocket';

export function useProjectUpdates() {
  const [projects, setProjects] = useState<ProjectUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for project updates
  useEffect(() => {
    const handleProjectCreated = (event: CustomEvent<ProjectUpdate>) => {
      const newProject = event.detail;
      setProjects(prev => [...prev, newProject]);
    };

    const handleProjectUpdated = (event: CustomEvent<ProjectUpdate>) => {
      const updatedProject = event.detail;
      setProjects(prev => 
        prev.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        )
      );
    };

    window.addEventListener('project-created', handleProjectCreated as EventListener);
    window.addEventListener('project-updated', handleProjectUpdated as EventListener);

    return () => {
      window.removeEventListener('project-created', handleProjectCreated as EventListener);
      window.removeEventListener('project-updated', handleProjectUpdated as EventListener);
    };
  }, []);

  return {
    projects,
    isConnected,
  };
}

/**
 * React hook for file processing updates.
 */
export function useFileProcessing() {
  const [processingFiles, setProcessingFiles] = useState<Map<string, any>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for file processing updates
  useEffect(() => {
    const handleFileProcessingUpdate = (event: CustomEvent<any>) => {
      const data = event.detail;
      setProcessingFiles(prev => {
        const newMap = new Map(prev);
        newMap.set(data.file_id, data);
        return newMap;
      });
    };

    window.addEventListener('file-processing-update', handleFileProcessingUpdate as EventListener);

    return () => {
      window.removeEventListener('file-processing-update', handleFileProcessingUpdate as EventListener);
    };
  }, []);

  return {
    processingFiles,
    isConnected,
  };
}
