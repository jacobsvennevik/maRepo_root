# Style Picker Implementation Guide

## Overview

The Style Picker is a production-ready component that allows users to select and customize test styles for diagnostic sessions. It implements a comprehensive system with validation, deterministic previews, analytics tracking, and autofix capabilities.

## Architecture

### Core Components

1. **StylePicker** - Main React component for style selection
2. **StyleValidator** - Validation system with autofixes
3. **PreviewGenerator** - Deterministic preview generation
4. **StyleAnalytics** - Event tracking wrapper
5. **PresetRegistry** - Data-driven preset management

### File Structure

```
frontend/src/features/diagnostics/
├── components/
│   ├── StylePicker.tsx              # Main component
│   └── CreateDiagnosticWizard.tsx  # Wizard integration
├── utils/
│   ├── styleValidator.ts           # Validation & autofixes
│   ├── previewGenerator.ts         # Deterministic previews
│   ├── styleAnalytics.ts          # Analytics wrapper
│   ├── presetRegistry.ts          # Preset management
│   └── __tests__/                 # Unit tests
└── cypress/e2e/
    └── style-picker.cy.ts         # E2E tests
```

## Features

### 1. Preset Selection

The component provides three MVP presets:

- **MCQ Quiz**: Multiple choice with immediate feedback
- **Mixed Checkpoint**: Combination of question types with deferred feedback  
- **STEM Problem Set**: Numeric and multi-step problems with tiered hints

### 2. Advanced Configuration

Users can customize:
- **Timing**: Total time, per-item time, timing mode (soft/hard/none)
- **Feedback**: Immediate, on-submit, end-only, tiered hints
- **Difficulty**: Easier, balanced, harder
- **Hints**: Enable/disable hints
- **Item Mix**: Proportions of different question types

### 3. Validation System

Implements three core validation rules:

1. **Mix Normalization**: Item mix proportions must sum to 1.0
2. **Hard Timing**: Hard timing requires ≥5 seconds per item
3. **End-Only Feedback**: Disables hints automatically

### 4. Deterministic Preview

- Generates consistent mock items based on configuration
- Uses seeded random number generation
- Shows sample questions respecting item mix proportions
- Displays configuration badges

### 5. Analytics Tracking

Tracks key user interactions:
- `style_selected`: When a preset is chosen
- `style_customized`: When settings are modified
- `preview_opened`: When preview is shown
- `validation_triggered`: When validation issues appear
- `autofix_applied`: When fixes are applied

## Usage

### Basic Integration

```tsx
import { StylePicker } from '@/features/diagnostics/components/StylePicker';

function MyComponent() {
  const [styleConfig, setStyleConfig] = useState({
    test_style: null,
    style_config_override: {}
  });

  return (
    <StylePicker
      value={styleConfig}
      onChange={setStyleConfig}
      onNext={() => {}}
      onBack={() => {}}
    />
  );
}
```

### Wizard Integration

The StylePicker is integrated into the `CreateDiagnosticWizard` as the second step:

1. **Basic Settings** - Topic, delivery mode, questions
2. **Test Style** - Style selection and customization
3. **Schedule** - Timing and due dates
4. **Review** - Final confirmation

## API Reference

### StylePicker Props

```tsx
interface StylePickerProps {
  value: TestStyleConfig;
  onChange: (config: TestStyleConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

interface TestStyleConfig {
  test_style: 'mcq_quiz' | 'mixed_checkpoint' | 'stem_problem_set' | null;
  style_config_override: StyleConfig;
}
```

### StyleConfig Schema

```tsx
interface StyleConfig {
  item_mix?: Record<string, number>;
  timing?: {
    total_minutes?: number;
    per_item_seconds?: number;
    mode?: 'none' | 'soft' | 'hard';
  };
  feedback?: 'immediate' | 'on_submit' | 'end_only' | 'tiered_hints';
  difficulty?: 'easier' | 'balanced' | 'harder';
  hints?: boolean;
}
```

### Validation API

```tsx
// Validate configuration
const result = validateConfig(config);
// Returns: { issues: ValidationIssue[], fixes: Fix[] }

// Apply fixes
const fixedConfig = applyFixes(config, fixes);

// Check for critical errors
const hasErrors = hasCriticalErrors(config);
```

