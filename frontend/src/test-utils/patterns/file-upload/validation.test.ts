/**
 * File Upload Testing Patterns
 * 
 * Reusable patterns for testing file upload functionality, validation,
 * drag & drop, and progress tracking across different components.
 */

import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/shared-setup';
import { testFactories } from '../../factories';
import { standardMocks } from '../../mocks';

// ============================================================================
// File Upload Test Patterns
// ============================================================================

export interface FileUploadTestConfig {
  component: React.ComponentType<any>;
  props?: any;
  mockResponses?: {
    upload?: any;
    progress?: any;
    error?: any;
  };
}

export interface FileTestScenario {
  name: string;
  file: {
    name: string;
    content: string;
    type: string;
    size?: number;
  };
  shouldPass: boolean;
  expectedError?: string;
}

// ============================================================================
// File Validation Testing Pattern
// ============================================================================

export const createFileValidationTest = (config: FileUploadTestConfig) => {
  const validationScenarios: FileTestScenario[] = [
    {
      name: 'Valid PDF file',
      file: { name: 'valid.pdf', content: 'content', type: 'application/pdf' },
      shouldPass: true
    },
    {
      name: 'Valid DOCX file',
      file: { name: 'valid.docx', content: 'content', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      shouldPass: true
    },
    {
      name: 'Valid PPTX file',
      file: { name: 'valid.pptx', content: 'content', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      shouldPass: true
    },
    {
      name: 'Invalid TXT file',
      file: { name: 'invalid.txt', content: 'content', type: 'text/plain' },
      shouldPass: false,
      expectedError: 'is not a supported file type'
    },
    {
      name: 'Invalid JPG file',
      file: { name: 'invalid.jpg', content: 'content', type: 'image/jpeg' },
      shouldPass: false,
      expectedError: 'is not a supported file type'
    },
    {
      name: 'File too large',
      file: { name: 'large.pdf', content: 'x'.repeat(26 * 1024 * 1024), type: 'application/pdf' },
      shouldPass: false,
      expectedError: 'File is too large'
    }
  ];

  return {
    async testFileValidation() {
      const user = userEvent.setup();
      
      for (const scenario of validationScenarios) {
        renderWithProviders(React.createElement(config.component, config.props));

        const fileInput = screen.getByTestId('file-input');
        const testFile = testFactories.createTestFile(
          scenario.file.name, 
          scenario.file.content, 
          scenario.file.type
        );
        
        await act(async () => {
          await user.upload(fileInput, testFile);
        });

        if (scenario.shouldPass) {
          expect(screen.getByTestId(`file-item-${scenario.file.name}`)).toBeInTheDocument();
          expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        } else {
          expect(screen.queryByTestId(`file-item-${scenario.file.name}`)).not.toBeInTheDocument();
          if (scenario.expectedError) {
            expect(screen.getByTestId('error-message')).toHaveTextContent(new RegExp(scenario.expectedError, 'i'));
          }
        }

        // Clean up for next iteration
        jest.clearAllMocks();
      }
    },

    async testMultipleFileValidation() {
      const user = userEvent.setup();
      
      renderWithProviders(React.createElement(config.component, config.props));

      const fileInput = screen.getByTestId('file-input');
      const validFile = testFactories.createTestFile('valid.pdf', 'content', 'application/pdf');
      const invalidFile = testFactories.createTestFile('invalid.txt', 'content', 'text/plain');
      
      await act(async () => {
        await user.upload(fileInput, [validFile, invalidFile]);
      });

      // Only valid file should be accepted
      expect(screen.getByTestId('file-item-valid.pdf')).toBeInTheDocument();
      expect(screen.queryByTestId('file-item-invalid.txt')).not.toBeInTheDocument();
      
      // Error message should be shown
      expect(screen.getByTestId('error-message')).toHaveTextContent(/is not a supported file type/i);
    }
  };
};

// ============================================================================
// Drag & Drop Testing Pattern
// ============================================================================

export const createDragDropTest = (config: FileUploadTestConfig) => {
  return {
    async testDragAndDrop() {
      const mockOnUpload = jest.fn();
      renderWithProviders(React.createElement(config.component, { ...config.props, onUpload: mockOnUpload }));

      const dropzone = screen.getByText("Drag & drop files here").closest("div");
      expect(dropzone).toBeInTheDocument();

      const file = testFactories.createTestFile();
      const dataTransfer = {
        files: [file],
        items: [
          {
            kind: "file",
            type: file.type,
            getAsFile: () => file,
          },
        ],
        types: ["Files"],
      };

      if (dropzone) {
        fireEvent.dragOver(dropzone);
        fireEvent.drop(dropzone, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith([file]);
      });
    },

    async testDragOverState() {
      renderWithProviders(React.createElement(config.component, config.props));

      const dropzone = screen.getByText("Drag & drop files here").closest("div");
      
      if (dropzone) {
        fireEvent.dragOver(dropzone);
        expect(dropzone).toHaveClass('drag-over');
      }
    },

    async testDragLeaveState() {
      renderWithProviders(React.createElement(config.component, config.props));

      const dropzone = screen.getByText("Drag & drop files here").closest("div");
      
      if (dropzone) {
        fireEvent.dragOver(dropzone);
        fireEvent.dragLeave(dropzone);
        expect(dropzone).not.toHaveClass('drag-over');
      }
    },

    async testMultipleFileDragDrop() {
      const mockOnUpload = jest.fn();
      renderWithProviders(React.createElement(config.component, { ...config.props, onUpload: mockOnUpload }));

      const dropzone = screen.getByText("Drag & drop files here").closest("div");
      const files = [
        testFactories.createTestFile("test1.pdf"),
        testFactories.createTestFile("test2.pdf")
      ];
      
      const dataTransfer = {
        files: files,
        items: files.map(file => ({
          kind: "file",
          type: file.type,
          getAsFile: () => file,
        })),
        types: ["Files"],
      };

      if (dropzone) {
        fireEvent.dragOver(dropzone);
        fireEvent.drop(dropzone, { dataTransfer });
      }

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(files);
      });
    }
  };
};

