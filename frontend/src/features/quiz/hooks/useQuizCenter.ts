/**
 * useQuizCenter Custom Hook
 * 
 * Comprehensive state management hook for Quiz Center,
 * following the established patterns from useFlashcardDashboard and useFileStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { quizApi } from '../services/quizApi';
import {
  transformSessions,
  transformQuestions,
  transformResponses,
  transformAnalytics,
  calculateSessionStats,
  calculateProjectStats,
  validateSession
} from '../utils/transformers';
import type {
  QuizCenterState,
  QuizSession,
  QuizQuestion,
  QuizResponse,
  QuizAnalytics,
  CreateQuizSessionRequest,
  UpdateQuizSessionRequest,
  SubmitQuizAnswerRequest,
  QuizSessionFilters,
  QuizSessionSort,
  QuizError
} from '../types';

interface UseQuizCenterOptions {
  projectId: string;
  autoLoad?: boolean;
  refreshInterval?: number;
}

interface UseQuizCenterReturn extends QuizCenterState {
  // Data operations
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  loadSessionQuestions: (sessionId: string) => Promise<void>;
  loadSessionResponses: (sessionId: string) => Promise<void>;
  loadSessionAnalytics: (sessionId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // CRUD operations
  createSession: (request: CreateQuizSessionRequest) => Promise<QuizSession>;
  updateSession: (sessionId: string, request: UpdateQuizSessionRequest) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  bulkDeleteSessions: (sessionIds: string[]) => Promise<void>;
  bulkUpdateSessions: (sessionIds: string[], updates: UpdateQuizSessionRequest) => Promise<void>;
  
  // Quiz session operations
  startSession: (sessionId: string) => Promise<void>;
  submitAnswer: (request: SubmitQuizAnswerRequest) => Promise<void>;
  completeSession: () => Promise<void>;
  
  // UI operations
  selectSession: (sessionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Filtering and sorting
  filterSessions: (filters: QuizSessionFilters) => void;
  sortSessions: (sort: QuizSessionSort) => void;
  
  // Error handling
  clearError: () => void;
  clearSessionError: () => void;
  clearQuestionsError: () => void;
  clearSubmissionError: () => void;
  
  // Utility functions
  getCurrentQuestion: () => QuizQuestion | undefined;
  getSessionById: (sessionId: string) => QuizSession | undefined;
  isSessionCompleted: (sessionId: string) => boolean;
  getSessionProgress: (sessionId: string) => number;
}

export function useQuizCenter({ 
  projectId, 
  autoLoad = true, 
  refreshInterval 
}: UseQuizCenterOptions): UseQuizCenterReturn {
  
  // State management
  const [state, setState] = useState<QuizCenterState>({
    sessions: [],
    currentSession: undefined,
    currentQuestions: undefined,
    analytics: undefined,
    
    // Loading states
    loading: true,
    loadingSessions: false,
    loadingSession: false,
    loadingQuestions: false,
    submittingAnswer: false,
    generatingQuiz: false,
    
    // Error states
    error: null,
    sessionError: null,
    questionsError: null,
    submissionError: null,
    
    // UI state
    selectedSessionId: undefined,
    currentQuestionIndex: 0,
    sessionStarted: false,
    sessionCompleted: false,
    
    // Stats
    totalSessions: 0,
    completedSessions: 0,
    averageScore: 0,
    totalTimeSpent: 0
  });

  // Refs for cleanup and tracking
  const isMountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad && projectId) {
      loadSessions();
    }
  }, [projectId, autoLoad, loadSessions]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          refreshData();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshInterval]);

  // Data loading functions
  const loadSessions = useCallback(async () => {
    if (!projectId) return;

    try {
      setState(prev => ({ ...prev, loadingSessions: true, error: null }));
      
      console.log(`🔍 Loading quiz sessions for project: ${projectId}`);
      const backendSessions = await quizApi.getProjectSessions(projectId);
      const sessions = transformSessions(backendSessions);
      
      // Calculate project stats
      const stats = calculateProjectStats(sessions);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessions,
          loadingSessions: false,
          loading: false,
          totalSessions: stats.totalSessions,
          completedSessions: stats.completedSessions,
          averageScore: stats.averageScore,
          totalTimeSpent: stats.totalTimeSpent
        }));
      }
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loadingSessions: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load quiz sessions'
        }));
      }
    }
  }, [projectId]);

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, loadingSession: true, sessionError: null }));
      
      console.log(`🔍 Loading quiz session: ${sessionId}`);
      const backendSession = await quizApi.getSession(sessionId);
      const session = transformSessions([backendSession])[0];
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          currentSession: session,
          loadingSession: false,
          selectedSessionId: sessionId
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to load session ${sessionId}:`, error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loadingSession: false,
          sessionError: error instanceof Error ? error.message : 'Failed to load quiz session'
        }));
      }
    }
  }, []);

  const loadSessionQuestions = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, loadingQuestions: true, questionsError: null }));
      
      console.log(`❓ Loading questions for session: ${sessionId}`);
      const backendQuestions = await quizApi.getSessionQuestions(sessionId);
      const questions = transformQuestions(backendQuestions);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          currentQuestions: questions,
          loadingQuestions: false,
          currentQuestionIndex: 0
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to load questions for session ${sessionId}:`, error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loadingQuestions: false,
          questionsError: error instanceof Error ? error.message : 'Failed to load quiz questions'
        }));
      }
    }
  }, []);

  const loadSessionResponses = useCallback(async (sessionId: string) => {
    try {
      console.log(`📊 Loading responses for session: ${sessionId}`);
      const backendResponses = await quizApi.getSessionResponses(sessionId);
      const responses = transformResponses(backendResponses);
      
      // Update session stats with responses
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        const stats = calculateSessionStats(session, responses);
        const updatedSession = { ...session, ...stats };
        
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === sessionId ? updatedSession : s)
          }));
        }
      }
    } catch (error) {
      console.error(`❌ Failed to load responses for session ${sessionId}:`, error);
    }
  }, [state.sessions]);

  const loadSessionAnalytics = useCallback(async (sessionId: string) => {
    try {
      console.log(`📈 Loading analytics for session: ${sessionId}`);
      const backendAnalytics = await quizApi.getSessionAnalytics(sessionId);
      const analytics = transformAnalytics(backendAnalytics);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          analytics
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to load analytics for session ${sessionId}:`, error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  // CRUD operations
  const createSession = useCallback(async (request: CreateQuizSessionRequest): Promise<QuizSession> => {
    try {
      setState(prev => ({ ...prev, generatingQuiz: true, error: null }));
      
      console.log('🚀 Creating new quiz session:', request);
      const backendSession = await quizApi.createSession(request);
      const session = transformSessions([backendSession])[0];
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessions: [session, ...prev.sessions],
          generatingQuiz: false,
          totalSessions: prev.totalSessions + 1
        }));
      }
      
      return session;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          generatingQuiz: false,
          error: error instanceof Error ? error.message : 'Failed to create quiz session'
        }));
      }
      throw error;
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, request: UpdateQuizSessionRequest) => {
    try {
      console.log(`📝 Updating session ${sessionId}:`, request);
      const backendSession = await quizApi.updateSession(sessionId, request);
      const updatedSession = transformSessions([backendSession])[0];
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => s.id === sessionId ? updatedSession : s),
          currentSession: prev.currentSession?.id === sessionId ? updatedSession : prev.currentSession
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to update session ${sessionId}:`, error);
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      console.log(`🗑️ Deleting session: ${sessionId}`);
      await quizApi.deleteSession(sessionId);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s.id !== sessionId),
          currentSession: prev.currentSession?.id === sessionId ? undefined : prev.currentSession,
          selectedSessionId: prev.selectedSessionId === sessionId ? undefined : prev.selectedSessionId,
          totalSessions: prev.totalSessions - 1
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  }, []);

  const bulkDeleteSessions = useCallback(async (sessionIds: string[]) => {
    try {
      console.log(`🗑️ Bulk deleting ${sessionIds.length} sessions`);
      await quizApi.bulkDeleteSessions(sessionIds);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => !sessionIds.includes(s.id)),
          totalSessions: prev.totalSessions - sessionIds.length
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to bulk delete sessions:`, error);
      throw error;
    }
  }, []);

  const bulkUpdateSessions = useCallback(async (sessionIds: string[], updates: UpdateQuizSessionRequest) => {
    try {
      console.log(`📝 Bulk updating ${sessionIds.length} sessions`);
      await quizApi.bulkUpdateSessions(sessionIds, updates);
      
      // Refresh data to get updated sessions
      await refreshData();
    } catch (error) {
      console.error(`❌ Failed to bulk update sessions:`, error);
      throw error;
    }
  }, [refreshData]);

  // Quiz session operations
  const startSession = useCallback(async (sessionId: string) => {
    try {
      console.log(`▶️ Starting session: ${sessionId}`);
      const response = await quizApi.startSession(sessionId);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          currentQuestions: response.questions,
          sessionStarted: true,
          sessionCompleted: false,
          currentQuestionIndex: 0
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to start session ${sessionId}:`, error);
      throw error;
    }
  }, []);

  const submitAnswer = useCallback(async (request: SubmitQuizAnswerRequest) => {
    if (!state.currentSession) return;

    try {
      setState(prev => ({ ...prev, submittingAnswer: true, submissionError: null }));
      
      console.log(`📝 Submitting answer for question ${request.question_id}`);
      const response = await quizApi.submitAnswer(state.currentSession.id, request);
      
      // Update current question with answer
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          currentQuestions: prev.currentQuestions?.map(q => 
            q.id === request.question_id 
              ? { ...q, userAnswer: request.user_answer, isCorrect: response.is_correct, isAnswered: true }
              : q
          ),
          submittingAnswer: false
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to submit answer:`, error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          submittingAnswer: false,
          submissionError: error instanceof Error ? error.message : 'Failed to submit answer'
        }));
      }
      throw error;
    }
  }, [state.currentSession]);

  const completeSession = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      console.log(`✅ Completing session: ${state.currentSession.id}`);
      
      // Update session status to completed
      await updateSession(state.currentSession.id, { status: 'completed' });
      
      // Load analytics
      await loadSessionAnalytics(state.currentSession.id);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          sessionCompleted: true,
          sessionStarted: false
        }));
      }
    } catch (error) {
      console.error(`❌ Failed to complete session:`, error);
      throw error;
    }
  }, [state.currentSession, updateSession, loadSessionAnalytics]);

  // UI operations
  const selectSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      selectedSessionId: sessionId,
      currentSession: prev.sessions.find(s => s.id === sessionId)
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        (prev.currentQuestions?.length || 1) - 1
      )
    }));
  }, []);

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, Math.min(index, (prev.currentQuestions?.length || 1) - 1))
    }));
  }, []);

  // Filtering and sorting
  const filterSessions = useCallback((filters: QuizSessionFilters) => {
    // Implementation would filter sessions based on criteria
    console.log('🔍 Filtering sessions:', filters);
  }, []);

  const sortSessions = useCallback((sort: QuizSessionSort) => {
    // Implementation would sort sessions based on criteria
    console.log('📊 Sorting sessions:', sort);
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSessionError = useCallback(() => {
    setState(prev => ({ ...prev, sessionError: null }));
  }, []);

  const clearQuestionsError = useCallback(() => {
    setState(prev => ({ ...prev, questionsError: null }));
  }, []);

  const clearSubmissionError = useCallback(() => {
    setState(prev => ({ ...prev, submissionError: null }));
  }, []);

  // Utility functions
  const getCurrentQuestion = useCallback((): QuizQuestion | undefined => {
    return state.currentQuestions?.[state.currentQuestionIndex];
  }, [state.currentQuestions, state.currentQuestionIndex]);

  const getSessionById = useCallback((sessionId: string): QuizSession | undefined => {
    return state.sessions.find(s => s.id === sessionId);
  }, [state.sessions]);

  const isSessionCompleted = useCallback((sessionId: string): boolean => {
    const session = getSessionById(sessionId);
    return session?.status === 'completed';
  }, [getSessionById]);

  const getSessionProgress = useCallback((sessionId: string): number => {
    const session = getSessionById(sessionId);
    return session?.completionRate || 0;
  }, [getSessionById]);

  return {
    ...state,
    
    // Data operations
    loadSessions,
    loadSession,
    loadSessionQuestions,
    loadSessionResponses,
    loadSessionAnalytics,
    refreshData,
    
    // CRUD operations
    createSession,
    updateSession,
    deleteSession,
    bulkDeleteSessions,
    bulkUpdateSessions,
    
    // Quiz session operations
    startSession,
    submitAnswer,
    completeSession,
    
    // UI operations
    selectSession,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    
    // Filtering and sorting
    filterSessions,
    sortSessions,
    
    // Error handling
    clearError,
    clearSessionError,
    clearQuestionsError,
    clearSubmissionError,
    
    // Utility functions
    getCurrentQuestion,
    getSessionById,
    isSessionCompleted,
    getSessionProgress
  };
}
