/// <reference types="cypress" />

describe('Simple Cleanup Test', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false;
      }
      return true;
    });

    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Mock cleanup endpoint
    cy.intercept('POST', '/api/projects/cleanup_drafts/', { 
      statusCode: 200, 
      body: { deleted_count: 5, message: 'Success' } 
    }).as('cleanupDrafts');
  });

  it('should test basic navigation and cleanup', () => {
    // Test 1: Basic navigation works
    cy.visit('/projects/create');
    cy.contains('Create School Project').should('exist');
    
    // Test 2: Click works
    cy.contains('Create School Project').click();
    
    // Test 3: Check if we're on the right page (with longer timeout)
    cy.url({ timeout: 15000 }).should('include', '/projects/create-school');
    
    // Test 4: Check if guided setup option exists
    cy.contains('Start Guided Setup').should('exist');
  });

  it('should test localStorage cleanup', () => {
    // Fill localStorage with test data
    cy.window().then((win) => {
      win.localStorage.setItem('test-draft-1', 'test-data-1');
      win.localStorage.setItem('test-draft-2', 'test-data-2');
    });
    
    // Verify data is there
    cy.window().then((win) => {
      expect(win.localStorage.getItem('test-draft-1')).to.equal('test-data-1');
    });
    
    // Navigate to trigger cleanup
    cy.visit('/projects/create');
    
    // Check that cleanup was called
    cy.wait('@cleanupDrafts');
  });

  it('should handle localStorage quota exceeded', () => {
    // Try to fill localStorage to capacity
    const largeData = 'x'.repeat(1024 * 1024); // 1MB
    
    cy.window().then((win) => {
      for (let i = 0; i < 5; i++) {
        try {
          win.localStorage.setItem(`large-data-${i}`, largeData);
        } catch (e) {
          break;
        }
      }
    });
    
    // Try to navigate (should not crash)
    cy.visit('/projects/create');
    cy.get('body').should('be.visible');
  });
}); 