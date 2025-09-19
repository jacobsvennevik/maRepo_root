/**
 * E2E Tests for Flashcards Error Handling
 * 
 * These tests run against the real application and backend,
 * catching issues that unit tests with mocks miss.
 */

describe('Flashcards E2E Error Handling', () => {
  const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276';

  beforeEach(() => {
    // Clear any previous network logs
    if (typeof window !== 'undefined') {
      (window as any).networkErrors = [];
    }
  });

  it('should show error states when backend is unreachable', () => {
    // This test documents what SHOULD happen when backend fails
    // Run with: npm test -- --testNamePattern="backend is unreachable"
    
    cy.visit(`/projects/${projectId}/flashcards`);
    
    // Mock network failure
    cy.intercept('GET', '**/generation/api/projects/*/flashcard-sets/', {
      forceNetworkError: true
    }).as('flashcardSetsError');
    
    cy.intercept('GET', '**/api/projects/*', {
      forceNetworkError: true  
    }).as('projectError');

    // Force a refresh to trigger the errors
    cy.reload();

    // Should show error UI (not blank page)
    cy.contains(/error|failed|connection/i, { timeout: 10000 })
      .should('be.visible');
    
    // Should have retry functionality
    cy.contains(/try again|retry/i)
      .should('be.visible');

    // Verify the actual network calls were attempted
    cy.wait('@flashcardSetsError');
    cy.wait('@projectError');
  });

  it('should recover when backend comes back online', () => {
    cy.visit(`/projects/${projectId}/flashcards`);
    
    // First, simulate failure
    cy.intercept('GET', '**/generation/api/projects/*/flashcard-sets/', {
      forceNetworkError: true
    }).as('initialError');
    
    cy.reload();
    cy.wait('@initialError');
    
    // Should show error
    cy.contains(/error|failed/i, { timeout: 5000 });
    
    // Then simulate recovery
    cy.intercept('GET', '**/generation/api/projects/*/flashcard-sets/', {
      statusCode: 200,
      body: []
    }).as('recovery');
    
    // Click retry
    cy.contains(/try again|retry/i).click();
    cy.wait('@recovery');
    
    // Should show normal content
    cy.contains(/flashcards|sets/i, { timeout: 5000 });
  });
});
