/// <reference types="cypress" />

describe('@wizard School Project Wizard - Core Flow (Steps 1-6)', () => {
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

    // Go directly to create page (we know this works from simple wizard test)
    cy.visit('/projects/create');
    cy.contains('Create New Project').should('exist');
    cy.contains('Create School Project').should('be.visible');
    cy.contains('Create School Project').should('not.be.disabled');
    cy.contains('Create School Project').click({ force: true });
    cy.wait(2000);

    // Check if navigation worked, if not try direct navigation
    cy.url().then((url) => {
      if (!url.includes('/projects/create-school')) {
        cy.log('Click failed, trying direct navigation');
        cy.visit('/projects/create-school');
      }
    });

    cy.url().should('include', '/projects/create-school');
    cy.contains('Start Guided Setup').click();
  });

  describe('Complete Wizard Flow', () => {
    it('should skip extraction results step when no syllabus is uploaded', () => {
      // Step 1: Project Name
      cy.contains("Project Name *").should('exist');
      cy.fillProjectName('Advanced Mathematics Project');
      cy.wait(1000); // Wait for state update
      cy.goToNextStep();

      // Step 2: Purpose Selection
      cy.contains("Purpose").should('exist');
      cy.selectPurpose('good-grades');
      cy.goToNextStep();

      // Step 3: Education Level
      cy.contains('Education Level').should('exist');
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Step 4: Syllabus Upload (skip this step)
      cy.contains('Upload your syllabus').should('exist');
      cy.get('[data-testid="skip-button"]').should('be.visible');
      cy.get('[data-testid="skip-button"]').click();
      cy.wait(2000); // Wait to see what happens after skip
      cy.screenshot('after-skip-click');

      // Step 5: Should go directly to Course Content Upload (extraction results skipped)
      cy.contains('Upload Course Materials').should('exist');
      
      // Verify that we did NOT see the extraction results step content
      cy.get('body').should('not.contain', 'Review extracted information');
      
      // Check that the current step title is not "Review Analysis"
      cy.get('[data-testid="step-title"]').should('not.contain', 'Review Analysis');
    });
  });

  describe('Step 1: Project Name', () => {
    it('should allow entering project name', () => {
      cy.contains("Project Name *").should('exist');
      cy.fillProjectName('Advanced Mathematics Project');
      cy.wait(1000); // Wait for state update
      cy.goToNextStep();
    });

    it('should validate required project name', () => {
      // Instead of clicking, check that the Next button is disabled
      cy.get('button').contains('Next').should('be.disabled');
    });
  });
}); 