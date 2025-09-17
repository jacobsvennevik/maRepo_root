import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock all the dependencies first
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("next/dynamic", () => () => {
  const DynamicComponent = () => <div>Calendar</div>;
  return DynamicComponent;
});

// Stub KeyboardShortcuts which uses useState and UI internals
jest.mock('../guided-setup/components/KeyboardShortcuts', () => () => <div data-testid="keyboard-shortcuts" />);

// Stub StepIndicator as a named export
jest.mock('../guided-setup/components/StepIndicator', () => ({
  StepIndicator: () => <div role="progressbar" data-testid="step-indicator" />,
}));

// Stub the features barrel to provide all step components and helpers
jest.mock('@/features/projects', () => ({
  ProjectNameStep: ({ projectName, onProjectNameChange }: any) => (
    <div data-testid="project-name-step">
      <input
        value={projectName || ""}
        onChange={(e) => onProjectNameChange(e.target.value)}
      />
    </div>
  ),
  EducationLevelStep: ({ testLevel, onTestLevelChange }: any) => (
    <div data-testid="education-level-step">
      <button onClick={() => onTestLevelChange("high-school")}>High School</button>
    </div>
  ),
  SyllabusUploadStep: ({ onUploadComplete, onNext }: any) => (
    <div data-testid="syllabus-upload-step">
      <button onClick={() => { onUploadComplete("test-project", {}, "test.pdf"); onNext?.(); }}>Upload</button>
    </div>
  ),
  ExtractionResultsStep: ({ onConfirm }: any) => (
    <div data-testid="extraction-results-step">
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
  CourseContentUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="course-content-upload-step">
      <button onClick={() => onUploadComplete([], [], [])}>Upload</button>
    </div>
  ),
  TestUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="test-upload-step">
      <button onClick={() => onUploadComplete([])}>Upload</button>
    </div>
  ),
  SkipButton: ({ onSkip, text }: any) => (
    <button onClick={onSkip}>{text || 'Skip'}</button>
  ),
  ProjectSummaryColorful: ({ onBack }: any) => (
    <div data-testid="project-summary-colorful">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Mock all UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioGroupItem: ({ value }: any) => <input type="radio" value={value} />,
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value }: any) => (
    <div role="progressbar" aria-valuenow={value}>
      {value}%
    </div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

// Mock icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
  HelpCircle: () => <span>?</span>,
  Check: () => <span>✓</span>,
  Target: () => <span>◎</span>,
  BookOpen: () => <span>📖</span>,
  Users: () => <span>👥</span>,
  CalendarDays: () => <span>📅</span>,
  Upload: () => <span>⬆️</span>,
  FileText: () => <span>📄</span>,
  Edit3: () => <span>✎</span>,
  X: () => <span>✕</span>,
  Plus: () => <span>+</span>,
  FileCheck: () => <span>✓</span>,
  Presentation: () => <span>🎯</span>,
  FlaskConical: () => <span>🧪</span>,
  Hand: () => <span>✋</span>,
  Home: () => <span>🏠</span>,
  Users2: () => <span>👥</span>,
  GraduationCap: () => <span>🎓</span>,
  CheckCircle: () => <span>✅</span>,
}));

// Mock hooks
jest.mock("../../hooks/useAutoSave", () => ({
  useAutoSave: () => ({
    loadFromStorage: jest.fn().mockReturnValue(null),
    clearStorage: jest.fn(),
  }),
}));

jest.mock("../../hooks/useProjectSetup", () => ({
  useProjectSetup: () => ({
    setup: {
      projectName: "Test Project",
      purpose: "good-grades",
      testLevel: "high-school",
      evaluationTypes: ["exam", "quiz"],
      testFiles: [],
      importantDates: [],
      courseFiles: [],
      uploadedFiles: [],
      timeframe: "1-month",
      goal: "Pass the exam",
      studyFrequency: "daily",
      collaboration: "solo",
    },
    setSetup: jest.fn(),
    hasUnsavedChanges: false,
    setHasUnsavedChanges: jest.fn(),
    handleOptionSelect: jest.fn(),
    handleEvaluationTypeToggle: jest.fn(),
    handleAddDate: jest.fn(),
    handleRemoveDate: jest.fn(),
    handleFileUpload: jest.fn(),
    handleCourseFileUpload: jest.fn(),
    handleTestFileUpload: jest.fn(),
    handleRemoveFile: jest.fn(),
    handleRemoveCourseFile: jest.fn(),
    handleRemoveTestFile: jest.fn(),
    handleApplyAITopics: jest.fn(),
    handleApplyAIDates: jest.fn(),
    handleApplyAITestTypes: jest.fn(),
    handleApplyAIRecommendations: jest.fn(),
  }),
}));

