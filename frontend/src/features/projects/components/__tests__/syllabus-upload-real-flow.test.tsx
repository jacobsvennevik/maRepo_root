// Set environment variables before any imports to ensure they're available when the component is loaded
process.env.NODE_ENV = "development";
process.env.NEXT_PUBLIC_TEST_MODE = "true";

import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { SyllabusUploadStep } from "../steps/syllabus-upload-step";
import {
  createLocalStorageMock,
  createMockProjectSetup,
  createTestFile,
  createMockFetch,
  simulateFileUpload,
} from "../../../../../test-utils/test-helpers";
import {
  setupTestCleanup,
  createAPIServiceMock,
  createUploadTestSetup,
} from "../../../../../test-utils/upload-test-helpers";

// Setup test environment using shared utilities
const { mocks, createBeforeEach, createAfterEach } = createUploadTestSetup();
const localStorageMock = createLocalStorageMock();
const mockFetch = (global as any).fetch || jest.fn();

// Helper function to create test files
const createTestFile = (name: string = "test.pdf", content: string = "test content", type: string = "application/pdf"): File => {
  return new File([content], name, { type });
};

// Helper function to simulate file upload
const simulateFileUpload = async (fileInput: HTMLElement, files: File | File[]) => {
  const fileList = Array.isArray(files) ? files : [files];
  await act(async () => {
    fireEvent.change(fileInput, {
      target: {
        files: fileList,
      },
    });
  });
};

// Mock the mock-data module to ensure isTestMode works correctly
jest.mock("../../services/mock-data", () => ({
  ...jest.requireActual("../../services/mock-data"),
  isTestMode: () => process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_TEST_MODE === "true"
}));

// Mock the API module using shared utilities
jest.mock("../../services/api", () => ({
  createProject: jest.fn().mockResolvedValue({
    id: "project-123",
    name: "Advanced Physics",
    project_type: "school",
  }),
  uploadFileWithProgress: jest.fn(),
  APIError: jest.fn().mockImplementation((message: string, status: number) => {
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = status;
    return error;
  }),
}));

