/**
 * File Upload Test Helpers
 * 
 * Reusable helper functions for file upload testing scenarios.
 */

import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../setup/shared-setup';
import { testFactories } from '../factories';

// ============================================================================
// File Upload Helpers
// ============================================================================

export const fileUploadHelpers = {
  /**
   * Create test files with different configurations
   */
  createTestFiles: (configs: Array<{
    name: string;
    content?: string;
    type?: string;
    size?: number;
  }>) => {
    return configs.map(config => 
      testFactories.createTestFile(
        config.name,
        config.content || 'test content',
        config.type || 'application/pdf',
        config.size
      )
    );
  },

  /**
   * Upload files via file input
   */
  uploadFiles: async (files: File[]) => {
    const user = userEvent.setup();
    const fileInput = screen.getByTestId('file-input');
    
    await act(async () => {
      await user.upload(fileInput, files);
    });

    return user;
  },

  /**
   * Upload files via drag and drop
   */
  uploadFilesViaDragDrop: async (files: File[]) => {
    const dropzone = screen.getByText("Drag & drop files here").closest("div");
    
    if (!dropzone) {
      throw new Error('Dropzone not found');
    }

    const dataTransfer = {
      files: files,
      items: files.map(file => ({
        kind: "file",
        type: file.type,
        getAsFile: () => file,
      })),
      types: ["Files"],
    };

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer });
  },

  /**
   * Remove file from list
   */
  removeFile: async (fileName: string) => {
    const user = userEvent.setup();
    const removeButton = screen.getByTestId(`remove-${fileName}`);
    
    await act(async () => {
      await user.click(removeButton);
    });
  },

  /**
   * Verify file is in list
   */
  verifyFileInList: (fileName: string) => {
    expect(screen.getByTestId(`file-item-${fileName}`)).toBeInTheDocument();
  },

  /**
   * Verify file is not in list
   */
  verifyFileNotInList: (fileName: string) => {
    expect(screen.queryByTestId(`file-item-${fileName}`)).not.toBeInTheDocument();
  },

  /**
   * Verify error message is displayed
   */
  verifyErrorMessage: (expectedMessage: string) => {
    expect(screen.getByTestId('error-message')).toHaveTextContent(new RegExp(expectedMessage, 'i'));
  },

  /**
   * Verify no error message is displayed
   */
  verifyNoErrorMessage: () => {
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  },

  /**
   * Verify upload progress
   */
  verifyUploadProgress: (fileName: string, expectedProgress: number) => {
    const progressBar = screen.getByLabelText(new RegExp(`upload progress for ${fileName}`, 'i'));
    expect(progressBar).toHaveAttribute('aria-valuenow', expectedProgress.toString());
  },

  /**
   * Verify file count
   */
  verifyFileCount: (expectedCount: number) => {
    expect(screen.getByTestId('upload-stats')).toHaveTextContent(`Total files: ${expectedCount}`);
  }
};

// ============================================================================
// File Validation Helpers
// ============================================================================

export const fileValidationHelpers = {
  /**
   * Test file validation scenarios
   */
  testValidationScenarios: async (scenarios: Array<{
    name: string;
    file: { name: string; content: string; type: string };
    shouldPass: boolean;
    expectedError?: string;
  }>) => {
    for (const scenario of scenarios) {
      const testFile = testFactories.createTestFile(
        scenario.file.name,
        scenario.file.content,
        scenario.file.type
      );

      await fileUploadHelpers.uploadFiles([testFile]);

      if (scenario.shouldPass) {
        fileUploadHelpers.verifyFileInList(scenario.file.name);
        fileUploadHelpers.verifyNoErrorMessage();
      } else {
        fileUploadHelpers.verifyFileNotInList(scenario.file.name);
        if (scenario.expectedError) {
          fileUploadHelpers.verifyErrorMessage(scenario.expectedError);
        }
      }

      // Clean up for next iteration
      jest.clearAllMocks();
    }
  },

  /**
   * Test mixed valid and invalid files
   */
  testMixedFileValidation: async () => {
    const validFile = testFactories.createTestFile('valid.pdf', 'content', 'application/pdf');
    const invalidFile = testFactories.createTestFile('invalid.txt', 'content', 'text/plain');

    await fileUploadHelpers.uploadFiles([validFile, invalidFile]);

    // Only valid file should be accepted
    fileUploadHelpers.verifyFileInList('valid.pdf');
    fileUploadHelpers.verifyFileNotInList('invalid.txt');
    
    // Error message should be shown
    fileUploadHelpers.verifyErrorMessage('is not a supported file type');
  }
};

