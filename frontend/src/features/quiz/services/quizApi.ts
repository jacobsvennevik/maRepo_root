/**
 * Quiz API Service
 * 
 * Centralized service for all quiz-related API operations,
 * following the established FlashcardApiService pattern.
 */

import { axiosApi, axiosGeneration } from '@/lib/axios';
import { isTestMode } from '@/features/projects/services/upload-utils';
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
} from './types';

export class QuizApiService {
  private baseUrl = 'diagnostic-sessions/';
  private generationUrl = 'diagnostics/';

  /**
   * Get all quiz sessions for a project
   */
  async getProjectSessions(projectId: string): Promise<DiagnosticSession[]> {
    try {
      console.log(`🔍 Fetching quiz sessions for project: ${projectId}`);
      
      // Use global endpoint with project filter (like the backend expects)
      const response = await axiosGeneration.get(this.baseUrl, {
        params: { project: projectId }
      });
      
      // Handle both array and paginated responses
      const sessions = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      console.log(`✅ Loaded ${sessions.length} quiz sessions`);
      
      // If no sessions found, return empty array (this is normal for new projects)
      if (sessions.length === 0) {
        console.log(`ℹ️ No quiz sessions found for project ${projectId} - this is normal for new projects`);
      }
      
      return sessions;
    } catch (error) {
      console.error('❌ Failed to fetch quiz sessions:', error);
      
      // If it's a 404 or empty response, return empty array instead of throwing
      if (error.response?.status === 404 || 
          (error.response?.data && Object.keys(error.response.data).length === 0)) {
        console.log(`ℹ️ No quiz sessions endpoint found for project ${projectId} - returning empty array`);
        return [];
      }
      
      throw this.handleApiError(error, 'Failed to load quiz sessions');
    }
  }

  /**
   * Get sessions scheduled for today
   */
  async getTodaySessions(projectId: string): Promise<DiagnosticSession[]> {
    try {
      console.log(`📅 Fetching today's quiz sessions for project: ${projectId}`);
      
      // Use global endpoint with project filter
      const response = await axiosGeneration.get(`${this.baseUrl}today/`, {
        params: { project: projectId }
      });
      
      const sessions = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      console.log(`✅ Loaded ${sessions.length} sessions for today`);
      return sessions;
    } catch (error) {
      console.error('❌ Failed to fetch today\'s sessions:', error);
      throw this.handleApiError(error, 'Failed to load today\'s sessions');
    }
  }

  /**
   * Get a specific quiz session by ID
   */
  async getSession(sessionId: string): Promise<DiagnosticSession> {
    try {
      console.log(`🔍 Fetching quiz session: ${sessionId}`);
      
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/`);
      console.log(`✅ Loaded quiz session: ${response.data.title}`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to load quiz session');
    }
  }

  /**
   * Create a new quiz session
   */
  async createSession(request: CreateQuizSessionRequest): Promise<DiagnosticSession> {
    try {
      console.log('🚀 Creating new quiz session:', request);
      
      const headers: any = {};
      
      // Add test mode header if in test mode (backend will handle AI mocking)
      if (isTestMode()) {
        headers['X-Test-Mode'] = 'true';
        console.log('🧪 Test mode: Adding X-Test-Mode header for backend AI mocking');
      }

      // Use the new quiz generation endpoint
      const response = await axiosGeneration.post('quizzes/generate/', request, {
        headers
      });
      
      console.log(`✅ Created quiz session: ${response.data.title}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create quiz session:', error);
      throw this.handleApiError(error, 'Failed to create quiz session');
    }
  }

