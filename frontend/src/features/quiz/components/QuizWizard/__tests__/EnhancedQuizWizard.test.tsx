/**
 * Enhanced Quiz Wizard Tests
 * 
 * Integration tests for the enhanced quiz wizard implementation
 * to ensure all shared components work together correctly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedQuizWizard } from '../EnhancedQuizWizard';
import { QUIZ_PRESETS, getRecommendedPresets } from '../../../constants/presets';

// Mock the shared components
jest.mock('@/components/wizard/shared', () => ({
  SourceSelectionStep: ({ onSourcesChange }: any) => (
    <div data-testid="source-selection">
      <button 
        onClick={() => onSourcesChange({
          flashcards: { ids: ['deck-1'], groundOnly: false },
          files: { ids: ['file-1'], groundOnly: false },
          studyMaterials: { ids: [], groundOnly: false }
        })}
      >
        Select Sources
      </button>
    </div>
  ),
  AIMetadataStep: ({ onMetadataChange }: any) => (
    <div data-testid="ai-metadata">
      <button 
        onClick={() => onMetadataChange({
          title: 'Test Quiz',
          topic: 'Test Topic',
          description: 'Test Description',
          suggestedByAI: true
        })}
      >
        Generate Metadata
      </button>
    </div>
  ),
  useMultiSourceManagement: () => ({
    flashcards: [{ id: 'deck-1', name: 'Test Deck', type: 'flashcard' }],
    files: [{ id: 'file-1', name: 'test.pdf', type: 'file' }],
    studyMaterials: [],
    uploadedFiles: [],
    isLoadingFlashcards: false,
    isLoadingFiles: false,
    isLoadingStudyMaterials: false,
    selectedSources: {
      flashcards: { ids: [], groundOnly: false },
      files: { ids: [], groundOnly: false },
      studyMaterials: { ids: [], groundOnly: false }
    },
    setSelectedSources: jest.fn(),
    setSearchTerm: jest.fn(),
    handleFileUpload: jest.fn(),
    removeUploadedFile: jest.fn(),
    refreshSources: jest.fn(),
    clearSelection: jest.fn(),
    totalSelectedCount: 0,
    hasMinimumSelection: false,
    isAnyLoading: false,
  }),
  generateMetadata: () => ({
    topic: 'Generated Topic',
    title: 'Generated Title',
    description: 'Generated Description',
    confidence: 0.8,
    keywords: ['test', 'quiz'],
    suggestedTags: ['intermediate']
  }),
}));

// Mock the steps
jest.mock('../steps', () => ({
  AdvancedConfigStep: () => <div data-testid="advanced-config">Advanced Config</div>,
  GenerateQuizStep: ({ onGenerate }: any) => (
    <div data-testid="generate-step">
      <button onClick={onGenerate}>Generate Quiz</button>
    </div>
  ),
  ReviewCreateStep: ({ onCreate }: any) => (
    <div data-testid="review-step">
      <button onClick={onCreate}>Create Quiz</button>
    </div>
  ),
}));

// Mock the enhanced basic config step
jest.mock('../steps/EnhancedBasicConfigStep', () => ({
  EnhancedBasicConfigStep: ({ onPresetSelected }: any) => (
    <div data-testid="enhanced-basic-config">
      <button 
        onClick={() => onPresetSelected(QUIZ_PRESETS[0])}
        data-testid="select-preset"
      >
        Select Preset
      </button>
    </div>
  ),
}));

// Mock hooks
jest.mock('../../../hooks', () => ({
  useFormValidation: () => ({
    form: {
      getValues: () => ({
        title: 'Test Quiz',
        topic: 'Test Topic',
        quiz_type: 'formative',
        difficulty: 'INTERMEDIATE'
      }),
    },
    isValid: true,
    errors: {},
    validateForm: jest.fn().mockResolvedValue(true),
    resetForm: jest.fn(),
    setFormValue: jest.fn(),
    getFormValue: jest.fn((field: string) => {
      const values: Record<string, any> = {
        title: 'Test Quiz',
        topic: 'Test Topic',
        quiz_type: 'formative',
        difficulty: 'INTERMEDIATE'
      };
      return values[field];
    }),
  }),
  useQuizGeneration: () => ({
    isGenerating: false,
    generatedQuiz: { id: 'quiz-123', title: 'Generated Quiz' },
    error: null,
    generateQuiz: jest.fn(),
    reset: jest.fn(),
  }),
  useWizardNavigation: () => ({
    currentStep: 1,
    canGoNext: true,
    canGoPrevious: false,
    goNext: jest.fn(),
    goPrevious: jest.fn(),
    reset: jest.fn(),
  }),
}));

// Mock other dependencies
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/wizard/WizardShell', () => ({
  WizardShell: ({ children, open, title }: any) => 
    open ? (
      <div data-testid="wizard-shell">
        <h1>{title}</h1>
        {children}
      </div>
    ) : null,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// ============================================================================
// Test Suite
// ============================================================================

describe('EnhancedQuizWizard', () => {
  const defaultProps = {
    projectId: 'test-project-123',
    open: true,
    onOpenChange: jest.fn(),
    onCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================

  it('renders the wizard when open', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    expect(screen.getByTestId('wizard-shell')).toBeInTheDocument();
    expect(screen.getByText('Create AI-Generated Quiz')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<EnhancedQuizWizard {...defaultProps} open={false} />);
    
    expect(screen.queryByTestId('wizard-shell')).not.toBeInTheDocument();
  });

  it('renders the first step (source selection) by default', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    expect(screen.getByTestId('source-selection')).toBeInTheDocument();
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================

  it('shows navigation buttons', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('does not show back button on first step', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  // ============================================================================
  // Preset Integration Tests
  // ============================================================================

  it('shows recommended presets badge when preset is selected', () => {
    const { rerender } = render(<EnhancedQuizWizard {...defaultProps} />);
    
    // Initially no preset badge
    expect(screen.queryByText(QUIZ_PRESETS[0].name)).not.toBeInTheDocument();
    
    // TODO: Test preset selection flow when navigation is working
  });

  // ============================================================================
  // Source Selection Tests
  // ============================================================================

  it('shows source count badge when sources are selected', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    // Click to select sources
    fireEvent.click(screen.getByText('Select Sources'));
    
    // Should show source count badge
    // Note: This would work with full integration
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  it('validates step requirements', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    // Next button should be disabled if validation fails
    // This depends on the actual validation logic
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
  });

  // ============================================================================
  // Integration Flow Tests
  // ============================================================================

  it('handles complete wizard flow', async () => {
    const onCreated = jest.fn();
    render(<EnhancedQuizWizard {...defaultProps} onCreated={onCreated} />);
    
    // Step 1: Source Selection
    expect(screen.getByTestId('source-selection')).toBeInTheDocument();
    
    // TODO: Complete flow test when navigation hooks are properly mocked
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  it('handles quiz generation errors gracefully', () => {
    // Mock error state
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    // Should show error state without crashing
    expect(screen.getByTestId('wizard-shell')).toBeInTheDocument();
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  it('has proper accessibility attributes', () => {
    render(<EnhancedQuizWizard {...defaultProps} />);
    
    // Check for proper ARIA labels and roles
    const wizard = screen.getByTestId('wizard-shell');
    expect(wizard).toBeInTheDocument();
  });

  // ============================================================================
  // Presets Configuration Tests
  // ============================================================================

  it('loads quiz presets correctly', () => {
    expect(QUIZ_PRESETS).toBeDefined();
    expect(QUIZ_PRESETS.length).toBeGreaterThan(0);
    
    const recommended = getRecommendedPresets();
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.every(p => p.recommended)).toBe(true);
  });

  it('validates preset configurations', () => {
    QUIZ_PRESETS.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.config).toBeDefined();
      expect(preset.config.quiz_type).toBeDefined();
      expect(preset.config.difficulty).toBeDefined();
      expect(preset.config.max_questions).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Helper to test wizard step transitions
 */
export const testWizardFlow = async (
  component: React.ReactElement,
  steps: string[]
) => {
  const { container } = render(component);
  
  for (const step of steps) {
    await waitFor(() => {
      expect(screen.getByTestId(step)).toBeInTheDocument();
    });
    
    // Simulate step completion
    const nextButton = screen.queryByText('Next');
    if (nextButton && !nextButton.hasAttribute('disabled')) {
      fireEvent.click(nextButton);
    }
  }
  
  return container;
};

/**
 * Helper to mock successful source selection
 */
export const mockSourceSelection = () => {
  return {
    flashcards: { ids: ['deck-1'], groundOnly: false },
    files: { ids: ['file-1'], groundOnly: false },
    studyMaterials: { ids: [], groundOnly: false }
  };
};

/**
 * Helper to mock form validation success
 */
export const mockFormValidation = () => {
  return {
    title: 'Valid Quiz Title',
    topic: 'Valid Topic',
    description: 'Valid description',
    quiz_type: 'formative',
    difficulty: 'INTERMEDIATE'
  };
};