// Mock guided-setup specific hooks used by the component
jest.mock("../guided-setup/hooks/useGuidedSetupState", () => ({
  useGuidedSetupState: () => ({
    setup: {
      projectName: "",
      testLevel: "",
    },
    extractedData: null,
    setExtractedData: jest.fn(),
    syllabusFileName: "",
    isSyllabusAnalysisComplete: false,
    setHasUnsavedChanges: jest.fn(),
    handleOptionSelect: jest.fn(),
    handleSyllabusUploadComplete: jest.fn(),
    handleCourseContentUploadComplete: jest.fn(),
    handleTestUploadComplete: jest.fn(),
    resetSyllabusUploadState: jest.fn(),
  }),
}));

jest.mock("../guided-setup/hooks/useStepNavigation", () => ({
  useStepNavigation: () => ({
    currentStepIndex: 1,
    currentStepData: {
      id: "projectName",
      title: "Project Name",
      description: "Enter your project name",
      icon: () => <span>📝</span>,
    },
    isFirstStep: true,
    isLastStep: false,
    showSummary: false,
    setShowSummary: jest.fn(),
    progress: 10,
    getCurrentStepIndex: () => 1,
    getTotalSteps: () => 6,
    isStepComplete: () => false,
    handleNext: jest.fn(),
    handleBack: jest.fn(),
    handleSkip: jest.fn(),
    handleBackWithCleanup: jest.fn(),
    canSkipCurrentStep: () => true,
  }),
}));

// Mock step components
jest.mock("../steps", () => ({
  ProjectNameStep: ({ projectName, onProjectNameChange }: any) => (
    <div data-testid="project-name-step">
      <input
        value={projectName || ""}
        onChange={(e) => onProjectNameChange(e.target.value)}
      />
    </div>
  ),
  PurposeStep: ({ value, onSelect }: any) => (
    <div data-testid="purpose-step">
      <button onClick={() => onSelect("test")}>Test Purpose</button>
    </div>
  ),
  EducationLevelStep: ({ value, onSelect }: any) => (
    <div data-testid="education-level-step">
      <button onClick={() => onSelect("high-school")}>High School</button>
    </div>
  ),
  SyllabusUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="syllabus-upload-step">
      <button onClick={() => onUploadComplete("test-project", {}, "test.pdf")}>
        Upload
      </button>
    </div>
  ),
  ExtractionResultsStep: ({ onConfirm }: any) => (
    <div data-testid="extraction-results-step">
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
  LearningPreferencesStep: ({ onCourseTypeChange }: any) => (
    <div data-testid="learning-preferences-step">
      <button onClick={() => onCourseTypeChange("stem")}>
        Set Learning Preferences
      </button>
    </div>
  ),
  CourseContentUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="course-content-upload-step">
      <button onClick={() => onUploadComplete([], [])}>Upload</button>
    </div>
  ),

  TestUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="test-upload-step">
      <button onClick={() => onUploadComplete([])}>Upload</button>
    </div>
  ),
  TimelineStep: ({ onTimeframeChange }: any) => (
    <div data-testid="timeline-step">
      <button onClick={() => onTimeframeChange("1-month")}>1 Month</button>
    </div>
  ),
  GoalStep: ({ onGoalChange }: any) => (
    <div data-testid="goal-step">
      <button onClick={() => onGoalChange("Pass")}>Set Goal</button>
    </div>
  ),
  StudyFrequencyStep: ({ onStudyFrequencyChange }: any) => (
    <div data-testid="study-frequency-step">
      <button onClick={() => onStudyFrequencyChange("daily")}>Daily</button>
    </div>
  ),
  CollaborationStep: ({ onCollaborationChange }: any) => (
    <div data-testid="collaboration-step">
      <button onClick={() => onCollaborationChange("solo")}>Solo</button>
    </div>
  ),
}));

// Mock other dependencies
jest.mock("../project-summary", () => ({
  ProjectSummary: () => (
    <div data-testid="project-summary">Project Summary</div>
  ),
}));

jest.mock("../../services/api", () => ({
  createProject: jest.fn().mockResolvedValue({ id: "test-project" }),
  uploadFile: jest.fn().mockResolvedValue({ id: "test-file" }),
}));

jest.mock("../../utils", () => ({
  formatFileSize: (size: number) => `${size} bytes`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

jest.mock("../../services/index", () => ({
  SCHOOL_PURPOSE_OPTIONS: [{ value: "good-grades", label: "Good Grades" }],
  TEST_LEVEL_OPTIONS: [{ value: "high-school", label: "High School" }],
  TIMEFRAME_OPTIONS: [{ value: "1-month", label: "1 Month" }],
  FREQUENCY_OPTIONS: [{ value: "daily", label: "Daily" }],
  COLLABORATION_OPTIONS: [{ value: "solo", label: "Solo" }],
}));

// Import the component after all mocks are set up
import GuidedSetup from "../guided-setup";

describe("GuidedSetup", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<GuidedSetup onBack={mockOnBack} />);
    expect(screen.getByTestId("project-name-step")).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    render(<GuidedSetup onBack={mockOnBack} />);
    expect(screen.getByTestId("step-indicator")).toBeInTheDocument();
  });

  it("handles navigation", () => {
    render(<GuidedSetup onBack={mockOnBack} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
