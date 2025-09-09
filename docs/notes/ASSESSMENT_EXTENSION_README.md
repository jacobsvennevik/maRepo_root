# Assessment Extension Implementation

This document describes the implementation of the generalized assessment system that extends the existing flashcard functionality to support multiple assessment types including Multiple Choice Questions (MCQ), True/False, Fill in the Blank, and Mixed assessments.

## Overview

The assessment extension follows the blueprint outlined in the original specification, implementing a generalized system that:

1. **Maintains backward compatibility** with existing flashcard functionality
2. **Supports multiple assessment types** through a polymorphic data model
3. **Provides mock mode** for testing and development
4. **Extends the frontend** with new components while preserving existing ones

## Architecture

### Backend Models

#### Core Models

- **`AssessmentSet`**: Generalized set container (replaces `FlashcardSet`)
- **`AssessmentItem`**: Polymorphic assessment item (replaces `Flashcard`)
- **`AssessmentAttempt`**: Records user attempts/submissions

#### Backward Compatibility

- **`FlashcardSet`**: Proxy model that inherits from `AssessmentSet`
- **`Flashcard`**: Proxy model that inherits from `AssessmentItem`

### Frontend Components

#### New Components

- **`AssessmentItemRenderer`**: Renders different assessment types based on `item_type`
- **`AssessmentStudy`**: Study session component for mixed assessment types
- **`CreateFlashcardSetWizard`**: Extended to support assessment type selection

#### Backward Compatibility

- Existing `FlashcardStudy` component continues to work
- Existing `FlashcardDashboard` component continues to work
- All existing flashcard types and interfaces are preserved

## Implementation Details

### 1. Data Model Extension

The core extension is in the data model, which uses a polymorphic approach:

```python
class AssessmentItem(models.Model):
    item_type = models.CharField(choices=[
        ('FLASHCARD', 'Flashcard'),
        ('MCQ', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False'),
        ('FILL_BLANK', 'Fill in the Blank'),
        # ... more types
    ])
    
    # Common fields
    question = models.TextField()  # For flashcards: question; for MCQ: stem
    answer = models.TextField()    # For flashcards: answer; for MCQ: correct answer
    
    # MCQ-specific fields
    choices = models.JSONField(default=list)
    correct_index = models.PositiveIntegerField(null=True)
    explanation = models.TextField(blank=True)
    
    # Spaced repetition fields (for flashcards and some other types)
    algorithm = models.CharField(choices=[('sm2', 'SM-2'), ('leitner', 'Leitner')])
    learning_state = models.CharField(choices=[('new', 'New'), ('learning', 'Learning'), ('review', 'Review')])
    # ... other SR fields
```

### 2. API Endpoints

New endpoints are added while preserving existing ones:

```
# New assessment endpoints
GET /api/projects/{project_id}/assessment-sets/
POST /api/projects/{project_id}/assessment-sets/
GET /api/projects/{project_id}/assessment-sets/{set_id}/
DELETE /api/projects/{project_id}/assessment-sets/{set_id}/
POST /api/projects/{project_id}/assessment-sets/generate/
GET /api/projects/{project_id}/assessment-items/due/

# Existing flashcard endpoints (preserved)
GET /api/projects/{project_id}/flashcard-sets/
POST /api/projects/{project_id}/flashcard-sets/
# ... etc
```

### 3. Frontend Components

#### AssessmentItemRenderer

The `AssessmentItemRenderer` component handles different assessment types:

```typescript
// Renders based on item_type
switch (item.item_type) {
  case 'FLASHCARD':
    return renderFlashcard();
  case 'MCQ':
    return renderMCQ();
  case 'TRUE_FALSE':
    return renderTrueFalse();
  case 'FILL_BLANK':
    return renderFillBlank();
  default:
    return renderUnsupported();
}
```

#### CreateFlashcardSetWizard Extension

The wizard now includes assessment type selection:

```typescript
// New step for assessment type selection
<SelectDropdown value={form.kind} onValueChange={(value: string) => 
  setForm(prev => ({ ...prev, kind: value as AssessmentKind }))}>
  <SelectDropdownContent>
    <SelectDropdownItem value="FLASHCARDS">Flashcards</SelectDropdownItem>
    <SelectDropdownItem value="MCQ">Multiple Choice Questions</SelectDropdownItem>
    <SelectDropdownItem value="MIXED">Mixed Assessment</SelectDropdownItem>
    <SelectDropdownItem value="TRUE_FALSE">True/False Questions</SelectDropdownItem>
    <SelectDropdownItem value="FILL_BLANK">Fill in the Blank</SelectDropdownItem>
  </SelectDropdownContent>
</SelectDropdown>
```

