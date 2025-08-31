/// <reference types="cypress" />

describe('@skip-button Skip Button Integration Tests', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false;
      }
      return true;
    });

    cy.login();
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.visit('/projects/create');
    cy.contains('Create School Project').click({ force: true });
    cy.wait(2000);
    cy.url().should('include', '/projects/create-school');
    cy.contains('Start Guided Setup').click();
  });

  describe('Skip Button Visibility and Behavior', () => {
    it('should show skip button only on skippable steps', () => {
      // Step 1: Project Name (not skippable)
      cy.contains("Project Name *").should('exist');
      cy.get('[data-testid="skip-button"]').should('not.exist');
      cy.fillProjectName('Test Project');
      cy.goToNextStep();

      // Step 2: Purpose (not skippable)
      cy.contains("Purpose").should('exist');
      cy.get('[data-testid="skip-button"]').should('not.exist');
      cy.selectPurpose('good-grades');
      cy.goToNextStep();

      // Step 3: Education Level (not skippable)
      cy.contains('Education Level').should('exist');
      cy.get('[data-testid="skip-button"]').should('not.exist');
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Step 4: Syllabus Upload (skippable)
      cy.contains('Upload your syllabus').should('exist');
      cy.get('[data-testid="skip-button"]').should('be.visible');
      cy.get('[data-testid="skip-button"]').should('contain.text', "Skip");
    });

    it('should have correct skip button text for each skippable step', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Check syllabus upload skip text
      cy.get('[data-testid="skip-button"]').should('contain.text', "Skip");

      // Skip to course content upload
      cy.get('[data-testid="skip-button"]').click();
      cy.wait(1000);

      // Check course content upload skip text
      cy.contains('Upload Course Materials').should('exist');
      cy.get('[data-testid="skip-button"]').should('contain.text', "Skip");

      // Skip to test upload
      cy.get('[data-testid="skip-button"]').click();
      cy.wait(1000);

      // Check test upload skip text
      cy.contains('Upload Tests').should('exist');
      cy.get('[data-testid="skip-button"]').should('contain.text', "Skip");
    });

    it('should always be enabled for skippable steps', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Skip button should always be enabled for skippable steps
      cy.get('[data-testid="skip-button"]').should('not.be.disabled');
    });

    it('should navigate correctly when skip button is clicked', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Click skip button
      cy.get('[data-testid="skip-button"]').click();
      cy.wait(1000);

      // Should navigate to next step (course content upload)
      cy.contains('Upload Course Materials').should('exist');
      cy.get('[data-testid="step-title"]').should('contain', 'Upload Course Materials');

      // Skip again to test upload
      cy.get('[data-testid="skip-button"]').click();
      cy.wait(1000);

      // Should navigate to test upload step
      cy.contains('Upload Tests').should('exist');
      cy.get('[data-testid="step-title"]').should('contain', 'Upload Tests');
    });

    it('should maintain skip button state during navigation', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Verify skip button is visible
      cy.get('[data-testid="skip-button"]').should('be.visible');

      // Go back to previous step
      cy.get('button').contains('Previous').click();
      cy.wait(1000);

      // Skip button should not be visible on non-skippable step
      cy.get('[data-testid="skip-button"]').should('not.exist');

      // Go forward again
      cy.get('button').contains('Next').click();
      cy.wait(1000);

      // Skip button should be visible again
      cy.get('[data-testid="skip-button"]').should('be.visible');
    });
  });

  describe('Skip Button Styling', () => {
    it('should have red styling for skip button', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Check that skip button has red styling
      cy.get('[data-testid="skip-button"]')
        .should('have.class', 'text-red-600')
        .and('have.class', 'border-red-200');
    });

    it('should have proper hover effects', () => {
      // Navigate to syllabus upload step
      cy.fillProjectName('Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Hover over skip button and check for hover classes
      cy.get('[data-testid="skip-button"]')
        .trigger('mouseover')
        .should('have.class', 'hover:bg-red-50')
        .and('have.class', 'hover:border-red-300');
    });
  });
}); 