/**
 * FileUpload Modular Tests
 * 
 * Modular test suite using reusable patterns and helpers for
 * file upload functionality testing.
 */

import * as React from "react";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { FileUpload } from "./file-upload";
import { 
  renderWithProviders,
  fileUploadHelpers,
  fileValidationHelpers,
  fileUploadScenarios,
  fileUploadTestUtils
} from "../../test-utils";

describe("FileUpload", () => {
  const mockOnUpload = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it("renders with default props", () => {
      renderWithProviders(<FileUpload onUpload={mockOnUpload} />);

      expect(screen.getByText("Drag & drop files here")).toBeInTheDocument();
      expect(screen.getByText("or click to browse")).toBeInTheDocument();
      expect(screen.getByText("Browse files")).toBeInTheDocument();
      expect(screen.getByText(/Max size:/)).toBeInTheDocument();
      expect(screen.getByText(/Supported formats:/)).toBeInTheDocument();
    });

    it("renders with custom props", () => {
      const customProps = {
        onUpload: mockOnUpload,
        title: "Custom Title",
        description: "Custom Description",
        buttonText: "Custom Button",
      };

      renderWithProviders(<FileUpload {...customProps} />);

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Description")).toBeInTheDocument();
      expect(screen.getByText("Custom Button")).toBeInTheDocument();
    });

    it("renders with proper accessibility attributes", () => {
      renderWithProviders(<FileUpload onUpload={mockOnUpload} />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toBeInTheDocument();
    });
  });

  // ============================================================================
  // File Upload Tests (Using Patterns)
  // ============================================================================

  describe('File Upload', () => {
    it('handles single file upload', async () => {
      const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);
      await fileUploadHelpers.uploadFiles(files);
      
      fileUploadHelpers.verifyFileInList(files[0].name);
    });

    it('handles multiple file uploads', async () => {
      const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);
      await fileUploadHelpers.uploadFiles(files);
      
      files.forEach(file => {
        fileUploadHelpers.verifyFileInList(file.name);
      });
    });

    it('handles empty file selection', async () => {
      await fileUploadHelpers.uploadFiles([]);
      fileUploadHelpers.verifyFileCount(0);
    });
  });

  // ============================================================================
  // File Validation Tests (Using Patterns)
  // ============================================================================

  describe('File Validation', () => {
    it('validates file types and sizes', async () => {
      await fileValidationHelpers.testValidationScenarios(fileUploadScenarios.validationScenarios);
    });

    it('handles mixed valid and invalid files', async () => {
      await fileValidationHelpers.testMixedFileValidation();
    });
  });

  // ============================================================================
  // Drag & Drop Tests (Using Patterns)
  // ============================================================================

  describe('Drag & Drop', () => {
    it('handles drag and drop', async () => {
      const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);
      await fileUploadHelpers.uploadFilesViaDragDrop(files);
      
      fileUploadHelpers.verifyFileInList(files[0].name);
    });

    it('handles drag over state', async () => {
      renderWithProviders(<FileUpload onUpload={mockOnUpload} />);

      const dropzone = screen.getByText("Drag & drop files here").closest("div");
      
      if (dropzone) {
        fireEvent.dragOver(dropzone);
        expect(dropzone).toHaveClass('drag-over');
      }
    });

    it('handles multiple file drag and drop', async () => {
      const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);
      await fileUploadHelpers.uploadFilesViaDragDrop(files);
      
      files.forEach(file => {
        fileUploadHelpers.verifyFileInList(file.name);
      });
    });
  });

  // ============================================================================
  // File Management Tests (Using Patterns)
  // ============================================================================

  describe('File Management', () => {
    it('shows file list', () => {
      const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          files={files}
        />
      );

      files.forEach(file => {
        expect(screen.getByText(file.name)).toBeInTheDocument();
      });
    });

    it('handles file removal', async () => {
      const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          onRemove={mockOnRemove}
          files={files}
        />
      );

      fileUploadHelpers.verifyFileInList(files[0].name);
      await fileUploadHelpers.removeFile(files[0].name);
      fileUploadHelpers.verifyFileNotInList(files[0].name);
    });

    it('shows file count', () => {
      const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          files={files}
        />
      );

      fileUploadHelpers.verifyFileCount(files.length);
    });
  });

  // ============================================================================
  // Upload Progress Tests (Using Patterns)
  // ============================================================================

  describe('Upload Progress', () => {
    it('shows upload progress', () => {
      const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          files={files}
          uploadProgress={{ [files[0].name]: 50 }}
        />
      );

      fileUploadHelpers.verifyUploadProgress(files[0].name, 50);
    });

    it('shows multiple file progress', () => {
      const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          files={files}
          uploadProgress={{ 
            [files[0].name]: 25, 
            [files[1].name]: 75 
          }}
        />
      );

      fileUploadHelpers.verifyUploadProgress(files[0].name, 25);
      fileUploadHelpers.verifyUploadProgress(files[1].name, 75);
    });

    it('shows completion state', () => {
      const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);

      renderWithProviders(
        <FileUpload
          onUpload={mockOnUpload}
          files={files}
          uploadProgress={{ [files[0].name]: 100 }}
        />
      );

      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Complete Test Suite (Using Test Utils)
  // ============================================================================

  describe('Complete File Upload Suite', () => {
    const fileUploadSuite = fileUploadTestUtils.createFileUploadTestSuite(FileUpload, { onUpload: mockOnUpload });

    it('file upload flow', async () => {
      await fileUploadSuite.testFileUpload();
    });

    it('file validation', async () => {
      await fileUploadSuite.testFileValidation();
    });

    it('drag and drop', async () => {
      await fileUploadSuite.testDragAndDrop();
    });

    it('file removal', async () => {
      await fileUploadSuite.testFileRemoval();
    });

    it('upload progress', async () => {
      await fileUploadSuite.testUploadProgress();
    });

    it('error handling', async () => {
      await fileUploadSuite.testErrorHandling();
    });

    it('accessibility', async () => {
      await fileUploadSuite.testAccessibility();
    });

    it('performance', async () => {
      await fileUploadSuite.testPerformance();
    });
  });
});
