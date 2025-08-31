describe('Smoke Test - Basic SSR Routes', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.get('h1').should('exist');
  });

  it('should load the projects page', () => {
    cy.visit('/projects');
    cy.get('h1').should('exist');
  });

  it('should load the login page', () => {
    cy.visit('/login');
    cy.get('h1').should('exist');
  });
}); 