describe("SyllabusUploadStep - Real Issue Reproduction", () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test to ensure clean state
    jest.clearAllMocks();
    mockOnUploadComplete.mockClear();
    mockOnBack.mockClear();
  });

  describe("Production Flow - User Reported Issue", () => {
    beforeEach(() => {
      // Reset to production mode for these tests
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_TEST_MODE = "false";
    });

    it("should handle successful PDF upload and processing flow correctly", async () => {
      // Mock the complete API flow that should happen
      let pollCount = 0;
      mockFetch
        // 1. Upload PDF - should succeed
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 123,
                filename: "syllabus.pdf",
                status: "pending",
              }),
          }),
        )
        // 2. Start processing - should succeed
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                message: "Processing started",
                document_id: 123,
                task_id: "task-123", // Add task_id to fix the error
              }),
          }),
        )
        // 3. Polling requests - return processing status, then completed
        .mockImplementation(() => {
          pollCount++;
          if (pollCount <= 3) {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  id: 123,
                  status: "processing",
                  original_text: "",
                  metadata: {},
                }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  id: 123,
                  status: "completed",
                  original_text: "Course: Advanced Physics",
                  processed_data: {
                    course_name: "Advanced Physics",
                    topics: ["mechanics", "thermodynamics"],
                  },
                  metadata: {
                    course_name: "Advanced Physics",
                    topics: ["mechanics", "thermodynamics"],
                  },
                }),
            });
          }
        });

      const setup = createMockProjectSetup({ projectName: "Advanced Physics" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />,
      );

      // Find the file input and upload the file
      const fileInput = screen.getByTestId("file-input");
      const testFile = createTestFile("syllabus.pdf", "test pdf content");

      await simulateFileUpload(fileInput, testFile);

      // Wait for file to be displayed and analyze button to appear
      await waitFor(() => {
        expect(screen.getByText("syllabus.pdf")).toBeInTheDocument();
        expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
      });

      // Find and click the analyze button
      const analyzeButton = screen.getByTestId("analyze-button");

      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Wait for the processing to complete and callback to be called
      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            "project-123",
            expect.objectContaining({
              id: 123,
              status: "completed",
              original_text: "Course: Advanced Physics",
              metadata: expect.objectContaining({
                course_name: "Advanced Physics",
                topics: ["mechanics", "thermodynamics"],
              }),
            }),
            "syllabus.pdf",
          );
        },
        { timeout: 15000 },
      );
    }, 20000);

    it("should handle API failure gracefully and show error message", async () => {
      // Mock upload failure
      mockFetch.mockRejectedValueOnce(new Error("Upload failed"));

      const setup = createMockProjectSetup({ projectName: "Advanced Physics" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />,
      );

      const fileInput = screen.getByTestId("file-input");
      const testFile = createTestFile("syllabus.pdf", "test pdf content");

      await simulateFileUpload(fileInput, testFile);

      // Wait for analyze button to appear
      await waitFor(() => {
        expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
      });

      const analyzeButton = screen.getByTestId("analyze-button");

      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Should show error message - update to match actual error text
      await waitFor(() => {
        expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
      });
    });

    it("should handle processing timeout correctly", async () => {
      // Mock successful upload and processing start
      let pollCount = 0;
      mockFetch
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 123,
                filename: "syllabus.pdf",
                status: "pending",
              }),
          }),
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                message: "Processing started",
                document_id: 123,
                task_id: "task-123", // Add task_id to fix the error
              }),
          }),
        )
        // Mock all polling requests to return processing status (simulating timeout)
        .mockImplementation(() => {
          pollCount++;
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                id: 123,
                status: "processing",
                original_text: "",
                metadata: {},
              }),
          });
        });

      const setup = createMockProjectSetup({ projectName: "Advanced Physics" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
          testTimeoutSeconds={5} // Use 5 seconds for testing
        />,
      );

      const fileInput = screen.getByTestId("file-input");
      const testFile = createTestFile("syllabus.pdf", "test pdf content");

      await simulateFileUpload(fileInput, testFile);

      // Wait for analyze button to appear
      await waitFor(() => {
        expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
      });

      const analyzeButton = screen.getByTestId("analyze-button");

      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Wait for timeout to occur and callback to be called with fallback data
      // Note: Using testTimeoutSeconds={5} so timeout occurs after 5 seconds
      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            "project-123",
            expect.objectContaining({
              id: 123,
              status: "completed",
              original_text: "Course materials for syllabus",
              metadata: expect.objectContaining({
                course_name: "syllabus",
                instructor: "Unknown",
                semester: "Unknown",
                topics: ["Course content will be available after processing"],
                meeting_times: "To be determined",
                important_dates: "Please check with instructor",
                processing_status: "timeout",
                timeout_reason: "Processing took longer than expected"
              }),
            }),
            "syllabus.pdf",
          );
        },
        { timeout: 10000 }, // 10 seconds to allow for component timeout (5s) + buffer
      );
    }, 15000); // 15 seconds total test timeout
  });

  describe("Skip Functionality", () => {
    beforeEach(() => {
      // Test the skip functionality in both test and production modes
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_TEST_MODE = "false";
      
      // Clear all mocks to ensure clean state
      jest.clearAllMocks();
      mockOnUploadComplete.mockClear();
    });

    it("should call onSkip when skip button is clicked and skip extraction results step", async () => {
      const mockOnSkip = jest.fn();

      // Mock fetch to prevent any API calls
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const setup = createMockProjectSetup({ projectName: "Test Project" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onSkip={mockOnSkip}
          onBack={mockOnBack}
        />,
      );

      // Should show skip button
      const skipButton = screen.getByTestId("skip-button");
      expect(skipButton).toBeInTheDocument();

      // Click skip button
      await act(async () => {
        fireEvent.click(skipButton);
      });

      // Should call onSkip
      expect(mockOnSkip).toHaveBeenCalledTimes(1);

      // Wait a bit to ensure no background processing happens
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not trigger any upload or analysis
      expect(mockOnUploadComplete).not.toHaveBeenCalled();

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it("should not show skip button when onSkip prop is not provided", () => {
      const setup = createMockProjectSetup({ projectName: "Test Project" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />,
      );

      // Should not show skip button
      expect(screen.queryByTestId("skip-button")).not.toBeInTheDocument();
    });

    it("should show skip button text correctly", () => {
      const mockOnSkip = jest.fn();

      const setup = createMockProjectSetup({ projectName: "Test Project" });

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onSkip={mockOnSkip}
          onBack={mockOnBack}
        />,
      );

      expect(
        screen.getByText("Skip"),
      ).toBeInTheDocument();
    });
  });

  describe("Test Mode Flow", () => {
    beforeEach(() => {
      // Ensure test mode is enabled for these tests
      process.env.NODE_ENV = "development";
      process.env.NEXT_PUBLIC_TEST_MODE = "true";
      
      // Clear any previous mock calls
      mockFetch.mockClear();
    });

    it("should use mock data in test mode and skip API calls", async () => {
      // Mock fetch to prevent any API calls
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const setup = createMockProjectSetup();

      render(
        <SyllabusUploadStep
          setup={setup}
          onUploadComplete={mockOnUploadComplete}
          onBack={mockOnBack}
        />,
      );

      // Should show test mode indicator
      expect(screen.getByText(/Mock Mode Active/i)).toBeInTheDocument();

      const testFile = createTestFile("syllabus.pdf", "test pdf content");
      const fileInput = screen.getByTestId("file-input");

      await simulateFileUpload(fileInput, testFile);

      // Wait for analyze button to appear
      await waitFor(() => {
        expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
      });

      const analyzeButton = screen.getByTestId("analyze-button");

      await act(async () => {
        fireEvent.click(analyzeButton);
      });

      // Should use mock data and call the callback quickly
      await waitFor(
        () => {
          expect(mockOnUploadComplete).toHaveBeenCalledWith(
            "project-123",
            expect.objectContaining({
              status: "completed",
              metadata: expect.objectContaining({
                course_title: expect.any(String),
              }),
            }),
            "syllabus.pdf",
          );
        },
        { timeout: 3000 },
      );

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
});