### Analytics API

```tsx
// Track events
trackStyleSelected('mcq_quiz', 'MCQ Quiz', 'preset');
trackStyleCustomized('mcq_quiz', 'timing.total_minutes', 15, 20);
trackPreviewOpened('mcq_quiz', 3);

// Get analytics summary
const summary = styleAnalytics.getSummary();
```

## Backend Integration

### API Endpoints

The component sends data to the backend via:

```typescript
POST /diagnostic-sessions/
{
  "project": "project-id",
  "topic": "Thermodynamics",
  "test_style": "mcq_quiz",
  "style_config_override": {
    "timing": { "total_minutes": 20, "mode": "soft" },
    "feedback": "immediate"
  }
}
```

### Database Schema

The backend stores the style configuration in the `DiagnosticSession` model:

```python
class DiagnosticSession(models.Model):
    # ... existing fields ...
    test_style = models.CharField(max_length=64, null=True, blank=True)
    style_config_override = models.JSONField(default=dict, blank=True)
```

## Testing

### Unit Tests

```bash
# Run validator tests
npm test styleValidator.test.ts

# Run preview generator tests  
npm test previewGenerator.test.ts

# Run analytics tests
npm test styleAnalytics.test.ts
```

### E2E Tests

```bash
# Run Cypress tests
npm run cypress:open
# Select style-picker.cy.ts
```

### Test Coverage

The implementation includes comprehensive tests for:
- Validation rules and autofixes
- Deterministic preview generation
- Analytics event tracking
- Component interaction flows
- Accessibility compliance

## Accessibility

The component follows WCAG guidelines:

- **Keyboard Navigation**: Full keyboard support with Tab/Enter/Esc
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Logical focus order
- **Color Contrast**: Meets AA standards
- **Screen Reader**: Descriptive text and roles

## Performance

### Optimization Features

- **Lazy Loading**: Preview items generated on demand
- **Memoization**: Configuration validation cached
- **Debounced Updates**: Prevents excessive re-renders
- **Efficient State**: Minimal re-renders with proper state management

### Bundle Size

The implementation adds ~15KB to the bundle:
- StyleValidator: ~5KB
- PreviewGenerator: ~4KB  
- StyleAnalytics: ~3KB
- PresetRegistry: ~3KB

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Future Enhancements

### Planned Features

1. **Additional Presets**: Essay, Coding, Diagram types
2. **Advanced Overlays**: Practice/Exam/Review modes
3. **Deep Analytics**: Integration with external analytics
4. **Preset Sharing**: User-created preset sharing
5. **A/B Testing**: Built-in experimentation framework

### Extension Points

The architecture supports easy extension:

```tsx
// Add new preset
const newPreset: StylePreset = {
  id: 'essay_exam',
  label: 'Essay Exam',
  description: 'Long-form written responses',
  icon: 'edit',
  category: 'assessment',
  tags: ['essay', 'written', 'comprehensive'],
  config: { /* configuration */ }
};

// Register preset
registerPreset(newPreset);
```

## Troubleshooting

### Common Issues

1. **Validation Not Working**: Check that `validateConfig` is imported correctly
2. **Preview Not Deterministic**: Ensure `generateSeed` uses consistent input
3. **Analytics Not Tracking**: Verify console.log is not overridden
4. **Styling Issues**: Check Tailwind classes are available

### Debug Mode

Enable debug logging:

```tsx
// Enable analytics debug
styleAnalytics.setEnabled(true);

// Check validation issues
const issues = validateConfig(config);
console.log('Validation issues:', issues);
```

## Contributing

### Adding New Presets

1. Define preset in `presetRegistry.ts`
2. Add icon mapping in `StylePicker.tsx`
3. Update tests
4. Add documentation

### Adding Validation Rules

1. Implement rule in `styleValidator.ts`
2. Add test cases
3. Update documentation
4. Consider autofix capability

### Adding Analytics Events

1. Define event in `styleAnalytics.ts`
2. Add tracking calls in components
3. Update tests
4. Document event schema

## License

This implementation is part of the Ocean Learn platform and follows the project's licensing terms.
