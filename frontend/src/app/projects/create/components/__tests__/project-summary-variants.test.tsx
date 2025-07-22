import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectSummaryColorful, ProjectSummaryGlass, ProjectSummaryGameified } from '../project-summary-variants';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// Mock API
jest.mock('../services/api', () => ({
  uploadFile: jest.fn(() => Promise.resolve('mock-url')),
  createProject: jest.fn((data) => Promise.resolve({ id: 'mock123', ...data }))
}));

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Colorful: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryColorful setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /start learning journey/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(require('../services/api').createProject).toHaveBeenCalled();
      expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });

  it('Glass: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryGlass setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /launch project/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(require('../services/api').createProject).toHaveBeenCalled();
      expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/projects/mock123/overview');
    });
  });

  it('Gamified: creates project and navigates to overview', async () => {
    const onBack = jest.fn();
    render(<ProjectSummaryGameified setup={baseSetup} onBack={onBack} />);
    const button = screen.getByRole('button', { name: /begin adventure/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(require('../services/api').createProject).toHaveBeenCalled();
      expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/projects/mock123/overview');
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
      expect(require('../services/api').createProject).toHaveBeenCalled();
    });
  });
});

/**
 * Tests for ProjectSummary variants:
 * - Colorful, Glass, Gamified
 * - Mocks API and router
 * - Asserts navigation and loading state
 */ 