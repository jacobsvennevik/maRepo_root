# Reflection & After-Action Review (AAR) App

This Django app implements a comprehensive 90-second reflection system that helps students improve their learning through structured self-assessment and AI-powered recommendations.

## Features

### Core Reflection System
- **90-second reflection sessions** triggered after quiz/study activities
- **Structured reflection prompts** with predefined keys for consistent analytics
- **Automatic session timing** and duration tracking
- **Project-based organization** linking reflections to specific study topics

### AI-Powered Analysis
- **Rule-based text analysis** for immediate insights
- **LLM fallback analysis** for sophisticated pattern recognition
- **Automatic tagging** of reflection themes (misreading, formula errors, time management, etc.)
- **Confidence scoring** for analysis quality

### Smart Recommendations
- **Contextual recommendations** based on reflection analysis
- **Multiple recommendation types**: practice sets, flashcards, tips, mini-lessons
- **Click tracking** for engagement analytics
- **Dismissal handling** for user preference learning

### Checklist System
- **AI-generated checklists** from uploaded study materials
- **Structured study guidance** with actionable items
- **Hint system** for additional support
- **Project integration** for topic-specific checklists

### Streak & Motivation
- **Daily reflection streaks** to encourage consistent practice
- **Progress tracking** with completion rates and analytics
- **Gamification elements** to maintain engagement

## API Endpoints

### Reflection Sessions
- `POST /reflection/sessions/` - Create new reflection session
- `GET /reflection/sessions/` - List user's reflection sessions
- `POST /reflection/sessions/{id}/complete/` - Complete session and trigger analysis
- `POST /reflection/sessions/{id}/add_entry/` - Add reflection entry

### Reflection Entries
- `GET /reflection/entries/` - List reflection entries
- `POST /reflection/entries/` - Create reflection entry

### Checklists
- `GET /reflection/checklists/` - List project checklists
- `POST /reflection/checklists/extract_from_content/` - Extract checklist from content

### Recommendations
- `GET /reflection/recommendations/` - List recommendations
- `POST /reflection/recommendations/{id}/mark_clicked/` - Mark as clicked
- `POST /reflection/recommendations/{id}/dismiss/` - Dismiss recommendation

### Analytics
- `GET /reflection/streak/` - Get reflection streak information
- `GET /reflection/summary/` - Get comprehensive reflection summary

## Usage Flow

1. **Trigger**: Quiz submission or study session end
2. **Create Session**: POST to `/reflection/sessions/` with project and source context
3. **Add Entries**: POST to `/reflection/sessions/{id}/add_entry/` with reflection responses
4. **Complete Session**: POST to `/reflection/sessions/{id}/complete/` to trigger analysis
5. **Get Insights**: Retrieve analysis, recommendations, and checklists
6. **Follow Through**: Use recommendations to guide next study session

## Integration Points

- **Generation App**: For MCQ/flashcard generation and content routing
- **PDF Service**: For checklist extraction from uploaded materials
- **Projects App**: For project context and organization
- **Spaced Repetition**: For scheduling targeted review sessions

## Configuration

The app automatically integrates with existing Django settings and requires:
- PostgreSQL database with JSON field support
- Redis for caching (optional)
- AI generation services for advanced analysis
- JWT authentication for user management

## Models

- `ReflectionSession`: Main reflection session container
- `ReflectionEntry`: Individual reflection responses
- `ReflectionAnalysis`: AI analysis results
- `Checklist`: Study guidance checklists
- `ChecklistItem`: Individual checklist items
- `Recommendation`: Actionable next steps
- `ReflectionStreak`: User engagement tracking
