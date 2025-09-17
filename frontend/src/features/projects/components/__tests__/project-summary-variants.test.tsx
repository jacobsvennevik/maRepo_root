// Mock API first
const mockCreateProject = jest.fn((data) => Promise.resolve({ id: 'mock123', ...data }));
const mockUploadFile = jest.fn(() => Promise.resolve('mock-url'));

jest.mock('../services/api', () => ({
  uploadFile: mockUploadFile,
  createProject: mockCreateProject
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}));

// Mock validation function
jest.mock('../../types', () => ({
  ...jest.requireActual('../../types'),
  validateProjectCreateInput: jest.fn((input) => input)
}));

// Mock isTestMode to return true for tests
jest.mock('../../services/mock-data', () => ({
  ...jest.requireActual('../../services/mock-data'),
  isTestMode: jest.fn(() => true)
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectSummaryColorful, ProjectSummaryGlass, ProjectSummaryGameified } from '../project-summary-variants';

const baseSetup = {
  projectName: 'Test Project',
  purpose: 'good-grades',
  testLevel: 'beginner',
  courseFiles: [],
  evaluationTypes: [],
  testFiles: [],
  importantDates: [],
  uploadedFiles: [],
  timeframe: 'semester',
  goal: 'Learn a lot!',
  studyFrequency: 'weekly',
  collaboration: 'solo',
  customDescription: '',
  courseType: '',
  learningStyle: '',
  assessmentType: '',
  studyPreference: '',
  learningDifficulties: ''
};

describe('ProjectSummary Variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Colorful: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryColorful setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });

  it('Glass: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryGlass setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /launch project/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });

  it('Gamified: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryGameified setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /begin adventure/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });

  it('Shows loading state while submitting', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryColorful setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByText(/creating magic/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });
});

/**
 * Tests for ProjectSummary variants:
 * - Colorful, Glass, Gamified
 * - Mocks API and router
 * - Asserts navigation and loading state
 */ 