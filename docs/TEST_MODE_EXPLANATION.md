# Test Mode System Documentation

## Overview

The test mode system in this application is designed to provide a development and testing environment where **only AI calls are mocked**, while maintaining the full real pipeline for all other operations. This allows developers to test the complete application flow without incurring AI API costs or dealing with non-deterministic AI responses.

## Core Principle

**Test mode should only affect AI/LLM calls, not any other part of the system.**

## How Test Mode Works

### 1. Activation

Test mode is activated by setting the environment variable:
```bash
NEXT_PUBLIC_TEST_MODE=true
```

### 2. Detection

**Frontend Detection:**
```typescript
const isTestMode = (): boolean => {
  return process.env.NODE_ENV === "development" && 
         process.env.NEXT_PUBLIC_TEST_MODE === "true";
};
```

**Backend Detection:**
```python
# In AIClient.call()
use_mock = (mock_mode is True) or effective_header_mock or self._use_mock_env
```

### 3. What Happens in Test Mode

#### ✅ **REAL Operations (Unchanged)**
- File uploads to backend
- Project creation and database operations
- File processing and text extraction
- API calls between frontend and backend
- Database queries and data persistence
- File storage and retrieval
- User authentication and authorization

#### 🎭 **MOCKED Operations (AI Only)**
- LLM/AI API calls (Gemini, GPT, etc.)
- Flashcard generation from AI
- Syllabus extraction from AI
- Content analysis from AI
- Any other AI-powered features

## Implementation Details

### Frontend Mocking

**Correct Implementation (Flashcard Generation):**
```typescript
const generateFlashcards = async () => {
  if (isTestMode()) {
    // Mock AI response - this is CORRECT
    const mockResult = {
      deck: {
        suggested_title: "Natural Language Processing Fundamentals",
        suggested_description: "Comprehensive flashcards covering core NLP concepts"
      },
      cards: [
        {
          id: "card_1",
          front: "What is natural language processing?",
          back: "NLP is a field of AI that focuses on interaction between computers and human language."
        }
        // ... more mock cards
      ]
    };
    setGeneratedDeck(mockResult);
    return;
  }

  // Real AI call for production
  const result = await postGenerateFlashcards(formData);
  setGeneratedDeck(result);
};
```

**Incorrect Implementation (File Loading - TO BE FIXED):**
```typescript
const loadFiles = async () => {
  if (isTestMode()) {
    // This is WRONG - don't mock file operations!
    setProjectFiles(mockFiles);
    return;
  }
  
  // This should always run, regardless of test mode
  const response = await axiosApi.get(`/projects/${projectId}/`);
  setProjectFiles(response.data.uploaded_files);
};
```

### Backend Mocking

**AI Client Mocking (Correct):**
```python
class AIClient(BaseAIClient):
    def call(self, *, task: Task, payload: dict, mock_mode: bool = None):
        use_mock = (mock_mode is True) or effective_header_mock or self._use_mock_env
        
        if use_mock:
            # Return schema-compliant mock data
            from .mock_data.registry import MOCK_REGISTRY
            return MOCK_REGISTRY.get_mock_response(task, payload)
        else:
            # Make real AI call
            return self._call_real_ai(task, payload)
```

**Project Services (Correct):**
```python
def seed_project_artifacts(project, *, mock_mode: bool = False):
    # Real file processing and content extraction
    latest_file = UploadedFile.objects.filter(project=project).order_by('-uploaded_at').first()
    content = (latest_file.raw_text or "") if latest_file else ""
    
    # AI calls with mock mode
    client = AIClient(model='gemini-1.5-flash')
    syllabus_data = client.call(task=Task.SYLLABUS, payload=payload, mock_mode=mock_mode)
    tests_data = client.call(task=Task.TEST, payload=payload, mock_mode=mock_mode)
    
    # Real database operations
    ProjectMeta.objects.update_or_create(
        project=project, key='syllabus', defaults={'value': syllabus_data}
    )
```

## Mock Data Sources

### Frontend Mock Data
- Located in: `frontend/src/features/diagnostics/components/CreateFlashcardSetWizard.tsx`
- Contains example flashcards for UI testing
- Should only be used for AI response mocking

### Backend Mock Data
- Located in: `backend/apps/generation/mock_data/`
- Schema-compliant mock responses for all AI tasks
- Includes rich, realistic data for testing

## Benefits of This Approach

1. **Cost Effective**: No AI API calls during development
2. **Deterministic**: Consistent responses for testing
3. **Fast**: No network delays for AI responses
4. **Complete Testing**: Full pipeline testing except AI
5. **Realistic**: Uses real data flow and database operations

## Common Anti-Patterns (What NOT to Do)

❌ **Don't mock file operations:**
```typescript
if (isTestMode()) {
  return mockFiles; // Wrong!
}
```

❌ **Don't mock database operations:**
```python
if mock_mode:
  return fake_project  # Wrong!
```

❌ **Don't mock API endpoints:**
```typescript
if (isTestMode()) {
  return mockApiResponse;  // Wrong!
}
```

## Correct Pattern

✅ **Only mock AI/LLM calls:**
```typescript
const callAI = async (input) => {
  if (isTestMode()) {
    return mockAIResponse;  // Correct!
  }
  return await realAICall(input);
};
```

## Environment Variables

- `NEXT_PUBLIC_TEST_MODE=true` - Enables frontend test mode
- `USE_MOCK_AI=true` - Enables backend AI mocking (optional)
- `DEBUG=true` - Allows test mode headers in backend

## UI Indicators

When test mode is active, users see:
- "Mock Mode Enabled" banners
- Yellow warning indicators
- Debug information in console
- "Using mock data for testing purposes" messages

## Debugging Test Mode

**Frontend Debugging:**
```typescript
console.log('🔍 DEBUG: Test mode active:', isTestMode());
console.log('🔍 DEBUG: Project files loaded:', projectFiles.length);
```

**Backend Debugging:**
```python
logger.info("AI call: task=%s mock_mode=%s", task, use_mock)
```

## Migration Guide

If you find code that incorrectly mocks non-AI operations:

1. Identify what's being mocked
2. Ask: "Is this an AI/LLM call?"
3. If NO: Remove the test mode check
4. If YES: Keep the mock implementation

## Testing

Test mode should be tested to ensure:
- Real file uploads work
- Real database operations work
- Real API calls work
- Only AI responses are mocked
- Mock responses are schema-compliant
- UI shows appropriate indicators

---

**Remember**: Test mode = Mock AI only, everything else is real!
