/// <reference types="cypress" />

describe('Debug Navigation', () => {
  it('should debug the project creation flow', () => {
    // Visit the create page
    cy.visit('/projects/create');
    
    // Log what's on the page
    cy.get('body').then(($body) => {
      cy.log('Page content:', $body.text());
    });
    
    // Check if the button exists
    cy.contains('Create School Project').should('exist');
    
    // Try clicking the button
    cy.contains('Create School Project').click();
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log('Current URL after click:', url);
    });
    
    // Wait a bit and check URL again
    cy.wait(2000);
    cy.url().then((url) => {
      cy.log('URL after 2 seconds:', url);
    });
  });
}); 