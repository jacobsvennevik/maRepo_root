# Architecture Guidelines & Guardrails

This document outlines the architectural patterns, guardrails, and best practices implemented in this Next.js application.

## 🏗️ Architecture Overview

### Vertical Slice Architecture
- **Features**: Domain-specific code organized in `src/features/`
- **Routes**: Thin adapters in `src/app/` with minimal domain logic
- **Shared**: Reusable components and utilities in `src/components/` and `src/lib/`

### Directory Structure
```
src/
├── app/                    # Next.js App Router (thin adapters)
│   ├── (marketing)/        # Marketing pages
│   ├── (auth)/            # Authentication pages
│   └── (app)/             # Protected application pages
├── features/              # Domain-specific features
│   ├── projects/          # Project management
│   ├── auth/              # Authentication
│   ├── diagnostics/       # Assessment/diagnostics
│   ├── flashcards/        # Flashcard management
│   └── providers/         # Global providers
├── components/            # Reusable UI components
├── lib/                   # Framework-aware utilities
├── utils/                 # Pure utilities
└── test-utils/           # Testing utilities
```

## 🛡️ Guardrails & Best Practices

### 1. Server/Client Boundaries

**Server-only code** (API services, database access):
```typescript
// server-only
import 'server-only';
```

**Client-only code** (hooks, components with state):
```typescript
'use client';
```

### 2. Typed Environment Configuration

Use the centralized environment configuration:
```typescript
import { env } from '@/lib/env';

// Instead of process.env.NEXT_PUBLIC_API_URL
const apiUrl = env.NEXT_PUBLIC_API_URL;
```

### 3. Import Boundaries

**✅ Correct** - Import from feature barrels:
```typescript
import { ProjectCard, useOptionalProject } from '@/features/projects';
```

**❌ Incorrect** - Direct imports from feature internals:
```typescript
import { ProjectCard } from '@/features/projects/components/project-card';
```

### 4. Feature Structure

Each feature follows this structure:
```
features/feature-name/
├── components/           # UI components
├── services/            # API calls and business logic
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── index.ts             # Barrel exports
```

### 5. Barrel Exports

Every feature exports its public API through `index.ts`:
```typescript
// src/features/projects/index.ts
export type { Project, ProjectV2 } from './types';
export { fetchProjects, createProject } from './services/api';
export { ProjectCard } from './components/project-card';
export { useOptionalProject } from './hooks/useOptionalProject';
```

## 🚀 Development Workflow

### Creating New Features

Use the scaffolding script:
```bash
npm run create-feature my-feature
```

This creates:
- Proper directory structure
- Placeholder files
- Barrel export template

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your environment variables
3. The app will validate them at runtime

### Bundle Analysis

Analyze bundle size:
```bash
npm run analyze
```

### Dead Code Detection

Find unused exports and files:
```bash
npm run dep:check    # Using knip
npm run dep:unused   # Using ts-prune
```

## 🧪 Testing Strategy

### Unit Tests
- Co-located with source files (`*.test.ts(x)`)
- Test feature logic, not implementation details

### Integration Tests
- Test feature boundaries
- Use MSW for API mocking

### E2E Tests
- Use `data-testid` sparingly
- Prefer role/name queries

## 📦 Performance & Bundle Hygiene

### Bundle Analysis
- Run `npm run analyze` regularly
- Monitor key pages (dashboard, projects list)
- Set budgets for critical paths

### Code Splitting
- Features are automatically code-split
- Lazy load non-critical components
- Use dynamic imports for heavy libraries

## 🔧 Maintenance

### Weekly Tasks
- Run `npm run dep:check` to find dead code
- Review bundle analysis for regressions
- Update dependencies

### Monthly Tasks
- Review architecture compliance
- Update Storybook stories
- Audit performance metrics

## 🚨 Common Pitfalls

### ❌ Don't
- Put domain logic in route files
- Import directly from feature internals
- Use `any` types without justification
- Mix server and client code

### ✅ Do
- Keep routes thin and focused
- Use feature barrel exports
- Add proper TypeScript types
- Separate server/client concerns

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

