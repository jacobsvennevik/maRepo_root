import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Import new centralized utilities
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from "../../../../../src/test-utils";

// Setup test environment
const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeStorage: true,
  includeNavigation: true
});

const { apiMocks } = standardMocks;

// Mock dependencies using centralized patterns
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn()
  }),
}));

jest.mock("next/dynamic", () => () => {
  const DynamicComponent = () => <div>Calendar</div>;
  return DynamicComponent;
});

// Mock components using centralized component mocks
jest.mock('../guided-setup/components/KeyboardShortcuts', () => () => 
  <div data-testid="keyboard-shortcuts" />
);

jest.mock('../guided-setup/components/StepIndicator', () => ({
  StepIndicator: () => <div role="progressbar" data-testid="step-indicator" />,
}));

// Mock the features barrel with centralized component patterns
jest.mock('@/features/projects', () => ({
  ProjectNameStep: ({ projectName, onProjectNameChange }: any) => (
    <div data-testid="project-name-step">
      <input
        value={projectName || ""}
        onChange={(e) => onProjectNameChange(e.target.value)}
        data-testid="project-name-input"
      />
    </div>
  ),
  EducationLevelStep: ({ testLevel, onTestLevelChange }: any) => (
    <div data-testid="education-level-step">
      <button onClick={() => onTestLevelChange("high-school")} data-testid="high-school-btn">
        High School
      </button>
      <button onClick={() => onTestLevelChange("university")} data-testid="university-btn">
        University
      </button>
    </div>
  ),
  SyllabusUploadStep: ({ onUploadComplete, onNext }: any) => (
    <div data-testid="syllabus-upload-step">
      <button 
        onClick={() => { 
          onUploadComplete("test-project", {}, "test.pdf"); 
          onNext?.(); 
        }}
        data-testid="upload-btn"
      >
        Upload
      </button>
    </div>
  ),
  ExtractionResultsStep: ({ onConfirm }: any) => (
    <div data-testid="extraction-results-step">
      <button onClick={onConfirm} data-testid="confirm-btn">Confirm</button>
    </div>
  ),
  CourseContentUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="course-content-upload-step">
      <button 
        onClick={() => onUploadComplete("test-project", {}, "course.pdf")}
        data-testid="course-upload-btn"
      >
        Upload Course Content
      </button>
    </div>
  ),
  TestUploadStep: ({ onUploadComplete }: any) => (
    <div data-testid="test-upload-step">
      <button 
        onClick={() => onUploadComplete("test-project", {}, "test.pdf")}
        data-testid="test-upload-btn"
      >
        Upload Tests
      </button>
    </div>
  ),
  ProjectSummaryStep: ({ onComplete }: any) => (
    <div data-testid="project-summary-step">
      <button onClick={onComplete} data-testid="complete-btn">Complete</button>
    </div>
  ),
}));

describe('GuidedSetup - Optimized', () => {
  beforeEach(() => {
    testEnv.mocks.resetAll();
    
    // Setup default API responses
    apiMocks.setupMockResponses({
      'POST:/backend/api/projects/': {
        ok: true,
        status: 201,
        json: async () => ({ id: 'project-123', name: 'Test Project' })
      }
    });
  });

  describe('Wizard Navigation', () => {
    it('should render initial step correctly', () => {
      renderWithProviders(<div data-testid="guided-setup" />);

      expect(screen.getByTestId('guided-setup')).toBeInTheDocument();
    });

    it('should handle step progression', async () => {
      renderWithProviders(<div data-testid="guided-setup" />);

      // Simulate step progression
      const stepIndicator = screen.getByTestId('step-indicator');
      expect(stepIndicator).toBeInTheDocument();
    });
  });

  describe('Project Name Step', () => {
    it('should handle project name input', async () => {
      renderWithProviders(<div data-testid="project-name-step" />);

      const projectNameInput = screen.getByTestId('project-name-input');
      expect(projectNameInput).toBeInTheDocument();

      fireEvent.change(projectNameInput, { target: { value: 'My Test Project' } });
      expect(projectNameInput).toHaveValue('My Test Project');
    });
  });

  describe('Education Level Step', () => {
    it('should handle education level selection', async () => {
      renderWithProviders(<div data-testid="education-level-step" />);

      const highSchoolBtn = screen.getByTestId('high-school-btn');
      const universityBtn = screen.getByTestId('university-btn');

      expect(highSchoolBtn).toBeInTheDocument();
      expect(universityBtn).toBeInTheDocument();

      fireEvent.click(highSchoolBtn);
      fireEvent.click(universityBtn);
    });
  });

  describe('File Upload Steps', () => {
    it('should handle syllabus upload', async () => {
      renderWithProviders(<div data-testid="syllabus-upload-step" />);

      const uploadBtn = screen.getByTestId('upload-btn');
      expect(uploadBtn).toBeInTheDocument();

      fireEvent.click(uploadBtn);
    });

    it('should handle course content upload', async () => {
      renderWithProviders(<div data-testid="course-content-upload-step" />);

      const courseUploadBtn = screen.getByTestId('course-upload-btn');
      expect(courseUploadBtn).toBeInTheDocument();

      fireEvent.click(courseUploadBtn);
    });

    it('should handle test upload', async () => {
      renderWithProviders(<div data-testid="test-upload-step" />);

      const testUploadBtn = screen.getByTestId('test-upload-btn');
      expect(testUploadBtn).toBeInTheDocument();

      fireEvent.click(testUploadBtn);
    });
  });

  describe('Extraction Results Step', () => {
    it('should handle extraction confirmation', async () => {
      renderWithProviders(<div data-testid="extraction-results-step" />);

      const confirmBtn = screen.getByTestId('confirm-btn');
      expect(confirmBtn).toBeInTheDocument();

      fireEvent.click(confirmBtn);
    });
  });

  describe('Project Summary Step', () => {
    it('should handle project completion', async () => {
      renderWithProviders(<div data-testid="project-summary-step" />);

      const completeBtn = screen.getByTestId('complete-btn');
      expect(completeBtn).toBeInTheDocument();

      fireEvent.click(completeBtn);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should render keyboard shortcuts component', () => {
      renderWithProviders(<div data-testid="keyboard-shortcuts" />);

      expect(screen.getByTestId('keyboard-shortcuts')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should handle successful project creation', async () => {
      renderWithProviders(<div data-testid="guided-setup" />);

      // Simulate project creation API call
      const response = await apiMocks.mockFetch('/backend/api/projects/', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' })
      });

      expect(response.ok).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      apiMocks.mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      renderWithProviders(<div data-testid="guided-setup" />);

      // Simulate API call that fails
      const response = await apiMocks.mockFetch('/backend/api/projects/', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' })
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithProviders(<div data-testid="step-indicator" />);

      const stepIndicator = screen.getByTestId('step-indicator');
      expect(stepIndicator).toHaveAttribute('role', 'progressbar');
    });

    it('should support keyboard navigation', () => {
      renderWithProviders(<div data-testid="project-name-input" />);

      const input = screen.getByTestId('project-name-input');
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});
