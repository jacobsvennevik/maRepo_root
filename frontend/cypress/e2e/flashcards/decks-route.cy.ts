describe('Deck Carousel Route', () => {
  it('navigates from decks grid to project deck page and renders header', () => {
    cy.visit('/projects/test/flashcards');
    // Click first Study button which links to /projects/[projectId]/flashcards/[setId]
    cy.get('a').contains('Study').first().click();
    cy.location('pathname').should('match', /\/projects\/.+\/flashcards\/.+/);
    cy.get('h1').should('exist');
  });
});


