describe('Project Creation Navigation', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/projects/create')
  })

  it('should navigate to school project creation', () => {
    cy.get('[data-testid="school-project-card"]').click()
    cy.url().should('include', '/projects/create-school')
  })

  it('should navigate to self-study project creation', () => {
    cy.get('[data-testid="self-study-project-card"]').click()
    cy.url().should('include', '/projects/create-self-study')
  })

  it('should handle cleanup without blocking navigation', () => {
    // Add localStorage data to test cleanup
    cy.window().then((win) => {
      win.localStorage.setItem('project-setup-guided-setup', 'test-data')
    })
    
    cy.get('[data-testid="school-project-card"]').click()
    cy.url().should('include', '/projects/create-school')
    
    // Verify cleanup happened
    cy.window().then((win) => {
      expect(win.localStorage.getItem('project-setup-guided-setup')).to.be.null
    })
  })
}) 