  /**
   * Update an existing quiz session
   */
  async updateSession(sessionId: string, request: UpdateQuizSessionRequest): Promise<DiagnosticSession> {
    try {
      console.log(`📝 Updating quiz session ${sessionId}:`, request);
      
      const response = await axiosGeneration.patch(`${this.baseUrl}${sessionId}/`, request);
      console.log(`✅ Updated quiz session: ${response.data.title}`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to update quiz session');
    }
  }

  /**
   * Delete a quiz session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting quiz session: ${sessionId}`);
      
      await axiosGeneration.delete(`${this.baseUrl}${sessionId}/`);
      console.log(`✅ Deleted quiz session: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Failed to delete session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to delete quiz session');
    }
  }

  /**
   * Start a quiz session and get questions
   */
  async startSession(sessionId: string): Promise<StartQuizSessionResponse> {
    try {
      console.log(`▶️ Starting quiz session: ${sessionId}`);
      
      const response = await axiosGeneration.post(`${this.baseUrl}${sessionId}/start/`);
      console.log(`✅ Started quiz session with ${response.data.questions?.length || 0} questions`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to start session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to start quiz session');
    }
  }

  /**
   * Submit an answer for a quiz question
   */
  async submitAnswer(sessionId: string, request: SubmitQuizAnswerRequest): Promise<SubmitQuizAnswerResponse> {
    try {
      console.log(`📝 Submitting answer for question ${request.question_id}`);
      
      const response = await axiosGeneration.post(`${this.baseUrl}${sessionId}/responses/`, {
        question: request.question_id,
        user_answer: request.user_answer,
        time_taken_sec: request.time_taken_sec
      });
      
      console.log(`✅ Answer submitted: ${response.data.is_correct ? 'Correct' : 'Incorrect'}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to submit answer:`, error);
      throw this.handleApiError(error, 'Failed to submit answer');
    }
  }

  /**
   * Get questions for a quiz session
   */
  async getSessionQuestions(sessionId: string): Promise<DiagnosticQuestion[]> {
    try {
      console.log(`❓ Fetching questions for session: ${sessionId}`);
      
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/questions/`);
      const questions = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      console.log(`✅ Loaded ${questions.length} questions`);
      return questions;
    } catch (error) {
      console.error(`❌ Failed to fetch questions for session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to load quiz questions');
    }
  }

  /**
   * Get responses for a quiz session
   */
  async getSessionResponses(sessionId: string): Promise<DiagnosticResponse[]> {
    try {
      console.log(`📊 Fetching responses for session: ${sessionId}`);
      
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/responses/`);
      const responses = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      console.log(`✅ Loaded ${responses.length} responses`);
      return responses;
    } catch (error) {
      console.error(`❌ Failed to fetch responses for session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to load quiz responses');
    }
  }

  /**
   * Get analytics for a quiz session
   */
  async getSessionAnalytics(sessionId: string): Promise<DiagnosticAnalytics> {
    try {
      console.log(`📈 Fetching analytics for session: ${sessionId}`);
      
      const response = await axiosGeneration.get(`${this.baseUrl}${sessionId}/analytics/`);
      console.log(`✅ Loaded analytics: ${response.data.accuracy_percentage}% accuracy`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch analytics for session ${sessionId}:`, error);
      throw this.handleApiError(error, 'Failed to load quiz analytics');
    }
  }

  /**
   * Get project-level quiz statistics
   */
  async getProjectStats(projectId: string): Promise<any> {
    try {
      console.log(`📊 Fetching project quiz stats: ${projectId}`);
      
      const response = await axiosGeneration.get(`${this.baseUrl}stats/`, {
        params: { project: projectId }
      });
      
      console.log(`✅ Loaded project stats`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch project stats:`, error);
      throw this.handleApiError(error, 'Failed to load project statistics');
    }
  }

  /**
   * Bulk operations
   */
  async bulkDeleteSessions(sessionIds: string[]): Promise<void> {
    try {
      console.log(`🗑️ Bulk deleting ${sessionIds.length} sessions`);
      
      await axiosGeneration.post(`${this.baseUrl}bulk-delete/`, {
        session_ids: sessionIds
      });
      
      console.log(`✅ Bulk deleted ${sessionIds.length} sessions`);
    } catch (error) {
      console.error(`❌ Failed to bulk delete sessions:`, error);
      throw this.handleApiError(error, 'Failed to delete selected sessions');
    }
  }

  async bulkUpdateSessions(sessionIds: string[], updates: UpdateQuizSessionRequest): Promise<void> {
    try {
      console.log(`📝 Bulk updating ${sessionIds.length} sessions`);
      
      await axiosGeneration.post(`${this.baseUrl}bulk-update/`, {
        session_ids: sessionIds,
        updates
      });
      
      console.log(`✅ Bulk updated ${sessionIds.length} sessions`);
    } catch (error) {
      console.error(`❌ Failed to bulk update sessions:`, error);
      throw this.handleApiError(error, 'Failed to update selected sessions');
    }
  }

  /**
   * Comprehensive error handling following established patterns
   */
  private handleApiError(error: any, defaultMessage: string): QuizError {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    let errorType: QuizErrorType = 'UNKNOWN_ERROR';
    let message = defaultMessage;

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      errorType = 'NETWORK_ERROR';
      message = 'Cannot connect to server. Please check your connection.';
    }
    // Timeout errors
    else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorType = 'TIMEOUT_ERROR';
      message = 'Request timed out. Please try again.';
    }
    // HTTP errors
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
    // Other errors
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

// Export singleton instance following established pattern
export const quizApi = new QuizApiService();
