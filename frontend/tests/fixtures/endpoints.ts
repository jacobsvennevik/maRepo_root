export const API_BASE = 'http://localhost:8000/api/';

export const PROJECT_ENDPOINTS = (projectId: string) => ({
  project: `projects/${projectId}/`,
  flashcardSets: `projects/${projectId}/flashcard-sets/`,
  flashcardSet: (setId: string | number) => `projects/${projectId}/flashcard-sets/${setId}/`,
  flashcardsForSet: (setId: string | number) => `projects/${projectId}/flashcard-sets/${setId}/flashcards/`,
  quizzes: `projects/${projectId}/quizzes/`,
  quiz: (quizId: string | number) => `projects/${projectId}/quizzes/${quizId}/`,
  quizStart: (quizId: string | number) => `projects/${projectId}/quizzes/${quizId}/start/`,
  quizAnalytics: (quizId: string | number) => `projects/${projectId}/quizzes/${quizId}/analytics/`,
  quizStatistics: `projects/${projectId}/quiz-statistics/`,
});

export const QUIZ_MISC_ENDPOINTS = {
  sessionsSubmit: (sessionId: string | number) => `quiz-sessions/${sessionId}/submit-answer/`,
  sessionsResults: (sessionId: string | number) => `quiz-sessions/${sessionId}/results/`,
  templates: 'quiz-templates/',
  templateGenerate: (templateId: string | number) => `quiz-templates/${templateId}/generate/`,
};

export const ALL_ENDPOINT_SAMPLES: string[] = [
  PROJECT_ENDPOINTS('p').project,
  PROJECT_ENDPOINTS('p').flashcardSets,
  PROJECT_ENDPOINTS('p').flashcardSet('s'),
  PROJECT_ENDPOINTS('p').flashcardsForSet('s'),
  PROJECT_ENDPOINTS('p').quizzes,
  PROJECT_ENDPOINTS('p').quiz('q'),
  PROJECT_ENDPOINTS('p').quizStart('q'),
  PROJECT_ENDPOINTS('p').quizAnalytics('q'),
  PROJECT_ENDPOINTS('p').quizStatistics,
  QUIZ_MISC_ENDPOINTS.sessionsSubmit('sess'),
  QUIZ_MISC_ENDPOINTS.sessionsResults('sess'),
  QUIZ_MISC_ENDPOINTS.templates,
  QUIZ_MISC_ENDPOINTS.templateGenerate('tpl'),
];

export default {
  API_BASE,
  PROJECT_ENDPOINTS,
  QUIZ_MISC_ENDPOINTS,
  ALL_ENDPOINT_SAMPLES,
};

