/// <reference types="cypress" />

describe('Debug Login', () => {
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
    
    // Create test user for authentication
    cy.createTestUser();
  });

  it('should login successfully', () => {
    // Step 1: Visit login page
    cy.visit('/login');
    cy.get('[data-testid="login-form"]', { timeout: 10000 }).should('be.visible');
    
    // Step 2: Check if form is ready
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.wait(2000);
    cy.get('input[type="email"]').should('not.be.disabled');
    cy.get('input[type="password"]').should('not.be.disabled');
    
    // Step 3: Fill in credentials
    cy.get('input[type="email"]').clear({ force: true }).type('test@example.com', { force: true });
    cy.get('input[type="password"]').clear({ force: true }).type('testpass123', { force: true });
    
    // Step 4: Submit form
    cy.get('button[type="submit"]').click();
    
    // Step 5: Wait for navigation
    cy.wait(5000);
    
    // Step 6: Check current URL
    cy.url().then((url) => {
      cy.log(`Current URL after login: ${url}`);
    });
    
    // Step 7: Check if we're on dashboard
    cy.url().should('include', '/dashboard');
    
    // Step 8: Check if we can see dashboard content
    cy.get('body').should('contain', 'Dashboard');
  });
}); 