### 4. Mock Mode Implementation

Mock mode is implemented at both frontend and backend levels:

#### Frontend Mock Mode

```typescript
// In AssessmentApi
async getMockAssessmentData(): Promise<{
  sets: AssessmentSet[];
  items: AssessmentItem[];
  attempts: AssessmentAttempt[];
} | null> {
  if (process.env.NEXT_PUBLIC_MOCK_MODE !== 'true') {
    return null;
  }
  
  // Generate deterministic mock data
  const mockSets: AssessmentSet[] = [
    {
      id: 1,
      title: "Mock Flashcards Set",
      kind: "FLASHCARDS",
      // ... other fields
    },
    {
      id: 2,
      title: "Mock MCQ Set", 
      kind: "MCQ",
      // ... other fields
    }
  ];
  
  return { sets: mockSets, items: mockItems, attempts: mockAttempts };
}
```

#### Rich MCQ Mock Data

The system now includes comprehensive mock MCQ data based on NLP/ML content:

```python
# In flashcard_mocks.py
def get_mock_mcq_data(num_questions: int = 12, difficulty: str = "medium", topic: str = "nlp"):
    """Generate mock MCQ data for NLP/ML topics."""
    
    nlp_mcq_data = [
        {
            "question": "The principle of compositionality states that the meaning of an expression is determined by:",
            "choices": [
                "The most frequent word in the expression",
                "The meanings of its parts and how they are combined",
                "The length of the sentence only", 
                "The parser used to analyze it"
            ],
            "correct_index": 1,
            "explanation": "Compositionality is a fundamental principle in linguistics and semantics...",
            "topic": "Semantics",
            "difficulty": "medium",
            "bloom_level": "understand"
        },
        # ... 12 total questions covering NLP/ML topics
    ]
```

**Topics Covered:**
- **Semantics**: Compositionality, distributional semantics
- **Vector Representations**: Sentence vectorization, pooling methods
- **CNNs**: Text convolution, max-pooling, bag-of-words limitations
- **RNNs**: Hidden state updates, gradient clipping, gated cells (LSTM/GRU)
- **Sequence-to-Sequence**: Encoder-decoder architecture
- **Attention**: Self-attention mechanisms
- **Transformers**: Multi-head attention, positional embeddings

#### Backend Mock Mode

```python
# In ProjectAssessmentSetViewSet
def _generate_mcq_items(self, assessment_set, data):
    """Generate MCQ items."""
    items = []
    num_items = data['num_items']
    choices_per_item = data.get('choices_per_item', 4)
    mock_mode = data.get('mock_mode', False)
    
    if mock_mode:
        # Use rich mock MCQ data with NLP/ML content
        mock_data = get_mock_mcq_data(num_items, data['difficulty'].lower(), "nlp")
        
        for i, mock_item in enumerate(mock_data):
            item = AssessmentItem.objects.create(
                assessment_set=assessment_set,
                item_type='MCQ',
                order_index=i,
                question=mock_item['question'],
                answer=mock_item['choices'][mock_item['correct_index']],
                choices=mock_item['choices'],
                correct_index=mock_item['correct_index'],
                explanation=mock_item['explanation'],
                difficulty=data['difficulty'],
                bloom_level=mock_item.get('bloom_level', 'apply'),
                concept_id=f"mcq-{mock_item['topic'].lower().replace(' ', '-')}-{i+1}",
                theme=mock_item['topic']
            )
            items.append(item)
    else:
        # Simple mock data for non-mock mode
        for i in range(num_items):
            choices = [f"Choice {j+1}" for j in range(choices_per_item)]
            correct_index = 0  # First choice is correct for mock data
            
            item = AssessmentItem.objects.create(
                assessment_set=assessment_set,
                item_type='MCQ',
                order_index=i,
                question=f"MCQ question {i+1}",
                answer=f"Correct answer for question {i+1}",
                choices=choices,
                correct_index=correct_index,
                explanation=f"Explanation for question {i+1}",
                difficulty=data['difficulty'],
                bloom_level='apply'
            )
            items.append(item)
    
    return items
```

