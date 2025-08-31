# Skip Button Implementation

## Overview
This document describes the implementation of a configurable skip button system for the project creation wizard. The skip button allows users to skip optional steps and is controlled entirely from the parent component.

## Architecture

### 1. Step Configuration
Each step in `STEP_CONFIG` now includes skip configuration:
```typescript
{
  id: 'uploadSyllabus',
  title: 'Upload Syllabus',
  description: 'Upload your course syllabus for AI analysis',
  icon: BookOpen,
  canSkip: true,                    // Whether the step can be skipped
  skipText: "Skip - I don't have a syllabus", // Custom skip text
}
```

### 2. Type Definitions
Updated `SetupStep` interface in `types/index.ts`:
```typescript
export interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  canSkip?: boolean;    // New: Controls if step can be skipped
  skipText?: string;    // New: Custom skip button text
}
```

### 3. Skip Button Component
New reusable `SkipButton` component in `shared/skip-button.tsx`:
- Red styling with hover effects
- Configurable text
- Disabled state support
- Consistent with design system

### 4. Navigation Logic
Updated `useStepNavigation` hook:
- `canSkipCurrentStep()`: Returns whether current step can be skipped
- `handleSkip()`: Handles skip logic (currently same as next, but extensible)
- Integrated with keyboard navigation

### 5. Parent Component Integration
Updated `GuidedSetup` component:
- Uses `canSkipCurrentStep()` to conditionally show skip button
- Skip button appears next to Next button in navigation
- Respects step completion state (disabled when step is complete)

## Usage

### Enabling Skip for a Step
1. Add `canSkip: true` to the step configuration
2. Optionally add `skipText` for custom button text
3. The skip button will automatically appear

### Example Configuration
```typescript
{
  id: 'uploadSyllabus',
  title: 'Upload Syllabus',
  description: 'Upload your course syllabus for AI analysis',
  icon: BookOpen,
  canSkip: true,
  skipText: "Skip - I don't have a syllabus",
}
```

### Current Skip-Enabled Steps
- **Upload Syllabus**: `"Skip - I don't have a syllabus"`
- **Upload Course Materials**: `"Skip - I don't have course materials"`
- **Upload Tests**: `"Skip - I don't have test materials"`

## Features

### Visual Design
- Red button styling (`text-red-600`, `border-red-200`)
- Hover effects (`hover:bg-red-50`, `hover:border-red-300`)
- Consistent with existing button design system
- Positioned next to Next button in navigation

### Behavior
- Only appears for steps with `canSkip: true`
- Disabled when step is complete (user has filled required fields)
- Triggers same navigation as Next button
- Supports keyboard shortcuts (if enabled)

### Extensibility
- Easy to add skip functionality to new steps
- Custom skip text per step
- Centralized skip logic in parent component
- Reusable skip button component

## Testing
- Unit tests for `SkipButton` component
- Tests cover rendering, click handling, disabled state, and styling
- Integration tests verify skip functionality in wizard flow

## Future Enhancements
1. **Skip State Tracking**: Track which steps were skipped for analytics
2. **Conditional Skip Logic**: More complex skip conditions based on user choices
3. **Skip Confirmation**: Optional confirmation dialog for important steps
4. **Skip History**: Show which steps were skipped in project summary

## Files Modified
- `guided-setup/constants.ts`: Added skip configuration to steps
- `types/index.ts`: Updated SetupStep interface
- `shared/skip-button.tsx`: New skip button component
- `guided-setup/hooks/useStepNavigation.ts`: Added skip logic
- `guided-setup/index.tsx`: Integrated skip button in navigation
- `shared/__tests__/skip-button.test.tsx`: Unit tests 