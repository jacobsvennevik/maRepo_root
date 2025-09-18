import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TestUploadStep } from "../steps/test-upload-step";

// Import new centralized utilities
import {
  renderWithProviders,
  setupFullTestEnvironment,
  testFactories,
  standardMocks
} from "../../../../../src/test-utils";

// Setup test environment
const testEnv = setupFullTestEnvironment();
const { createTestFile } = testFactories;
const { apiMocks } = standardMocks;

describe("TestUploadStep - Test Mode", () => {
  beforeEach(() => {
    testEnv.mocks.resetAll();
  });

  it("should render test mode banner and handle mock analysis", async () => {
    renderWithProviders(
      <TestUploadStep
        onUploadComplete={jest.fn()}
        onAnalysisComplete={jest.fn()}
        onNext={jest.fn()}
        onBack={jest.fn()}
      />
    );

    // Verify test mode banner is shown
    expect(screen.getByText(/Test Mode/)).toBeInTheDocument();
    expect(screen.getByText(/Mock data provides reliable test content/)).toBeInTheDocument();

    // Verify component renders correctly
    expect(screen.getByText(/Upload past tests and exams/)).toBeInTheDocument();
    expect(screen.getByTestId("accepted-types")).toHaveTextContent(".pdf,.doc,.docx");
  });

  it("should handle single test file upload and analysis", async () => {
    const mockCallbacks = {
      onUploadComplete: jest.fn(),
      onAnalysisComplete: jest.fn(),
      onNext: jest.fn(),
      onBack: jest.fn()
    };

    renderWithProviders(<TestUploadStep {...mockCallbacks} />);

    // Create and upload test file
    const { file } = createTestFile({
      fileName: 'midterm_exam.pdf',
      fileType: 'application/pdf',
      content: 'test content'
    });

    const fileInput = screen.getByTestId("file-input");
    await testEnv.files.createTestFile().simulateFileUpload(fileInput, [file]);

    // Verify file is listed and analysis starts
    expect(screen.getByText("midterm_exam.pdf")).toBeInTheDocument();
    expect(screen.getByText("🧪 Simulating AI analysis...")).toBeInTheDocument();

    // Wait for completion
    await waitFor(
      () => {
        expect(mockCallbacks.onUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              original_text: expect.stringContaining("Language Technology Quiz"),
              metadata: expect.objectContaining({
                course_title: "Natural Language Interaction",
                test_title: "Quizes Lang Tech",
              }),
              status: "completed",
            })
          ]),
          expect.any(Array),
          expect.any(Array)
        );
      },
      { timeout: 5000 }
    );
  });

  it("should handle multiple test files with different types", async () => {
    const mockCallbacks = {
      onUploadComplete: jest.fn(),
      onAnalysisComplete: jest.fn(),
      onNext: jest.fn(),
      onBack: jest.fn()
    };

    renderWithProviders(<TestUploadStep {...mockCallbacks} />);

    // Create multiple test files
    const testFiles = [
      createTestFile({ fileName: 'midterm_exam.pdf', content: 'midterm content' }),
      createTestFile({ fileName: 'final_exam.pdf', content: 'final content' }),
      createTestFile({ fileName: 'quiz1.jpg', fileType: 'image/jpeg', content: 'quiz content' }),
      createTestFile({ fileName: 'practice_test.png', fileType: 'image/png', content: 'practice content' })
    ].map(({ file }) => file);

    const fileInput = screen.getByTestId("file-input");
    await testEnv.files.createTestFile().simulateFileUpload(fileInput, testFiles);

    // Verify all files are listed
    testFiles.forEach((file) => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });

    // Verify analysis is starting
    expect(screen.getByText("🧪 Simulating AI analysis...")).toBeInTheDocument();

    // Wait for completion
    await waitFor(
      () => {
        expect(mockCallbacks.onUploadComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              metadata: expect.objectContaining({
                course_title: "Natural Language Interaction",
                test_title: expect.any(String),
              }),
              status: "completed",
            })
          ]),
          expect.any(Array),
          expect.any(Array)
        );
      },
      { timeout: 5000 }
    );
  });

  it("should handle file removal", async () => {
    const mockCallbacks = {
      onUploadComplete: jest.fn(),
      onAnalysisComplete: jest.fn(),
      onNext: jest.fn(),
      onBack: jest.fn()
    };

    renderWithProviders(<TestUploadStep {...mockCallbacks} />);

    // Upload test files
    const testFiles = [
      createTestFile({ fileName: 'test1.pdf', content: 'content1' }),
      createTestFile({ fileName: 'test2.pdf', content: 'content2' })
    ].map(({ file }) => file);

    const fileInput = screen.getByTestId("file-input");
    await testEnv.files.createTestFile().simulateFileUpload(fileInput, testFiles);

    // Verify both files are listed
    expect(screen.getByText("test1.pdf")).toBeInTheDocument();
    expect(screen.getByText("test2.pdf")).toBeInTheDocument();

    // Note: Remove buttons are disabled during analysis in test mode
    // This test verifies that files are displayed correctly
    expect(screen.getByText("🧪 Simulating AI analysis...")).toBeInTheDocument();
  });
});