// ============================================================================
// Upload Progress Testing Pattern
// ============================================================================

export const createUploadProgressTest = (config: FileUploadTestConfig) => {
  return {
    testProgressDisplay() {
      const files = [testFactories.createTestFile("test1.pdf")];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files,
          uploadProgress: { "test1.pdf": 50 }
        })
      );

      const progressBar = screen.getByLabelText(/upload progress for test1.pdf/i);
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    },

    testMultipleFileProgress() {
      const files = [
        testFactories.createTestFile("test1.pdf"),
        testFactories.createTestFile("test2.pdf")
      ];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files,
          uploadProgress: { 
            "test1.pdf": 25, 
            "test2.pdf": 75 
          }
        })
      );

      const progress1 = screen.getByLabelText(/upload progress for test1.pdf/i);
      const progress2 = screen.getByLabelText(/upload progress for test2.pdf/i);
      
      expect(progress1).toHaveAttribute("aria-valuenow", "25");
      expect(progress2).toHaveAttribute("aria-valuenow", "75");
    },

    testCompletionState() {
      const files = [testFactories.createTestFile("test1.pdf")];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files,
          uploadProgress: { "test1.pdf": 100 }
        })
      );

      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    }
  };
};

// ============================================================================
// File List Management Testing Pattern
// ============================================================================

export const createFileListTest = (config: FileUploadTestConfig) => {
  return {
    testFileListDisplay() {
      const files = [
        testFactories.createTestFile("test1.pdf"),
        testFactories.createTestFile("test2.pdf")
      ];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files
        })
      );

      expect(screen.getByText("test1.pdf")).toBeInTheDocument();
      expect(screen.getByText("test2.pdf")).toBeInTheDocument();
    },

    async testFileRemoval() {
      const mockOnRemove = jest.fn();
      const files = [
        testFactories.createTestFile("test1.pdf"),
        testFactories.createTestFile("test2.pdf")
      ];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files,
          onRemove: mockOnRemove
        })
      );

      const removeButtons = screen.getAllByLabelText(/remove file/i);
      fireEvent.click(removeButtons[0]);

      expect(mockOnRemove).toHaveBeenCalledWith(0);
    },

    testFileCountDisplay() {
      const files = [
        testFactories.createTestFile("test1.pdf"),
        testFactories.createTestFile("test2.pdf"),
        testFactories.createTestFile("test3.pdf")
      ];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files
        })
      );

      expect(screen.getByText("3 files selected")).toBeInTheDocument();
    },

    testFileSizeDisplay() {
      const files = [
        testFactories.createTestFile("small.pdf", "small content"),
        testFactories.createTestFile("large.pdf", "x".repeat(1000))
      ];

      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          files: files
        })
      );

      expect(screen.getByText(/small\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/large\.pdf/)).toBeInTheDocument();
    }
  };
};

// ============================================================================
// Error Handling Testing Pattern
// ============================================================================

export const createFileUploadErrorTest = (config: FileUploadTestConfig) => {
  return {
    async testUploadErrors() {
      const mockOnUploadError = jest.fn();
      renderWithProviders(
        React.createElement(config.component, {
          ...config.props,
          onUploadError: mockOnUploadError
        })
      );

      const file = testFactories.createTestFile("test.pdf");
      const input = screen.getByTestId("file-input");

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      // Simulate upload error
      const mockUpload = jest.fn().mockRejectedValueOnce(new Error("Upload failed"));
      mockUpload.mockRejectedValueOnce(new Error("Upload failed"));

      await waitFor(() => {
        expect(mockOnUploadError).toHaveBeenCalled();
      });
    },

    async testNetworkTimeout() {
      const user = userEvent.setup();
      
      // Mock network timeout
      const mockUpload = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      renderWithProviders(React.createElement(config.component, config.props));

      const fileInput = screen.getByTestId('file-input');
      const testFile = testFactories.createTestFile('test.pdf', 'content', 'application/pdf');
      
      await act(async () => {
        await user.upload(fileInput, testFile);
      });

      await waitFor(() => {
        expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    },

    async testRetryFunctionality() {
      const user = userEvent.setup();
      
      // First attempt fails
      const mockUpload = jest.fn().mockRejectedValueOnce(new Error('Upload failed'));
      
      renderWithProviders(React.createElement(config.component, config.props));

      const fileInput = screen.getByTestId('file-input');
      const testFile = testFactories.createTestFile('test.pdf', 'content', 'application/pdf');
      
      await act(async () => {
        await user.upload(fileInput, testFile);
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Retry upload
      mockUpload.mockResolvedValueOnce({ id: 'doc-123', status: 'completed' });

      const retryButton = screen.getByText(/retry/i);
      await act(async () => {
        await user.click(retryButton);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    }
  };
};
