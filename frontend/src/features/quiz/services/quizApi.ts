/**
 * Quiz API Service
 * 
 * Centralized service for all quiz-related API operations,
 * following the established FlashcardApiService pattern.
 */

import { axiosGeneration } from '@/lib/axios';
import { normalizeProjectId } from '@/lib/projectId';
import type {
  DiagnosticSession,
  DiagnosticQuestion,
  DiagnosticResponse,
  DiagnosticAnalytics,
  CreateQuizSessionRequest,
  UpdateQuizSessionRequest,
  StartQuizSessionResponse,
  SubmitQuizAnswerRequest,
  SubmitQuizAnswerResponse,
  QuizSessionListResponse,
  QuizError,
  QuizErrorType
} from '../types';

export class QuizApiService {
  private baseUrl = 'diagnostic-sessions/';
  private generationUrl = 'diagnostics/';

  async getProjectSessions(projectId: string): Promise<DiagnosticSession[]> {
    try {
      const pid = normalizeProjectId(projectId);
      const response = await axiosGeneration.get(`${this.baseUrl}`, {
        params: { project: pid },
      });
      const sessions = response.data;
      return Array.isArray(sessions) ? sessions : (sessions?.results || []);
    } catch (error) {
      if ((error as any)?.response?.status === 404 || 
          ((error as any)?.response?.data && Object.keys((error as any).response.data).length === 0)) {
        return [];
      }
      throw this.handleApiError(error, 'Failed to load quiz sessions');
    }
  }

  async getTodaySessions(projectId: string): Promise<DiagnosticSession[]> {
    try {
      const pid = normalizeProjectId(projectId);
      const response = await axiosGeneration.get(`${this.baseUrl}today/`, {
        params: { project: pid },
      });
      const sessions = response.data;
      return Array.isArray(sessions) ? sessions : (sessions?.results || []);
    } catch (error) {
      if ((error as any)?.response?.status === 404 || 
          ((error as any)?.response?.data && Object.keys((error as any).response.data).length === 0)) {
        return [];
      }
      throw this.handleApiError(error, 'Failed to load today\'s quiz sessions');
    }
  }

  async getSession(sessionId: string): Promise<DiagnosticSession> {
    try {
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to load quiz session');
    }
  }

  async createSession(request: CreateQuizSessionRequest): Promise<DiagnosticSession> {
    try {
      const headers = buildTestModeHeaders()
      const difficultyMap: Record<string, number> = {
        BEGINNER: 1,
        INTERMEDIATE: 3,
        ADVANCED: 4,
        EXPERT: 5,
      } as const
      const deliveryMap: Record<string, string> = {
        IMMEDIATE: 'IMMEDIATE',
        DEFERRED: 'DEFERRED_FEEDBACK',
      } as const
      const pid = normalizeProjectId((request as any).project)

      // Ensure question_mix sums to max_questions; if missing, create a balanced mix
      let question_mix = request.question_mix
      if (!question_mix) {
        const max = Math.max(1, request.max_questions || 3)
        const base = Math.floor(max / 3)
        const remainder = max % 3
        question_mix = { MCQ: base, SHORT_ANSWER: base, PRINCIPLE: base }
        if (remainder >= 1) question_mix.MCQ += 1
        if (remainder === 2) question_mix.SHORT_ANSWER += 1
      }

      const payload = {
        project: pid,
        topic: request.topic,
        source_ids: request.source_ids,
        question_mix,
        difficulty: difficultyMap[request.difficulty] ?? 2,
        delivery_mode: deliveryMap[request.delivery_mode] ?? 'DEFERRED_FEEDBACK',
        max_questions: request.max_questions,
      }

      const response = await axiosGeneration.post('quizzes/generate/', payload, { headers });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to create quiz session');
    }
  }

  async updateSession(sessionId: string, request: UpdateQuizSessionRequest): Promise<DiagnosticSession> {
    try {
      const response = await axiosGeneration.patch(`${this.baseUrl}${sessionId}/`, request);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to update quiz session');
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await axiosGeneration.delete(`${this.baseUrl}${sessionId}/`);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to delete quiz session');
    }
  }

  async startSession(sessionId: string): Promise<StartQuizSessionResponse> {
    try {
      const response = await axiosGeneration.post(`${this.baseUrl}${sessionId}/start/`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to start quiz session');
    }
  }

  async submitAnswer(sessionId: string, request: SubmitQuizAnswerRequest): Promise<SubmitQuizAnswerResponse> {
    try {
      const response = await axiosGeneration.post(`${this.baseUrl}${sessionId}/responses/`, {
        question: request.question_id,
        user_answer: request.user_answer,
        time_taken_sec: request.time_taken_sec
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to submit answer');
    }
  }

  async getSessionQuestions(sessionId: string): Promise<DiagnosticQuestion[]> {
    try {
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/questions/`);
      const questions = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      return questions;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to load quiz questions');
    }
  }

  async getSessionResponses(sessionId: string): Promise<DiagnosticResponse[]> {
    try {
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/responses/`);
      const responses = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      return responses;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to load quiz responses');
    }
  }

  async getSessionAnalytics(sessionId: string): Promise<DiagnosticAnalytics> {
    try {
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/analytics/`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to load quiz analytics');
    }
  }

  async getProjectStats(projectId: string): Promise<any> {
    try {
      const pid = normalizeProjectId(projectId)
      // Some environments may not expose a stats endpoint; return an empty object on 404
      const response = await axiosGeneration.get(`${this.baseUrl}stats/`, {
        params: { project: pid },
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404,
      });
      return response.status === 404 ? {} : response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Failed to load project statistics');
    }
  }

  private handleApiError(error: any, defaultMessage: string): QuizError {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    let errorType: QuizErrorType = 'UNKNOWN_ERROR';
    let message = defaultMessage;

    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      errorType = 'NETWORK_ERROR';
      message = 'Cannot connect to server. Please check your connection.';
    }
    else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorType = 'TIMEOUT_ERROR';
      message = 'Request timed out. Please try again.';
    }
    else if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      switch (status) {
        case 400:
          errorType = 'VALIDATION_ERROR';
          message = responseData?.error || responseData?.message || 'Invalid request data';
          break;
        case 401:
          errorType = 'AUTHENTICATION_ERROR';
          message = 'Please log in to continue';
          break;
        case 403:
          errorType = 'PERMISSION_ERROR';
          message = 'You don\'t have permission to perform this action';
          break;
        case 404:
          errorType = 'NOT_FOUND_ERROR';
          message = 'Quiz session not found';
          break;
        case 500:
          errorType = 'SERVER_ERROR';
          message = 'Server error. Please try again later';
          break;
        default:
          errorType = 'SERVER_ERROR';
          message = responseData?.error || responseData?.message || defaultMessage;
      }
    }
    else if (error.message) {
      message = error.message;
    }

    return {
      code: errorType,
      message,
      details: error.response?.data || error,
      timestamp: new Date()
    };
  }
}

export const quizApi = new QuizApiService();
