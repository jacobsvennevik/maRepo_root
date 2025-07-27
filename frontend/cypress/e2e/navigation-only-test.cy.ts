/// <reference types="cypress" />

describe('Navigation Only Test', () => {
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

  it('should test navigation without cleanup interference', () => {
    // Test 1: Basic navigation works
    cy.visit('/projects/create');
    cy.contains('Create School Project').should('exist');
    
    // Test 2: Click works and navigation happens
    cy.contains('Create School Project').click();
    
    // Test 3: Check if we're on the right page
    cy.url({ timeout: 15000 }).should('include', '/projects/create-school');
    
    // Test 4: Check if guided setup option exists
    cy.contains('Start Guided Setup').should('exist');
  });

  it('should test direct URL navigation', () => {
    // Test direct navigation to the school project page
    cy.visit('/projects/create-school');
    cy.url().should('include', '/projects/create-school');
    cy.contains('Start Guided Setup').should('exist');
  });

  it('should test guided setup navigation', () => {
    // Test direct navigation to guided setup
    cy.visit('/projects/create-school/guided');
    cy.url().should('include', '/projects/create-school/guided');
  });
}); 