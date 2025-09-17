# Enhanced Quiz Wizard Implementation

A comprehensive upgrade to the quiz creation wizard with improved UX, code reusability, and AI-powered features.

## 🚀 Overview

The Enhanced Quiz Wizard is a complete redesign of the quiz creation flow that aligns with existing wizard patterns while introducing powerful new features:

- **Multi-source selection** - Combine flashcards, files, and study materials
- **AI-powered metadata generation** - Smart titles and descriptions
- **Quick setup presets** - Pre-configured quiz types for common scenarios
- **Shared component architecture** - Reusable across different wizards
- **Improved validation** - Real-time feedback and error prevention

## 📁 Project Structure

```
QuizWizard/
├── index.ts                     # Main exports (enhanced only)
├── EnhancedQuizWizard.tsx      # Enhanced implementation
├── steps/
│   ├── BasicConfigStep.tsx     # Original basic config
│   ├── EnhancedBasicConfigStep.tsx  # Enhanced with presets
│   ├── MethodSelectionStep.tsx # Method selection
│   ├── SourceConfigStep.tsx    # Original source config
│   ├── AdvancedConfigStep.tsx  # Advanced options
│   ├── GenerateQuizStep.tsx    # Quiz generation
│   ├── ReviewCreateStep.tsx    # Final review
│   └── index.ts                # Step exports
├── examples/
│   └── EnhancedWizardDemo.tsx  # Demo and usage examples
└── README.md                   # This file
```

## 🛠 Shared Components

### `/components/wizard/shared/`

Reusable components that benefit multiple wizards:

#### `SourceSelectionStep`
- Multi-source type support (flashcards, files, study materials)
- Search and filtering
- File upload handling
- Ground-only options

#### `AIMetadataStep`
- AI-powered title generation
- CEFR-B2 compliant descriptions
- Real-time validation
- Confidence scoring

#### `useMultiSourceManagement`
- Enhanced file management hook
- Support for multiple source types
- Auto-loading and caching
- Selection state management

#### `titleGeneration.ts`
- Smart title generation utilities
- Domain detection and keyword extraction
- Template-based generation
- Uniqueness validation

## 🎯 Quiz Presets

Pre-configured quiz types for common scenarios:

### Quick Assessments
- **Quick Knowledge Check** - 5 questions, 5 minutes
- **Basic Diagnostic** - 8 questions, 10 minutes  
- **Practice Session** - 15 questions, 20 minutes

### Academic Testing
- **Chapter Review Quiz** - 12 questions, 15 minutes
- **Midterm Preparation** - 25 questions, 40 minutes
- **Final Exam Format** - 50 questions, 90 minutes

### Professional Development
- **Skills Assessment** - 20 questions, 30 minutes
- **Certification Prep** - 30 questions, 60 minutes

## 📋 Step Flow Comparison

### Enhanced Wizard (4-6 steps)
1. **Choose Sources** - Multi-source selection with smart filtering
2. **Configure Quiz** - Presets + AI suggestions + basic config
3. **Review Details** - AI-generated metadata with manual override
4. **Advanced Options** *(conditional)* - Skip for simple presets
5. **Generate Quiz** - Enhanced progress tracking
6. **Review & Create** - Final validation and publish

## 💡 Key Improvements

### 1. Better Source Integration
```typescript
// Support for multiple source types
const selectedSources = {
  flashcards: { ids: ['deck-1', 'deck-2'], groundOnly: false },
  files: { ids: ['file-1'], groundOnly: true },
  studyMaterials: { ids: ['material-1'], groundOnly: false }
};
```

### 2. AI-Powered Metadata
```typescript
// Smart title generation from sources
const suggestions = generateMetadata({
  contentType: 'quiz',
  sources: selectedSources,
  quizType: 'diagnostic',
  difficulty: 'INTERMEDIATE'
});
// → "Machine Learning Fundamentals — Diagnostic Quiz"
```

### 3. Quick Setup Presets
```typescript
// One-click quiz configuration
const preset = getPresetById('quick-check');
// Applies: formative, 5 questions, 5 minutes, hints enabled
```

### 4. Conditional Navigation
```typescript
// Skip advanced step for simple presets
const skipAdvanced = simplePresets.includes(selectedPreset.id);
```

## 🔧 Usage Examples

### Basic Implementation
```typescript
import { EnhancedQuizWizard } from '@/features/quiz/components/QuizWizard';

function QuizCenter({ projectId }: { projectId: string }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsWizardOpen(true)}>
        Create AI Quiz
      </Button>
      
      <EnhancedQuizWizard
        projectId={projectId}
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onCreated={(quizId) => console.log('Created:', quizId)}
      />
    </>
  );
}
```

