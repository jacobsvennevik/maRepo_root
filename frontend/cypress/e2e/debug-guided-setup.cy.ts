/// <reference types="cypress" />

describe('Debug Guided Setup', () => {
  it('should debug the guided setup loading process', () => {
    // Visit the project creation page without authentication first
    cy.visit('/projects/create-school');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Check if we're on the selection page
    cy.contains('School Project Setup').should('be.visible');
    cy.contains('Start Guided Setup').should('be.visible');
    
    // Click the guided setup button
    cy.contains('Start Guided Setup').click();
    
    // Wait a bit for the transition
    cy.wait(2000);
    
    // Check for any console errors
    cy.window().then((win) => {
      const errors = win.console.error;
      cy.log('Console errors:', errors);
    });
    
    // Check if we can find any elements that should be in the guided setup
    cy.get('body').then((body) => {
      const text = body.text();
      cy.log('Page text contains:', text.substring(0, 500));
    });
    
    // Try to find any input elements
    cy.get('input').then((inputs) => {
      cy.log(`Found ${inputs.length} input elements`);
      inputs.each((index, element) => {
        const id = element.id;
        const name = element.name;
        const type = element.type;
        cy.log(`Input ${index}: id="${id}", name="${name}", type="${type}"`);
      });
    });
    
    // Try to find the project name input
    cy.get('input#projectName', { timeout: 5000 }).should('exist');
    
    // Take a screenshot
    cy.screenshot('debug-guided-setup');
  });
}); 