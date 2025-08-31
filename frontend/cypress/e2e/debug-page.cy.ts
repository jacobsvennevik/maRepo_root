/// <reference types="cypress" />

describe('Debug Page Structure', () => {
  it('should debug the project creation page structure', () => {
    // Mock authentication state
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-token-for-testing');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    // Mock authentication API calls
    cy.intercept('GET', '/api/auth/user/', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }
    }).as('getUser');
    
    // Visit the project creation page
    cy.visit('/projects/create-school');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Log the page title
    cy.title().then((title) => {
      cy.log('Page title:', title);
    });
    
    // Log the current URL
    cy.url().then((url) => {
      cy.log('Current URL:', url);
    });
    
    // Log the page body content
    cy.get('body').then((body) => {
      cy.log('Body content length:', body.text().length);
      cy.log('Body HTML preview:', body.html().substring(0, 500));
    });
    
    // Check if there are any elements at all
    cy.get('*').then((elements) => {
      cy.log(`Total elements on page: ${elements.length}`);
    });
    
    // Log all buttons
    cy.get('button').then((buttons) => {
      cy.log(`Found ${buttons.length} button elements:`);
      buttons.each((index, element) => {
        const text = element.textContent?.trim();
        const type = element.type;
        cy.log(`Button ${index}: text="${text}", type="${type}"`);
      });
    });
    
    // Log all form elements (if any) - skip for now
    cy.log('Skipping form check');
    
    // Take a screenshot for visual inspection
    cy.screenshot('debug-page-structure');
  });
}); 