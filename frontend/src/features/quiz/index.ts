// Export the new comprehensive architecture
export { quizApi as QuizApiService } from './services/quizApi';
export { useQuizCenter } from './hooks/useQuizCenter';
export * from './types';
export * from './utils/transformers';

// Enhanced wizard components
export { EnhancedQuizWizard } from './components/QuizWizard';
export * from './components/QuizWizard/steps';
export * from './schemas/quizCreation';

// Shared utilities and hooks
export * from './constants';
export * from './utils';
export * from './hooks';

// Legacy exports for backward compatibility
import { axiosGeneration } from "@/lib/axios";
import { normalizeProjectId } from "@/lib/projectId";
import { isTestMode } from "@/features/projects/services/upload-utils";

// Types aligned with backend diagnostic endpoints
export interface DiagnosticSession {
  id: string;
  project: string;
  title: string;
  status: string;
  time_limit_sec?: number;
  created_at: string;
}

export interface GenerateDiagnosticRequest {
  project: string; // UUID
  topic?: string;
  source_ids?: string[];
  question_mix?: Record<string, number>;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  delivery_mode: "IMMEDIATE" | "DEFERRED";
  max_questions: number;
}

export interface StartSessionResponse {
  session_id: string;
  questions: any[];
  time_limit_sec?: number;
  delivery_mode: string;
}

// Legacy API functions (deprecated - use quizApi instead)
export const quizApi = {
  async listSessions(params: { project: string }) {
    const pid = normalizeProjectId(params.project);
    const res = await axiosGeneration.get(`diagnostic-sessions/`, { params: { project: pid } });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async listToday(params: { project: string }) {
    const pid = normalizeProjectId(params.project);
    const res = await axiosGeneration.get(`diagnostic-sessions/today/`, { params: { project: pid } });
    return Array.isArray(res.data) ? res.data : (res.data?.results || []);
  },

  async generate(req: GenerateDiagnosticRequest) {
    const headers: any = {};
    
    // Add test mode header if in test mode (backend will handle AI mocking)
    if (isTestMode()) {
      headers['X-Test-Mode'] = 'true';
      console.log('🧪 Test mode: Adding X-Test-Mode header for backend AI mocking');
    }

    const difficultyMap: any = { BEGINNER: 1, INTERMEDIATE: 3, ADVANCED: 4, EXPERT: 5 }
    const deliveryMap: any = { IMMEDIATE: 'IMMEDIATE', DEFERRED: 'DEFERRED_FEEDBACK' }
    const pid = normalizeProjectId(req.project)
    const max = Math.max(1, req.max_questions || 3)
    let question_mix = req.question_mix as any
    if (!question_mix) {
      const base = Math.floor(max / 3)
      const remainder = max % 3
      question_mix = { MCQ: base, SHORT_ANSWER: base, PRINCIPLE: base }
      if (remainder >= 1) question_mix.MCQ += 1
      if (remainder === 2) question_mix.SHORT_ANSWER += 1
    }

    const payload = {
      project: pid,
      topic: req.topic,
      source_ids: req.source_ids,
      question_mix,
      difficulty: difficultyMap[req.difficulty] ?? 2,
      delivery_mode: deliveryMap[req.delivery_mode] ?? 'DEFERRED_FEEDBACK',
      max_questions: max,
    }

    const res = await axiosGeneration.post(`diagnostics/generate/`, payload, {
      headers
    });
    return res.data as DiagnosticSession;
  },

  async start(sessionId: string) {
    const res = await axiosGeneration.post(
      `diagnostic-sessions/${sessionId}/start/`
    );
    return res.data as StartSessionResponse;
  },
};

// Public API for quiz feature
export {};



