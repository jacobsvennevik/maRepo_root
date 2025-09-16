// Export the new comprehensive architecture
export { quizApi as QuizApiService } from './services/quizApi';
export { useQuizCenter } from './hooks/useQuizCenter';
export * from './types';
export * from './utils/transformers';

// Enhanced wizard components
// export { CreateQuizWizard } from './components/CreateQuizWizard';
export * from './schemas/quizCreation';

// Legacy exports for backward compatibility
import { axiosGeneration } from "@/lib/axios";
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
    const res = await axiosGeneration.get(`diagnostic-sessions/`, {
      params,
    });
    return res.data as DiagnosticSession[];
  },

  async listToday(params: { project: string }) {
    const res = await axiosGeneration.get(`diagnostic-sessions/today/`, {
      params,
    });
    return res.data as DiagnosticSession[];
  },

  async generate(req: GenerateDiagnosticRequest) {
    const headers: any = {};
    
    // Add test mode header if in test mode (backend will handle AI mocking)
    if (isTestMode()) {
      headers['X-Test-Mode'] = 'true';
      console.log('🧪 Test mode: Adding X-Test-Mode header for backend AI mocking');
    }

    const res = await axiosGeneration.post(`diagnostics/generate/`, req, {
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



