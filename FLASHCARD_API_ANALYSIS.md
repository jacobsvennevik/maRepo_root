# Flashcard API Client Usage Analysis

## Problem Identified

The flashcard API calls are using **inconsistent axios clients** throughout the codebase, causing 404 errors because:

1. **Backend endpoints** are under `/generation/api/` (handled by generation app)
2. **Frontend** is using `axiosApi` (points to `/api/`) instead of `axiosGeneration` (points to `/generation/api/`)

## Current Inconsistent Usage

### ❌ WRONG - Using axiosApi (points to /api/)
- `frontend/src/features/flashcards/services/flashcardApi.ts` - **Centralized service using wrong client**
- `frontend/src/app/projects/[projectId]/flashcards/[setId]/page.tsx` - **Page component using wrong client**
- `frontend/src/app/projects/[projectId]/flashcards/hooks/use-project-flashcards.ts` - **Mixed usage**

### ✅ CORRECT - Using axiosGeneration (points to /generation/api/)
- `frontend/src/features/diagnostics/components/CreateFlashcardSetWizard.tsx` - **Correct usage**
- `frontend/src/app/projects/[projectId]/flashcards/hooks/use-project-flashcards.ts` - **Partial correct usage**

## Backend Endpoint Mapping

According to `backend/apps/generation/urls.py`:
```python
# Project-specific flashcard endpoints
path('api/projects/<uuid:project_id>/flashcard-sets/', ...)
path('api/projects/<uuid:project_id>/flashcard-sets/<int:pk>/', ...)
path('api/projects/<uuid:project_id>/flashcards/generate', ...)
```

These are mounted under `/generation/` in `backend/urls.py`:
```python
path('generation/', include('backend.apps.generation.urls')),
```

So the full URLs are:
- `/generation/api/projects/{projectId}/flashcard-sets/`
- `/generation/api/projects/{projectId}/flashcard-sets/{setId}/`
- `/generation/api/projects/{projectId}/flashcards/generate`

## Test Mode Compliance

According to `TEST_MODE_EXPLANATION.md`:
- **Frontend**: `axiosApi` for projects, files, non-generation flashcards
- **Frontend**: `axiosGeneration` for content generation endpoints (flashcards, quizzes, etc.)

## Files That Need Fixing

1. **`frontend/src/features/flashcards/services/flashcardApi.ts`** - Change from `axiosApi` to `axiosGeneration`
2. **`frontend/src/app/projects/[projectId]/flashcards/[setId]/page.tsx`** - Change from `axiosApi` to `axiosGeneration`
3. **`frontend/src/app/projects/[projectId]/flashcards/hooks/use-project-flashcards.ts`** - Fix mixed usage

## Impact

- **Current**: 404 errors when accessing flashcard sets
- **After fix**: Proper routing to generation endpoints
- **Test mode**: Will work correctly with X-Test-Mode headers
