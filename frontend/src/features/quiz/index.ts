import { axiosGeneration } from "@/lib/axios";

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

export const quizApi = {
  async listSessions(params: { project: string }) {
    const res = await axiosGeneration.get(`/api/diagnostic-sessions/`, {
      params,
    });
    return res.data as DiagnosticSession[];
  },

  async listToday(params: { project: string }) {
    const res = await axiosGeneration.get(`/api/diagnostic-sessions/today/`, {
      params,
    });
    return res.data as DiagnosticSession[];
  },

  async generate(req: GenerateDiagnosticRequest) {
    const res = await axiosGeneration.post(`/api/diagnostics/generate/`, req);
    return res.data as DiagnosticSession;
  },

  async start(sessionId: string) {
    const res = await axiosGeneration.post(
      `/api/diagnostic-sessions/${sessionId}/start/`
    );
    return res.data as StartSessionResponse;
  },
};

// Public API for quiz feature
export {};



