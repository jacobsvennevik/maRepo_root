/// <reference types="cypress" />

describe('@wizard Debug Navigation', () => {
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

  it('should navigate through the project creation flow step by step', () => {
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
    
    // Step 2: Go to projects page
    cy.visit('/projects');
    cy.get('body').should('be.visible');
    
    // Step 3: Check if we can see the projects page content
    cy.contains('Projects').should('exist');
    
    // Step 4: Look for the create project button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Create New Project")').length > 0) {
        cy.log('Found Create New Project button');
        cy.contains('Create New Project').click();
      } else {
        cy.log('Create New Project button not found, checking for alternative text');
        cy.get('body').should('contain', 'Create New Project');
      }
    });
    
    // Step 5: Check if we're on the create page
    cy.url().should('include', '/projects/create');
    
    // Step 6: Look for School Project option
    cy.contains('School Project').should('exist');
    cy.contains('School Project').click();
    
    // Step 7: Check if we're on the school create page
    cy.url().should('include', '/projects/create-school');
    
    // Step 8: Look for Guided Setup option
    cy.contains('Start Guided Setup').should('exist');
    cy.contains('Start Guided Setup').click();
    
    // Step 9: Check if we're in the wizard
    cy.get('input#projectName').should('exist');
  });
}); 