### Using Shared Components
```typescript
import { 
  SourceSelectionStep, 
  useMultiSourceManagement 
} from '@/components/wizard/shared';

function CustomWizard({ projectId }: { projectId: string }) {
  const sourceManagement = useMultiSourceManagement({
    projectId,
    supportedTypes: ['flashcards', 'files'],
  });

  return (
    <SourceSelectionStep
      sources={{
        flashcards: { 
          enabled: true, 
          count: sourceManagement.flashcards.length,
          items: sourceManagement.flashcards 
        },
        files: { 
          enabled: true, 
          count: sourceManagement.files.length,
          items: sourceManagement.files 
        }
      }}
      selectedSources={sourceManagement.selectedSources}
      onSourcesChange={sourceManagement.setSelectedSources}
    />
  );
}
```

### Custom Presets
```typescript
import { QUIZ_PRESETS, type QuizPreset } from '@/features/quiz/constants/presets';

// Create custom preset
const customPreset: QuizPreset = {
  id: 'my-custom',
  name: 'Custom Quiz Type',
  description: 'Tailored for specific needs',
  icon: '⚙️',
  category: 'custom',
  config: {
    quiz_type: 'formative',
    difficulty: 'INTERMEDIATE',
    max_questions: 20,
    // ... other config
  }
};
```

## 🔄 Migration Guide

### From Original to Enhanced

1. **Update Import**
```typescript
// Enhanced
import { EnhancedQuizWizard } from '@/features/quiz/components/QuizWizard';
```

2. **Props Remain Compatible**
```typescript
// Same interface, enhanced functionality
<EnhancedQuizWizard
  projectId={projectId}
  open={open}
  onOpenChange={onOpenChange}
  onCreated={onCreated}
/>
```

3. **Enhanced Features Are Opt-in**
- Presets are shown by default but can be hidden
- AI metadata generation works automatically
- Multi-source selection replaces single file selection

## 🧪 Testing

### Unit Tests
```bash
# Test shared components
npm test components/wizard/shared

# Test enhanced wizard
npm test features/quiz/components/QuizWizard/Enhanced

# Test presets
npm test features/quiz/constants/presets
```

### Integration Tests
```bash
# Test full wizard flow
npm test features/quiz/integration/enhanced-wizard.test.ts
```

## 🎨 Styling & Theming

The enhanced wizard uses consistent design tokens:

- **Colors**: Blue for AI features, Green for success states
- **Icons**: Lucide React icons for consistency
- **Spacing**: Tailwind utilities for responsive design
- **Components**: shadcn/ui for consistent UI elements

## 🔍 Debugging

Enable debug mode with:
```typescript
// In development
process.env.NEXT_PUBLIC_QUIZ_DEBUG = 'true';

// Console output includes:
// 🔍 DEBUG: Source selection changed
// ✅ AI suggestions generated
// 📝 Preset applied: Quick Knowledge Check
```

## 🚀 Future Enhancements

### Planned Features
- [ ] Collaborative quiz creation
- [ ] Template library
- [ ] Advanced AI suggestions (difficulty estimation)
- [ ] Real-time preview
- [ ] Bulk quiz operations

### Extensibility
- **Custom Source Types**: Easy to add new source types
- **Additional Presets**: JSON-configurable preset system
- **Plugin Architecture**: Hook-based extensions
- **Theme Customization**: CSS custom properties

## 📖 API Reference

### EnhancedQuizWizard Props
```typescript
interface EnhancedQuizWizardProps {
  projectId: string;           // Required: Project context
  open: boolean;               // Required: Dialog state
  onOpenChange: (open: boolean) => void;  // Required: State handler
  onCreated?: (quizId: string) => void;   // Optional: Success callback
}
```

### SourceSelectionStep Props
```typescript
interface SourceSelectionStepProps {
  sources: SourceSelectionConfig;         // Available sources
  selectedSources: SelectedSources;       // Current selection
  onSourcesChange: (sources: SelectedSources) => void;  // Change handler
  multiSelect?: boolean;                  // Allow multiple selection
  showGroundOnlyOption?: boolean;         // Show ground-only toggle
  minSources?: number;                    // Minimum required sources
  // ... file upload props
}
```

## 🤝 Contributing

1. **Shared Components**: Add to `/components/wizard/shared/`
2. **Quiz-specific**: Add to `/features/quiz/components/`
3. **Follow Patterns**: Use existing TypeScript interfaces
4. **Test Coverage**: Include unit and integration tests
5. **Documentation**: Update this README for major changes

---

*This enhanced implementation represents a significant step forward in wizard UX and code reusability while maintaining backward compatibility with existing implementations.*
