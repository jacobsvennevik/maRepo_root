# Test Style Feature Implementation

## Overview

The Test Style feature allows users to configure different types of diagnostic tests with customizable parameters. This includes multiple choice quizzes, fill-in-the-blank tests, and other assessment formats with configurable timing, feedback, and question mix settings.

## Architecture

### Backend Implementation

#### Models
- **DiagnosticSession**: Extended with new fields:
  - `test_style`: Choice field for test type (mcq_quiz, fill_blank, etc.)
  - `style_config_override`: JSON field for custom configuration

#### Serializers
- **DiagnosticSessionSerializer**: Handles validation and serialization of test style fields
- Validates `style_config_override` as JSON object
- Supports optional fields with proper defaults

#### API Endpoints
- `GET /generation/api/diagnostic-sessions/`: List diagnostic sessions with test style info
- `POST /generation/api/diagnostic-sessions/`: Create new diagnostic with test style
- `GET /generation/api/diagnostic-sessions/{id}/`: Retrieve specific session with style config

### Frontend Implementation

#### Components
- **StylePicker**: Main component for test style configuration
  - Preset configurations for common test types
  - Custom configuration builder
  - Real-time validation and preview
  - Analytics integration

- **CreateDiagnosticWizard**: Integrated StylePicker into diagnostic creation flow

#### Features
- **Preset Configurations**: Pre-defined settings for common test types
- **Custom Configuration**: Advanced users can customize all parameters
- **Validation**: Real-time validation of configuration parameters
- **Preview**: Live preview of test configuration
- **Analytics**: Event tracking for user interactions

## Test Style Types

### MCQ Quiz (`mcq_quiz`)
- Multiple choice questions with single or multiple correct answers
- Configurable timing per question
- Immediate or deferred feedback options
- Question mix customization

### Fill in the Blank (`fill_blank`)
- Text completion questions
- Configurable difficulty levels
- Customizable feedback timing
- Partial credit options

### Mixed Assessment (`mixed`)
- Combination of different question types
- Configurable ratios for each type
- Adaptive difficulty based on performance
- Comprehensive feedback system

## Configuration Parameters

### Timing Configuration
```json
{
  "timing": {
    "total_minutes": 30,
    "per_item_seconds": 60,
    "allow_pause": true,
    "show_timer": true
  }
}
```

### Feedback Configuration
```json
{
  "feedback": {
    "mode": "immediate", // immediate, deferred, none
    "show_correct_answers": true,
    "show_explanations": true,
    "allow_review": true
  }
}
```

### Item Mix Configuration
```json
{
  "item_mix": {
    "single_select": 0.6,
    "multiple_select": 0.2,
    "cloze": 0.1,
    "essay": 0.1
  }
}
```

## API Usage Examples

### Creating a Diagnostic Session with Test Style

```bash
curl -X POST http://localhost:8000/generation/api/diagnostic-sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
    }
  }'
```

### Retrieving Diagnostic Session

```bash
curl http://localhost:8000/generation/api/diagnostic-sessions/{session-id}/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Usage

### Using StylePicker Component

```tsx
import { StylePicker } from '@/features/diagnostics/components/StylePicker';

function CreateDiagnostic() {
  const [styleConfig, setStyleConfig] = useState({
    test_style: 'mcq_quiz',
    style_config_override: {}
  });

  return (
    <StylePicker
      value={styleConfig}
      onChange={setStyleConfig}
      onNext={() => {/* proceed to next step */}}
      onBack={() => {/* go back */}}
    />
  );
}
```

### Integration with CreateDiagnosticWizard

The StylePicker is integrated into the diagnostic creation wizard, allowing users to:
1. Select a test style preset
2. Customize configuration parameters
3. Preview the test configuration
4. Save and proceed to question generation

## Database Schema

### Migration: `0015_diagnosticsession_style_config_override_and_more.py`

```python
# Added fields to DiagnosticSession model
test_style = models.CharField(
    max_length=50,
    choices=TEST_STYLE_CHOICES,
    null=True,
    blank=True,
    help_text="Type of test style for this diagnostic session"
)

style_config_override = models.JSONField(
    null=True,
    blank=True,
    help_text="Custom configuration overrides for test style"
)
```

## Testing

### Backend Tests
- Unit tests for serializer validation
- API endpoint tests for CRUD operations
- Integration tests for test style configuration

### Frontend Tests
- Component tests for StylePicker
- Integration tests for CreateDiagnosticWizard
- E2E tests for complete diagnostic creation flow

### Test Data
```python
# Example test session creation
session_data = {
    'project': project.id,
    'topic': 'Test Topic',
    'test_style': 'mcq_quiz',
    'style_config_override': {
        'timing': {'total_minutes': 15, 'per_item_seconds': 60},
        'feedback': 'immediate',
        'item_mix': {'single_select': 0.9, 'cloze': 0.1}
    }
}
```

## Analytics and Monitoring

### Events Tracked
- `test_style_selected`: When user selects a test style
- `style_config_modified`: When user modifies configuration
- `preset_applied`: When user applies a preset configuration
- `diagnostic_created_with_style`: When diagnostic is created with test style

### Metrics
- Most popular test styles
- Configuration customization patterns
- User engagement with StylePicker component
- Diagnostic completion rates by test style

## Future Enhancements

### Planned Features
1. **Adaptive Testing**: Dynamic difficulty adjustment based on performance
2. **Question Bank Integration**: Automatic question selection based on style
3. **Advanced Analytics**: Detailed performance analysis by test style
4. **Custom Question Types**: Support for user-defined question formats
5. **Collaborative Testing**: Multi-user test sessions with shared configuration

### Technical Improvements
1. **Caching**: Cache common configurations for faster loading
2. **Validation**: Enhanced client-side validation with better error messages
3. **Accessibility**: Improved screen reader support and keyboard navigation
4. **Mobile Optimization**: Better mobile experience for configuration

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure all migrations are applied
   ```bash
   python manage.py migrate
   ```

2. **API Authentication**: Verify JWT token is valid and not expired
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" /api/diagnostic-sessions/
   ```

3. **Frontend Build Errors**: Check TypeScript compilation
   ```bash
   npm run build
   ```

4. **Configuration Validation**: Ensure JSON structure matches expected format

### Debug Mode
Enable debug logging for test style operations:
```python
LOGGING = {
    'loggers': {
        'backend.apps.generation': {
            'level': 'DEBUG',
            'handlers': ['console'],
        },
    },
}
```

## Security Considerations

1. **Input Validation**: All configuration parameters are validated
2. **JSON Injection**: Proper sanitization of JSON configuration data
3. **Access Control**: Users can only modify their own diagnostic sessions
4. **Rate Limiting**: API endpoints are rate-limited to prevent abuse

## Performance Considerations

1. **Database Indexing**: Proper indexes on test_style field
2. **JSON Queries**: Optimized queries for style_config_override field
3. **Caching**: Frequently used configurations are cached
4. **Lazy Loading**: StylePicker components load on demand

---

## Conclusion

The Test Style feature provides a flexible and powerful way to configure diagnostic tests. The implementation follows best practices for both backend and frontend development, with proper validation, testing, and documentation. The feature is ready for production use and can be extended with additional test types and configuration options as needed.
