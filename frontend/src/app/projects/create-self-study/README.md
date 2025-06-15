# Self-Study Project Creation Flow

This directory contains the self-study project creation flow, which allows users to create personalized learning projects for skill development and self-improvement.

## Overview

The self-study flow is designed to be different from the school project flow, focusing on personal learning goals rather than academic coursework. The flow is split into two pages:

1. **Project Type Selection** (`/projects/create`) - Choose between School and Self-Study projects
2. **Setup Method Selection** (`/projects/create-self-study`) - Choose between Guided and Custom setup

## Flow Steps

### Page 1: Project Type Selection
- **School Project** - For academic coursework, classes, or educational assignments
- **Self-Study Project** - For personal learning and skill development

### Page 2: Setup Method Selection
- **Guided Setup** - Step-by-step questionnaire with AI-powered recommendations
- **Custom Setup** - Full configuration control with advanced settings

### Guided Setup Steps (8 steps)
1. **Project Name** - Basic project identification
2. **Purpose** - Self-study pre-selected with additional options
3. **Focus Areas** - Multi-select with categories and custom tags
4. **Learning Materials** - File upload and link support
5. **Timeline** - Project duration selection
6. **Study Frequency** - Learning schedule preferences
7. **Learning Goal** - Main objective with sub-goals support
8. **Collaboration** - Solo or group learning preferences

## Key Features

### Focus Areas Step
- Multi-select interface with icons and categories
- Search functionality to find specific areas
- Category filtering (Technology, Creative Arts, Business, etc.)
- Custom focus area creation
- Visual selection with badges

### Learning Materials Step
- Drag-and-drop file upload
- Support for various file types (PDF, DOCX, PPTX, etc.)
- Link addition (YouTube, GitHub, blogs, etc.)
- Preview list with remove functionality
- File size display

### Learning Goal Step
- Large textarea for main goal
- Optional sub-goals with add/remove functionality
- Goal examples for inspiration
- Structured goal breakdown

### Collaboration Step
- Option cards for different collaboration types
- Optional collaborator name fields
- Support for solo, small group, large group, and mentor scenarios

## Components Structure

```
create-self-study/
├── components/
│   ├── guided-setup.tsx          # Main setup component
│   └── steps/
│       ├── index.ts              # Step exports
│       ├── project-name-step.tsx
│       ├── purpose-step.tsx
│       ├── focus-areas-step.tsx
│       ├── learning-materials-step.tsx
│       ├── timeline-step.tsx
│       ├── study-frequency-step.tsx
│       ├── learning-goal-step.tsx
│       └── collaboration-step.tsx
├── constants/
│   └── index.ts                  # Options and configurations
├── types/
│   └── index.ts                  # TypeScript interfaces
├── hooks/
│   └── useAutoSave.ts            # Auto-save functionality
└── page.tsx                      # Setup method selection page
```

## Data Structure

The self-study project setup uses the `SelfStudyProjectSetup` interface:

```typescript
interface SelfStudyProjectSetup {
  projectName: string;
  purpose: string;
  focusAreas: string[];
  customFocusArea?: string;
  learningMaterials: LearningMaterial[];
  timeframe: string;
  studyFrequency: string;
  learningGoal: string;
  subGoals?: string[];
  collaboration: string;
  collaborators?: string;
  customDescription?: string;
}
```

## Auto-Save

The flow includes auto-save functionality that persists user progress in localStorage, allowing users to return to their setup later.

## Navigation

- Users can navigate between steps using Previous/Next buttons
- Progress is tracked and displayed
- Step completion validation ensures required fields are filled
- Summary page shows all project details before creation
- Breadcrumb navigation between pages

## Integration

The self-study flow is integrated into the main project creation page at `/projects/create`, where users can choose between school projects and self-study projects. The flow follows this structure:

1. `/projects/create` - Choose project type (School vs Self-Study)
2. `/projects/create-school` - Choose setup method for school projects
3. `/projects/create-self-study` - Choose setup method for self-study projects
4. Guided setup flows for each type
5. `/projects/success` - Success page after project creation

## Styling

Uses the same design system as the school project flow with:
- Consistent color scheme (blue/indigo gradients)
- Responsive design
- Modern UI components
- Smooth transitions and hover effects 