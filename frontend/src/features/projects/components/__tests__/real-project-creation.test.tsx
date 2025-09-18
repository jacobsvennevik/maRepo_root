import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../test-utils/setup/shared-setup';
import { ProjectSummaryColorful } from '../project-summary-variants';
import { createProject } from '../../services/api';
import { isTestMode } from '../../services/mock-data';

// Mock the API functions
jest.mock('../../services/api', () => ({
  createProject: jest.fn(),
  uploadFile: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }))
}));

// Mock the mock-data module
jest.mock('../../services/mock-data', () => ({
  isTestMode: jest.fn(),
}));

const mockCreateProject = createProject as jest.MockedFunction<typeof createProject>;
const mockIsTestMode = isTestMode as jest.MockedFunction<typeof isTestMode>;

describe('Real Project Creation in Test Mode', () => {
  const mockSetup = {
    projectName: 'Test Project',
    studyFrequency: 'daily',
    importantDates: [
      { description: 'Midterm Exam', date: '2024-03-15' },
      { description: 'Final Exam', date: '2024-05-20' }
    ],
    courseFiles: [],
    testFiles: [],
    uploadedFiles: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up test mode environment
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    
    // Mock test mode detection
    mockIsTestMode.mockReturnValue(true);
    
    // Mock successful project creation
    mockCreateProject.mockResolvedValue({
      id: '123', // Real project ID, not mock123
      name: 'Test Project',
      project_type: 'school',
      course_name: 'Test Course',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  });

  it('should create real project with real ID in test mode', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };

    // Mock useRouter to return our mock
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);

    renderWithProviders(
      <ProjectSummaryColorful setup={mockSetup} onBack={jest.fn()} />
    );

    // Find and click the create project button
    const createButton = screen.getByRole('button', { name: /start learning journey/i });
    expect(createButton).toBeInTheDocument();

    fireEvent.click(createButton);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });

    // Verify that createProject was called with correct data
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        project_type: 'school',
        mock_mode: true, // Should be true in test mode
        seed_syllabus: true,
        seed_tests: true,
        seed_content: true,
        seed_flashcards: false,
      })
    );

    // Verify that navigation uses real project ID
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/projects/123/overview');
    });

    // Verify that the project ID is real (not mock123)
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringMatching(/^\/projects\/\d+\/overview$/)
    );
    expect(mockRouter.push).not.toHaveBeenCalledWith('/projects/mock123/overview');
  });

  it('should not create mock projects with hardcoded IDs', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };

    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);

    renderWithProviders(
      <ProjectSummaryColorful setup={mockSetup} onBack={jest.fn()} />
    );

    const createButton = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });

    // Verify that we're making a real API call, not using mock data
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        project_type: 'school',
      })
    );

    // Verify that navigation uses the real project ID from the API response
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/projects/123/overview');
    });

    // Ensure we never navigate to mock123
    expect(mockRouter.push).not.toHaveBeenCalledWith('/projects/mock123/overview');
  });

  it('should handle test mode correctly - real project creation with AI mocking', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };

    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);

    renderWithProviders(
      <ProjectSummaryColorful setup={mockSetup} onBack={jest.fn()} />
    );

    const createButton = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });

    // Verify that mock_mode is set to true for AI mocking
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        mock_mode: true, // This tells the backend to mock AI calls only
        seed_syllabus: true,
        seed_tests: true,
        seed_content: true,
        seed_flashcards: false,
      })
    );

    // Verify that the project creation is real (not mocked)
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        project_type: 'school',
        study_frequency: 'daily',
        important_dates: expect.arrayContaining([
          expect.objectContaining({
            title: 'Midterm Exam',
            date: '2024-03-15'
          }),
          expect.objectContaining({
            title: 'Final Exam',
            date: '2024-05-20'
          })
        ])
      })
    );
  });

  it('should work in both test mode and production mode', async () => {
    const mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };

    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue(mockRouter);

    // Test production mode
    mockIsTestMode.mockReturnValue(false);
    
    renderWithProviders(
      <ProjectSummaryColorful setup={mockSetup} onBack={jest.fn()} />
    );

    const createButton = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(1);
    });

    // In production mode, mock_mode should be false
    expect(mockCreateProject).toHaveBeenCalledWith(
      expect.objectContaining({
        mock_mode: false, // No AI mocking in production
      })
    );

    // Test test mode
    mockIsTestMode.mockReturnValue(true);
    
    // Re-render for test mode
    renderWithProviders(
      <ProjectSummaryColorful setup={mockSetup} onBack={jest.fn()} />
    );

    const createButtons = screen.getAllByRole('button', { name: /start learning journey/i });
    const createButtonTestMode = createButtons[1]; // Get the second one (test mode)
    fireEvent.click(createButtonTestMode);

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledTimes(2);
    });

    // In test mode, mock_mode should be true
    expect(mockCreateProject).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mock_mode: true, // AI mocking enabled in test mode
      })
    );
  });
});
