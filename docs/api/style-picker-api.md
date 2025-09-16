# Diagnostic Sessions API - Test Style Support

## Overview

The Diagnostic Sessions API now supports test style configuration, allowing users to create customized diagnostic tests with different question types, timing, and feedback settings.

## Endpoints

### List Diagnostic Sessions
```
GET /generation/api/diagnostic-sessions/
```

**Response:**
```json
[
  {
    "id": "uuid",
    "project": "project-uuid",
    "topic": "Mathematics",
    "test_style": "mcq_quiz",
    "style_config_override": {
      "timing": {
        "total_minutes": 15,
        "per_item_seconds": 60
      },
      "feedback": "immediate",
      "item_mix": {
        "single_select": 0.9,
        "cloze": 0.1
      }
    },
    "status": "DRAFT",
    "created_at": "2025-09-16T21:51:42.684130Z"
  }
]
```

### Create Diagnostic Session
```
POST /generation/api/diagnostic-sessions/
```

**Request Body:**
```json
{
  "project": "project-uuid",
  "topic": "Test Topic",
  "test_style": "mcq_quiz",
  "style_config_override": {
    "timing": {
      "total_minutes": 15,
      "per_item_seconds": 60
    },
    "feedback": "immediate",
    "item_mix": {
      "single_select": 0.9,
      "cloze": 0.1
    }
  }
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "project": "project-uuid",
  "topic": "Test Topic",
  "test_style": "mcq_quiz",
  "style_config_override": {
    "timing": {
      "total_minutes": 15,
      "per_item_seconds": 60
    },
    "feedback": "immediate",
    "item_mix": {
      "single_select": 0.9,
      "cloze": 0.1
    }
  },
  "status": "DRAFT",
  "created_at": "2025-09-16T21:51:42.684130Z"
}
```

### Get Diagnostic Session
```
GET /generation/api/diagnostic-sessions/{session-id}/
```

**Response:** Same as create response

## Test Style Types

### MCQ Quiz (`mcq_quiz`)
Multiple choice questions with configurable options.

**Default Configuration:**
```json
{
  "timing": {
    "total_minutes": 30,
    "per_item_seconds": 60
  },
  "feedback": "immediate",
  "item_mix": {
    "single_select": 1.0
  }
}
```

### Fill in the Blank (`fill_blank`)
Text completion questions.

**Default Configuration:**
```json
{
  "timing": {
    "total_minutes": 20,
    "per_item_seconds": 45
  },
  "feedback": "immediate",
  "item_mix": {
    "cloze": 1.0
  }
}
```

### Mixed Assessment (`mixed`)
Combination of different question types.

**Default Configuration:**
```json
{
  "timing": {
    "total_minutes": 45,
    "per_item_seconds": 90
  },
  "feedback": "immediate",
  "item_mix": {
    "single_select": 0.6,
    "multiple_select": 0.2,
    "cloze": 0.2
  }
}
```

## Configuration Parameters

### Timing Configuration
- `total_minutes`: Total time allowed for the test
- `per_item_seconds`: Time per individual question
- `allow_pause`: Whether students can pause the test
- `show_timer`: Whether to display countdown timer

### Feedback Configuration
- `mode`: "immediate", "deferred", or "none"
- `show_correct_answers`: Display correct answers after submission
- `show_explanations`: Display explanations for answers
- `allow_review`: Allow students to review their answers

### Item Mix Configuration
- `single_select`: Proportion of single-choice questions (0.0-1.0)
- `multiple_select`: Proportion of multiple-choice questions (0.0-1.0)
- `cloze`: Proportion of fill-in-the-blank questions (0.0-1.0)
- `essay`: Proportion of essay questions (0.0-1.0)

**Note:** All proportions in item_mix should sum to 1.0

## Error Responses

### Validation Error
```json
{
  "test_style": ["Invalid test style choice."],
  "style_config_override": ["Invalid configuration format."]
}
```

### Authentication Error
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## Examples

### Create MCQ Quiz
```bash
curl -X POST http://localhost:8000/generation/api/diagnostic-sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "project-uuid",
    "topic": "Algebra Basics",
    "test_style": "mcq_quiz",
    "style_config_override": {
      "timing": {
        "total_minutes": 20,
        "per_item_seconds": 45
      },
      "feedback": "immediate",
      "item_mix": {
        "single_select": 1.0
      }
    }
  }'
```

### Create Mixed Assessment
```bash
curl -X POST http://localhost:8000/generation/api/diagnostic-sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "project-uuid",
    "topic": "Comprehensive Math Review",
    "test_style": "mixed",
    "style_config_override": {
      "timing": {
        "total_minutes": 60,
        "per_item_seconds": 120
      },
      "feedback": "deferred",
      "item_mix": {
        "single_select": 0.5,
        "multiple_select": 0.3,
        "cloze": 0.2
      }
    }
  }'
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user

## Versioning

This API follows semantic versioning. Current version: v1

## Support

For API support and questions, contact the development team or refer to the main documentation.