// ============================================================================
// File Upload Test Scenarios
// ============================================================================

export const fileUploadScenarios = {
  validFiles: [
    { name: 'test1.pdf', content: 'PDF content', type: 'application/pdf' },
    { name: 'test2.docx', content: 'DOCX content', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: 'test3.pptx', content: 'PPTX content', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
  ],

  invalidFiles: [
    { name: 'test.txt', content: 'TXT content', type: 'text/plain' },
    { name: 'test.jpg', content: 'JPG content', type: 'image/jpeg' },
    { name: 'large.pdf', content: 'x'.repeat(26 * 1024 * 1024), type: 'application/pdf' }
  ],

  validationScenarios: [
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
      name: 'Invalid TXT file',
      file: { name: 'invalid.txt', content: 'content', type: 'text/plain' },
      shouldPass: false,
      expectedError: 'is not a supported file type'
    },
    {
      name: 'File too large',
      file: { name: 'large.pdf', content: 'x'.repeat(26 * 1024 * 1024), type: 'application/pdf' },
      shouldPass: false,
      expectedError: 'File is too large'
    }
  ]
};

// ============================================================================
// File Upload Test Utilities
// ============================================================================

export const fileUploadTestUtils = {
  /**
   * Create a complete file upload test suite
   */
  createFileUploadTestSuite: (component: React.ComponentType<any>, props: any = {}) => {
    return {
      async testFileUpload() {
        const files = fileUploadHelpers.createTestFiles(fileUploadScenarios.validFiles);
        await fileUploadHelpers.uploadFiles(files);
        
        files.forEach(file => {
          fileUploadHelpers.verifyFileInList(file.name);
        });
      },

      async testFileValidation() {
        await fileValidationHelpers.testValidationScenarios(fileUploadScenarios.validationScenarios);
      },

      async testDragAndDrop() {
        const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);
        await fileUploadHelpers.uploadFilesViaDragDrop(files);
        
        fileUploadHelpers.verifyFileInList(files[0].name);
      },

      async testFileRemoval() {
        const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);
        await fileUploadHelpers.uploadFiles(files);
        
        fileUploadHelpers.verifyFileInList(files[0].name);
        await fileUploadHelpers.removeFile(files[0].name);
        fileUploadHelpers.verifyFileNotInList(files[0].name);
      },

      async testUploadProgress() {
        const files = fileUploadHelpers.createTestFiles([fileUploadScenarios.validFiles[0]]);
        
        renderWithProviders(
          React.createElement(component, {
            ...props,
            files: files,
            uploadProgress: { [files[0].name]: 50 }
          })
        );

        fileUploadHelpers.verifyUploadProgress(files[0].name, 50);
      },

      async testErrorHandling() {
        const invalidFile = fileUploadScenarios.invalidFiles[0];
        const testFile = testFactories.createTestFile(invalidFile.name, invalidFile.content, invalidFile.type);
        
        await fileUploadHelpers.uploadFiles([testFile]);
        fileUploadHelpers.verifyErrorMessage('is not a supported file type');
      },

      async testAccessibility() {
        renderWithProviders(React.createElement(component, props));
        
        const fileInput = screen.getByTestId('file-input');
        expect(fileInput).toHaveAttribute('type', 'file');
        expect(fileInput).toHaveAttribute('multiple');
      },

      async testPerformance() {
        const startTime = performance.now();
        renderWithProviders(React.createElement(component, props));
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(100);
      }
    };
  }
};
