/**
 * Shared Wizard Components Index
 * 
 * Exports for all shared wizard components that can be reused
 * across different wizard implementations (quiz, flashcard, diagnostic, etc.)
 */

// Core shared components
export { SourceSelectionStep } from './SourceSelectionStep';
export { AIMetadataStep } from './AIMetadataStep';

// Shared hooks
export { useMultiSourceManagement } from './useMultiSourceManagement';

// Utility functions
export { 
  generateMetadata,
  generateQuickTitle,
  validateTitle,
} from './titleGeneration';

// Types
export type { 
  SourceItem,
  TitleGenerationOptions,
  GeneratedMetadata,
} from './titleGeneration';

export type {
  SourceConfig,
  SourceSelectionConfig,
  SelectedSources,
} from './SourceSelectionStep';

export type {
  AIMetadataSuggestions,
  MetadataFormData,
} from './AIMetadataStep';

