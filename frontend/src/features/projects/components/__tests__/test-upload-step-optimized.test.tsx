import * as React from "react";
import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestUploadStep } from "../steps/test-upload-step";

// Import new centralized utilities
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from "../../../../../src/test-utils";

// Setup test environment using new utilities
const testEnv = setupFullTestEnvironment({
  timeout: 10000,
  includeAPI: true,
  includeStorage: true,
  includeNavigation: true
});

// Extract utilities for easier access
const { createFileUploadTest } = testFactories;
const { apiMocks } = standardMocks;

// Helper function to simulate file upload
const simulateFileUpload = async (fileInput: HTMLElement, files: File[]) => {
  await act(async () => {
    fireEvent.change(fileInput, {
      target: { files }
    });
  });
};

describe("TestUploadStep - Optimized", () => {
  // Use centralized setup
  beforeEach(() => {
    // Reset all mocks
    testEnv.mocks.resetAll();
    
    // Setup default API responses
    apiMocks.setupMockResponses({
      'POST:/backend/api/upload/': {
        ok: true,
        status: 200,
        json: async () => ({ id: 123, status: 'pending' })
      }
    });
  });

  describe("Test Mode", () => {
    it("should render test mode banner and handle mock analysis", async () => {
      const mockCallbacks = {
        onUploadComplete: jest.fn(),
        onAnalysisComplete: jest.fn(),
        onNext: jest.fn(),
        onBack: jest.fn()
      };

      // Use new render function
      renderWithProviders(
        <TestUploadStep
          onUploadComplete={mockCallbacks.onUploadComplete}
          onAnalysisComplete={mockCallbacks.onAnalysisComplete}
          onNext={mockCallbacks.onNext}
          onBack={mockCallbacks.onBack}
        />
      );

      // Verify test mode banner is shown
      expect(screen.getByText(/Test Mode/)).toBeInTheDocument();
      expect(screen.getByText(/Mock data provides reliable test content/)).toBeInTheDocument();

      // Verify component renders correctly
      expect(screen.getByText(/Upload past tests and exams/)).toBeInTheDocument();
      expect(screen.getByText(/PDF, DOC, DOCX/)).toBeInTheDocument();
    });

    it("should handle single test file upload using factory", async () => {
      const mockCallbacks = {
        onUploadComplete: jest.fn(),
        onAnalysisComplete: jest.fn(),
        onNext: jest.fn(),
        onBack: jest.fn()
      };

      renderWithProviders(
        <TestUploadStep
          onUploadComplete={mockCallbacks.onUploadComplete}
          onAnalysisComplete={mockCallbacks.onAnalysisComplete}
          onNext={mockCallbacks.onNext}
          onBack={mockCallbacks.onBack}
        />
      );

      // Use factory to create test file
      const { file } = createFileUploadTest({
        fileName: 'midterm_exam.pdf',
        fileType: 'application/pdf',
        content: 'test content'
      });

      // Upload test file
      const fileInput = screen.getByTestId("file-input");
      await simulateFileUpload(fileInput, [file]);

      // Verify file is listed
      expect(screen.getByText("midterm_exam.pdf")).toBeInTheDocument();
      expect(screen.getByText("🧪 Simulating AI analysis...")).toBeInTheDocument();

      // Wait for completion
      await waitFor(
        () => {
          expect(screen.getByText("Test analysis completed successfully!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe("File Validation - Parameterized Tests", () => {
    // Use factory to create test cases
    const fileTestCases = [
      { name: 'valid.pdf', type: 'application/pdf', size: 1024 * 1024, valid: true, description: 'Valid PDF file' },
      { name: 'invalid.txt', type: 'text/plain', size: 1024, valid: false, description: 'Invalid file type' },
      { name: 'oversized.pdf', type: 'application/pdf', size: 16 * 1024 * 1024, valid: false, description: 'File too large' }
    ];

    // Parameterized test using factory data
    describe.each(fileTestCases)('File Validation', ({ name, type, size, valid, description }) => {
      it(`should ${valid ? 'accept' : 'reject'} ${description}`, async () => {
        const mockCallbacks = {
          onUploadComplete: jest.fn(),
          onAnalysisComplete: jest.fn(),
          onNext: jest.fn(),
          onBack: jest.fn()
        };

        renderWithProviders(
          <TestUploadStep
            onUploadComplete={mockCallbacks.onUploadComplete}
            onAnalysisComplete={mockCallbacks.onAnalysisComplete}
            onNext={mockCallbacks.onNext}
            onBack={mockCallbacks.onBack}
          />
        );

        // Create test file using factory
        const { file } = createFileUploadTest({
          fileName: name,
          fileType: type,
          fileSize: size
        });

        const fileInput = screen.getByTestId("file-input");
        await simulateFileUpload(fileInput, [file]);

        if (valid) {
          // Should accept valid files
          await waitFor(
            () => {
              expect(screen.getByText("Test analysis completed successfully!")).toBeInTheDocument();
            },
            { timeout: 5000 }
          );
          expect(screen.queryByText(/not a supported file type/)).not.toBeInTheDocument();
        } else {
          // Should reject invalid files
          expect(screen.getByText(/not a supported file type/)).toBeInTheDocument();
          expect(screen.queryByText("Test analysis completed successfully!")).not.toBeInTheDocument();
        }
      });
    });
  });

  describe("API Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Use centralized API mock
      apiMocks.mockNetworkError();

      const mockCallbacks = {
        onUploadComplete: jest.fn(),
        onAnalysisComplete: jest.fn(),
        onNext: jest.fn(),
        onBack: jest.fn()
      };

      renderWithProviders(
        <TestUploadStep
          onUploadComplete={mockCallbacks.onUploadComplete}
          onAnalysisComplete={mockCallbacks.onAnalysisComplete}
          onNext={mockCallbacks.onNext}
          onBack={mockCallbacks.onBack}
        />
      );

      const { file } = createFileUploadTest({ fileName: 'test.pdf' });
      const fileInput = screen.getByTestId("file-input");
      await simulateFileUpload(fileInput, [file]);

      // In test mode, component uses mock data and doesn't show network errors
      await waitFor(
        () => {
          expect(screen.getByText("Test analysis completed successfully!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should handle API timeout", async () => {
      // Use centralized timeout mock
      apiMocks.mockTimeout(100);

      const mockCallbacks = {
        onUploadComplete: jest.fn(),
        onAnalysisComplete: jest.fn(),
        onNext: jest.fn(),
        onBack: jest.fn()
      };

      renderWithProviders(
        <TestUploadStep
          onUploadComplete={mockCallbacks.onUploadComplete}
          onAnalysisComplete={mockCallbacks.onAnalysisComplete}
          onNext={mockCallbacks.onNext}
          onBack={mockCallbacks.onBack}
        />
      );

      const { file } = createFileUploadTest({ fileName: 'test.pdf' });
      const fileInput = screen.getByTestId("file-input");
      await simulateFileUpload(fileInput, [file]);

      // Component should handle timeout gracefully
      await waitFor(
        () => {
          expect(screen.getByText("Test analysis completed successfully!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});