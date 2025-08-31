# ADR-001: Smart Metadata Generation - JSONB Storage and Async Design

## Status

**Accepted** - 2024-01-15

## Context

The Smart Metadata Generation feature requires storing flexible, AI-generated metadata for projects. We need to decide on:

1. **Storage Strategy**: How to store flexible metadata that may evolve over time
2. **Processing Strategy**: How to handle AI generation without blocking user interactions
3. **Scalability**: How to handle large volumes of metadata generation requests

## Decision

### 1. JSONB Storage with Separate Table

**Chosen**: Store metadata in a separate `ProjectMeta` table using PostgreSQL's JSONB type with GIN indexing.

**Rationale**:
- **Flexibility**: JSONB allows schema-less storage for evolving metadata structures
- **Performance**: GIN indexes enable efficient querying of JSONB data
- **Separation of Concerns**: Keeps main project table clean while allowing rich metadata
- **Type Safety**: JSONB provides better type validation than TEXT fields
- **Query Capability**: Can query nested JSON data efficiently

**Alternative Considered**: Adding JSONB column directly to Project table
- **Rejected**: Would pollute main table and make it harder to manage metadata lifecycle

### 2. Asynchronous Processing with Celery

**Chosen**: Use Celery for asynchronous metadata generation with Redis as message broker.

**Rationale**:
- **Non-blocking**: User interactions are not delayed by AI processing
- **Scalability**: Can handle multiple concurrent generation requests
- **Reliability**: Failed tasks can be retried automatically
- **Monitoring**: Built-in task monitoring and metrics collection
- **Cost Control**: Can implement rate limiting and batch processing

**Alternative Considered**: Synchronous API calls
- **Rejected**: Would cause timeouts and poor user experience

### 3. Hybrid AI Strategy

**Chosen**: GPT-4 as primary, Gemini as fallback with graceful degradation.

**Rationale**:
- **Reliability**: Fallback ensures service availability
- **Cost Optimization**: Can use cheaper models for less critical operations
- **Performance**: Different models have different strengths
- **Future-proofing**: Easy to add more AI providers

## Consequences

### Positive

1. **Flexible Schema**: Can add new metadata fields without migrations
2. **High Performance**: GIN indexes provide fast JSONB queries
3. **Scalable**: Async processing handles high load gracefully
4. **Reliable**: Fallback mechanisms ensure service availability
5. **Observable**: Comprehensive metrics and monitoring
6. **Cost-effective**: Rate limiting and batch processing control costs

### Negative

1. **Complexity**: Additional infrastructure (Redis, Celery) required
2. **Latency**: Metadata not immediately available after generation request
3. **Storage Overhead**: JSONB storage is larger than normalized tables
4. **Query Complexity**: JSONB queries are more complex than standard SQL
5. **Debugging**: Async processing makes debugging more challenging

### Risks

1. **Redis Dependency**: System depends on Redis availability
2. **API Rate Limits**: AI providers may throttle requests
3. **Cost Escalation**: Uncontrolled AI API usage could be expensive
4. **Data Consistency**: Async processing may cause eventual consistency issues

## Implementation Details

### Database Schema

```sql
CREATE TABLE projects_projectmeta (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects_project(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, key)
);

CREATE INDEX idx_projectmeta_project_key ON projects_projectmeta(project_id, key);
CREATE INDEX idx_projectmeta_value_gin ON projects_projectmeta USING GIN (value);
```

### Task Structure

```python
@shared_task(bind=True)
def generate_project_meta(self, project_id: str):
    # 1. Collect project content
    # 2. Call AI service
    # 3. Store results
    # 4. Record metrics
```

### API Design

```http
POST /api/projects/{id}/generate_metadata/
POST /api/projects/{id}/generate_metadata/?force=true
```

## Monitoring and Observability

### Metrics

- `project_meta_generated_total`: Success/failure counts
- `project_meta_generation_duration_seconds`: Performance tracking
- `project_meta_generation_failures_total`: Error categorization
- `project_meta_content_length_chars`: Input size analysis

### Logging

- Task start/completion events
- AI API call results
- Error details with context
- Performance metrics

### Health Checks

- Redis connectivity
- Celery worker status
- AI API availability
- Database connection pool

## Future Considerations

### Potential Enhancements

1. **Caching**: Cache AI responses to reduce API calls
2. **Batch Processing**: Process multiple projects together
3. **Custom Models**: Train domain-specific models
4. **Real-time Updates**: WebSocket notifications for completion
5. **Advanced Analytics**: Metadata quality scoring

### Migration Strategy

1. **Backward Compatibility**: Maintain support for existing metadata
2. **Gradual Rollout**: Feature flags control deployment
3. **Data Migration**: Tools to migrate existing metadata
4. **Rollback Plan**: Ability to disable feature quickly

## Related Decisions

- [ADR-002: Feature Flag Strategy](./ADR-002-feature-flags.md) - TBD
- [ADR-003: Monitoring Strategy](./ADR-003-monitoring.md) - TBD

## References

- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Celery Documentation](https://docs.celeryproject.org/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

## Review

This ADR should be reviewed when:
- Adding new AI providers
- Changing storage strategy
- Scaling beyond current capacity
- Implementing new metadata types 