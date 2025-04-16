# UI Components

This directory contains all the base-level UI components that are used throughout the application. These components are designed to be reusable, consistent, and follow atomic design principles.

## Directory Structure

- `button.tsx`: Basic button components with various styles and states
- `input.tsx`: Form input components
- `label.tsx`: Text label components
- `/cards`: Card-based UI components
- `/common`: Shared UI utilities and components
- `/navigation`: Navigation-related components
- `/data-display`: Components for displaying data (tables, lists, etc.)
- `/forms`: Form-related components and form building blocks

## Usage

Import components directly from the UI directory:

```typescript
import { Button, Input, Label } from '@/components/ui';
```

## Component Guidelines

1. Keep components small and focused on a single responsibility
2. Use TypeScript props interfaces for better type safety
3. Include proper documentation and examples
4. Follow the project's design system
5. Include unit tests and Storybook stories

## Adding New Components

When adding new components:
1. Create the component file using PascalCase naming
2. Create a corresponding types file (ComponentName.types.ts)
3. Create a Storybook story (ComponentName.stories.tsx)
4. Export the component in the nearest index.ts
5. Update this README if adding a new category 