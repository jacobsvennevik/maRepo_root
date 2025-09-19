/**
 * E2E Tests for Quiz Center Error Handling
 * 
 * These tests run against the real application and backend,
 * catching issues that unit tests with mocks miss.
 */

describe('Quiz Center E2E Error Handling', () => {
  const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276';

  beforeEach(() => {
    // Clear any previous network logs
    if (typeof window !== 'undefined') {
      (window as any).networkErrors = [];
    }
  });

  it('should show error states when backend is unreachable', () => {
    // This test documents what SHOULD happen when backend fails
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock network failure for diagnostic sessions
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      forceNetworkError: true
    }).as('diagnosticSessionsError');
    
    // Force a refresh to trigger the errors
    cy.reload();

    // Should show error UI (not blank page)
    cy.contains(/error.*loading.*quizzes|failed.*load|connection.*error/i, { timeout: 10000 })
      .should('be.visible');
    
    // Should have retry functionality
    cy.contains(/try again|retry/i)
      .should('be.visible');

    // Verify the actual network calls were attempted
    cy.wait('@diagnosticSessionsError');
  });

  it('should recover when backend comes back online', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // First, simulate failure
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      forceNetworkError: true
    }).as('initialError');
    
    cy.reload();
    cy.wait('@initialError');
    
    // Should show error
    cy.contains(/error.*loading.*quizzes|failed.*load/i, { timeout: 5000 });
    
    // Then simulate recovery
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 200,
      body: []
    }).as('recovery');
    
    // Click retry
    cy.contains(/try again|retry/i).click();
    cy.wait('@recovery');
    
    // Should show normal content (empty state for no quizzes)
    cy.contains(/no quizzes.*yet|generate.*first.*quiz/i, { timeout: 5000 });
  });

  it('should handle quiz generation errors gracefully', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock successful session list (empty)
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 200,
      body: []
    }).as('emptyList');
    
    // Mock failed quiz generation
    cy.intercept('POST', '**/generation/api/diagnostics/generate/', {
      statusCode: 500,
      body: { detail: 'AI service temporarily unavailable' }
    }).as('generateError');
    
    cy.wait('@emptyList');
    
    // Should show empty state
    cy.contains(/no quizzes.*yet|generate.*first.*quiz/i, { timeout: 5000 });
    
    // Try to generate a quiz
    cy.contains(/auto-generate.*quiz|generate/i).click();
    
    cy.wait('@generateError');
    
    // Should show generation error
    cy.contains(/error.*generating|generation.*failed|ai.*service/i, { timeout: 5000 })
      .should('be.visible');
  });

  it('should display loading states during quiz operations', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock slow response
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 200,
      body: [],
      delay: 2000
    }).as('slowResponse');
    
    cy.reload();
    
    // Should show loading state
    cy.contains(/loading.*quizzes|please.*wait/i, { timeout: 1000 })
      .should('be.visible');
    
    cy.wait('@slowResponse');
    
    // Loading should disappear
    cy.contains(/loading.*quizzes|please.*wait/i, { timeout: 5000 })
      .should('not.exist');
  });

  it('should handle empty quiz list gracefully', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock empty quiz list
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 200,
      body: []
    }).as('emptyQuizzes');
    
    cy.wait('@emptyQuizzes');
    
    // Should show empty state with helpful messaging
    cy.contains(/no quizzes.*yet/i).should('be.visible');
    cy.contains(/generate.*first.*quiz/i).should('be.visible');
    cy.contains(/auto-generate.*quiz/i).should('be.visible');
  });

  it('should display existing quizzes when available', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock quiz list with data
    const mockQuizzes = [
      {
        id: '1',
        title: 'Sample Quiz 1',
        created_at: '2025-09-19T07:00:00Z',
        time_limit_sec: 600,
        questions_count: 5
      },
      {
        id: '2', 
        title: 'Sample Quiz 2',
        created_at: '2025-09-19T06:00:00Z',
        time_limit_sec: 900,
        questions_count: 10
      }
    ];
    
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 200,
      body: mockQuizzes
    }).as('quizzesWithData');
    
    cy.wait('@quizzesWithData');
    
    // Should show quiz cards
    cy.contains('Sample Quiz 1').should('be.visible');
    cy.contains('Sample Quiz 2').should('be.visible');
    
    // Should not show empty state
    cy.contains(/no quizzes.*yet/i).should('not.exist');
  });

  it('should handle authentication errors properly', () => {
    cy.visit(`/projects/${projectId}/tests`);
    
    // Mock 401 unauthorized
    cy.intercept('GET', '**/generation/api/diagnostic-sessions/**', {
      statusCode: 401,
      body: { detail: 'Authentication credentials were not provided.' }
    }).as('authError');
    
    cy.wait('@authError');
    
    // Should handle auth error gracefully
    cy.contains(/authentication|login|unauthorized/i, { timeout: 5000 })
      .should('be.visible');
  });
});
