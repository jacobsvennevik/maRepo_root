/**
 * Quiz Wizard Components Index
 * 
 * Exports the enhanced quiz wizard implementation and related components.
 */

// Enhanced implementation with shared components and improved UX
export { EnhancedQuizWizard } from './EnhancedQuizWizard';

// Individual step components (for custom implementations)
export * from './steps';

// Re-export shared components for convenience
export {
  SourceSelectionStep,
  AIMetadataStep,
  useMultiSourceManagement,
  generateMetadata,
  generateQuickTitle,
  validateTitle,
} from '@/components/wizard/shared';

// Export presets and configuration
export {
  QUIZ_PRESETS,
  PRESET_CATEGORIES,
  getRecommendedPresets,
  getPresetsByCategory,
  getPresetById,
  type QuizPreset,
} from '../../constants/presets';