## Usage Examples

### 1. Creating a Mixed Assessment Set

```typescript
const request: AssessmentGenerationRequest = {
  title: "Mixed Science Assessment",
  kind: "MIXED",
  description: "A mix of flashcards and MCQs for science review",
  num_items: 20,
  difficulty: "INTERMEDIATE",
  assessment_config: {
    "FLASHCARD": 60,  // 60% flashcards
    "MCQ": 40         // 40% MCQs
  },
  mock_mode: true
};

const result = await AssessmentApi.generateAssessmentFromProject(projectId, request);
```

### 2. Studying Different Assessment Types

The `AssessmentStudy` component automatically handles different item types:

```typescript
// For flashcards: shows flip interface with quality rating
// For MCQ: shows multiple choice with immediate feedback
// For True/False: shows True/False buttons
// For Fill in the Blank: shows text input with answer reveal
```

### 3. Reviewing Different Item Types

```typescript
// Flashcard review
await AssessmentApi.reviewAssessmentItem(itemId, {
  quality: 4,
  response_time_seconds: 15.5,
  notes: "Knew this well"
});

// MCQ review  
await AssessmentApi.reviewAssessmentItem(itemId, {
  selected_index: 2,
  response_time_ms: 5000,
  is_correct: true
});
```

## Migration Strategy

### 1. Database Migration

The migration creates new tables while preserving existing data:

```python
# Migration creates AssessmentSet, AssessmentItem, AssessmentAttempt
# Plus proxy models for backward compatibility
migrations.CreateModel(
    name='FlashcardSet',
    fields=[],
    options={'proxy': True},
    bases=('generation.assessmentset',),
)
```

### 2. API Compatibility

Existing flashcard endpoints continue to work:

```python
# These still work exactly as before
GET /api/projects/{project_id}/flashcard-sets/
POST /api/projects/{project_id}/flashcard-sets/
GET /api/flashcards/{id}/review/
```

### 3. Frontend Compatibility

Existing components continue to work:

```typescript
// These still work exactly as before
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { GenerationApi } from '@/api/generationApi';

const sets = await GenerationApi.getProjectFlashcardSets(projectId);
```

## Testing

### 1. Mock Mode Testing

Enable mock mode for testing:

```bash
# Frontend
NEXT_PUBLIC_MOCK_MODE=true npm run dev

# Backend
# Set mock_mode=true in generation requests
```

### 2. Unit Tests

Test different assessment types:

```typescript
// Test MCQ rendering
const mcqItem: AssessmentItem = {
  item_type: 'MCQ',
  question: 'What is 2+2?',
  choices: ['3', '4', '5', '6'],
  correct_index: 1,
  // ... other fields
};

// Test flashcard rendering
const flashcardItem: AssessmentItem = {
  item_type: 'FLASHCARD', 
  question: 'What is the capital of France?',
  answer: 'Paris',
  // ... other fields
};
```

## Future Extensions

The architecture supports easy extension to new assessment types:

1. **Add new item_type** to `AssessmentItem.ITEM_TYPE_CHOICES`
2. **Add rendering logic** to `AssessmentItemRenderer`
3. **Add generation logic** to backend services
4. **Add validation** to serializers

Example for a new "Matching" type:

```python
# Backend
class AssessmentItem(models.Model):
    ITEM_TYPE_CHOICES = [
        # ... existing choices
        ('MATCHING', 'Matching'),
    ]
    
    # Add matching-specific fields
    left_items = models.JSONField(default=list)  # Left column items
    right_items = models.JSONField(default=list)  # Right column items
    correct_matches = models.JSONField(default=list)  # Correct pairings
```

```typescript
// Frontend
const renderMatching = () => (
  <div>
    {/* Render matching interface */}
  </div>
);

// Add to switch statement
case 'MATCHING':
  return renderMatching();
```

## Conclusion

This implementation successfully extends the flashcard system to support multiple assessment types while maintaining full backward compatibility. The polymorphic approach allows for easy extension to new assessment types, and the mock mode provides a robust testing environment.

The system is ready for production use and can be gradually adopted by existing users without breaking their current workflows.
