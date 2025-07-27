/// <reference types="cypress" />

describe('Final Working Test - Core Cleanup Functionality', () => {
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
  });

  it('should test localStorage quota exceeded gracefully', () => {
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

  it('should test direct navigation to school project page', () => {
    // Test direct navigation (bypassing the problematic click)
    cy.visit('/projects/create-school');
    cy.url().should('include', '/projects/create-school');
    cy.contains('Start Guided Setup').should('exist');
  });

  it('should test localStorage cleanup functionality when starting new project', () => {
    // Fill localStorage with test data
    cy.window().then((win) => {
      win.localStorage.setItem('test-draft-1', 'test-data-1');
      win.localStorage.setItem('test-draft-2', 'test-data-2');
      win.localStorage.setItem('project-setup-guided-setup', 'test-data-3');
    });
    
    // Verify data is there
    cy.window().then((win) => {
      expect(win.localStorage.getItem('test-draft-1')).to.equal('test-data-1');
      expect(win.localStorage.getItem('project-setup-guided-setup')).to.equal('test-data-3');
    });
    
    // Navigate to projects/create and click "Create School Project" to trigger cleanup
    cy.visit('/projects/create');
    cy.contains('Create School Project').click();
    
    // Wait for navigation and verify localStorage was cleaned up
    cy.url().should('include', '/projects/create-school');
    cy.window().then((win) => {
      // The cleanup should remove project-setup-guided-setup
      expect(win.localStorage.getItem('project-setup-guided-setup')).to.be.null;
      // Other test data should remain
      expect(win.localStorage.getItem('test-draft-1')).to.equal('test-data-1');
    });
  });

  it('should test basic page functionality', () => {
    // Test that the main pages load correctly
    cy.visit('/projects/create');
    cy.contains('Create School Project').should('exist');
    cy.contains('Create Self-Study Project').should('exist');
    
    // Test direct navigation to school project page
    cy.visit('/projects/create-school');
    cy.contains('Start Guided Setup').should('exist');
    cy.contains('Start Custom Setup').should('exist');
  });

  it('should test project creation flow with cleanup', () => {
    // Fill localStorage with project setup data
    cy.window().then((win) => {
      win.localStorage.setItem('project-setup-guided-setup', 'test-project-data');
    });
    
    // Start project creation flow
    cy.visit('/projects/create');
    cy.contains('Create School Project').click();
    
    // Verify navigation and cleanup
    cy.url().should('include', '/projects/create-school');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('project-setup-guided-setup')).to.be.null;
    });
    
    // Test guided setup navigation
    cy.contains('Start Guided Setup').click();
    cy.contains('Project Information').should('exist');
  });

  it('should test self-study project creation with cleanup', () => {
    // Fill localStorage with project setup data
    cy.window().then((win) => {
      win.localStorage.setItem('self-study-guided-setup', 'test-self-study-data');
    });
    
    // Start self-study project creation
    cy.visit('/projects/create');
    cy.contains('Create Self-Study Project').click();
    
    // Verify navigation and cleanup
    cy.url().should('include', '/projects/create-self-study');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('self-study-guided-setup')).to.be.null;
    });
  });
}); 