// Public API for projects feature
export * from "./components/project-card";
export * from "./components/add-project-card";
export * from "./components/ai-metadata-tags";
export * from "./components/ai-metadata-tags-client";
export * from "./components/ProjectErrorBoundary";
export * from "./components/project-type-cards";
export * from "./components/project-summary";
export * from "./components/project-summary-variants";
export * from "./components/guided-setup";
export * from "./components/custom-setup";
export * from "./components/ai/ai-loading";
export * from "./components/ai/ai-preview";
export * from "./components/ai/smart-field-population";
export * from "./components/shared/ErrorBoundary";
export * from "./components/shared/LoadingState";
export * from "./components/shared/SuccessState";
export * from "./components/shared/mock-mode-banner";
export * from "./components/shared/test-file-selector";
export * from "./components/shared/upload-ui";
export * from "./components/shared/hybrid-test-banner";
export * from "./components/steps/course-content-review-step";
export * from "./components/steps/course-content-upload-step";
export * from "./components/steps/project-name-step";
export * from "./components/steps/education-level-step";
export * from "./components/steps/study-frequency-step";
export * from "./components/steps/test-timeline-step";
export * from "./components/steps/syllabus-upload-step";
export * from "./components/steps/extraction-results-step";
export * from "./components/steps/timeline-step";
export * from "./components/steps/test-extraction-results-step";
export * from "./components/steps/course-details-step";
export * from "./components/steps/file-upload-step";
export * from "./components/steps/test-upload-step";
export * from "./components/steps/shared/skip-button";
export * from "./components/steps/shared/help-text";
export * from "./components/steps/shared/success-message";
export * from "./components/steps/shared/loading-spinner";
export * from "./components/steps/shared/simple-radio-group";
export * from "./components/steps/shared/analyze-button";
export * from "./components/steps/shared/radio-card-group";
export * from "./components/steps/shared/use-file-upload";
export * from "./components/layout/page-layout";
export * from "./components/files/file-grid-view";
export * from "./components/files/file-grid-item";
export * from "./components/files/file-list-view";
export * from "./components/files/file-header";
export * from "./components/files/file-stats-cards";
export * from "./components/files/file-details-panel";
export * from "./components/files/storage-usage-sidebar";
export * from "./components/files/file-storage";
export * from "./components/files/file-storage-empty";
export * from "./components/files/file-storage-error";
export * from "./components/files/file-storage-loading";
export * from "./components/files/file-storage-refactored";
export * from "./components/files/file-storage-header";
export * from "./components/files/file-card";
export * from "./components/files/file-list-item";
export * from "./components/files/file-type-breakdown";
export * from "./components/files/drag-drop-zone";
export * from "./components/files/recent-file-card";
export * from "./components/files/mock-data";
export * from "./components/overview/ocean-header";
export * from "./components/overview/learning-journey";
export * from "./components/overview/ocean-action-section";
export * from "./components/overview/ocean-background";
export * from "./components/overview/floating-stats-cards";
export * from "./components/overview/upcoming-voyages";

export * from "./hooks/useOptionalProject";
export * from "./hooks/useStepNavigation";
export * from "./hooks/useAutoSave";
export * from "./hooks/useProjectSetup";
export * from "./hooks/useFileStorage";
export * from "./hooks/use-floating-animation";

export * from "./services/api";
export { getProjects as fetchProjects } from "./services/api";
export * from "./services/mock-data";
export * from "./services/utils";
export * from "./services/ai-analysis";
export * from "./services/cleanup-utils";
export * from "./services/hybrid-test-utils";
export { getAuthHeaders } from "./services/upload-utils";
export * from "./services/evaluation";
export * from "./services/options";
export * from "./services/steps";

export * from "./types";
export * from "./data/mock-projects";

// Default exports for components that need them
export { default as FileStorage } from "./components/files/file-storage-refactored";
export { default as GuidedSetup } from "./components/guided-setup";
export { ProjectProvider } from "./components/overview/project-context";



