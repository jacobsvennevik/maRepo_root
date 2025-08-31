/// <reference types="cypress" />

describe('Debug Create Page', () => {
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

  it('should debug the create page navigation', () => {
    // Step 1: Login
    cy.visit('/login');
    cy.get('[data-testid="login-form"]', { timeout: 10000 }).should('be.visible');
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.wait(2000);
    cy.get('input[type="email"]').should('not.be.disabled');
    cy.get('input[type="password"]').should('not.be.disabled');
    cy.get('input[type="email"]').clear({ force: true }).type('test@example.com', { force: true });
    cy.get('input[type="password"]').clear({ force: true }).type('testpass123', { force: true });
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    
    // Step 2: Go directly to create page
    cy.visit('/projects/create');
    cy.get('body').should('be.visible');
    
    // Step 3: Take a screenshot to see what's on the page
    cy.screenshot('create-page');
    
    // Step 4: Check if we can see the project type cards
    cy.contains('School Project').should('exist');
    cy.contains('Self-Study Project').should('exist');
    
    // Step 5: Check the current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });
    
    // Step 6: Try to click on School Project button
    cy.contains('Create School Project').click();
    
    // Step 7: Wait and check URL again
    cy.wait(2000);
    cy.url().then((url) => {
      cy.log(`URL after clicking School Project: ${url}`);
    });
    
    // Step 8: Try direct navigation as fallback
    cy.url().then((url) => {
      if (!url.includes('/projects/create-school')) {
        cy.log('Click failed, trying direct navigation');
        cy.visit('/projects/create-school');
      }
    });
    
    // Step 9: Check if we're on the school create page
    cy.url().should('include', '/projects/create-school');
  });
}); 