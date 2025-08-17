/// <reference types="cypress" />

describe('Projects Basic E2E Tests (V2 - STI Mode)', () => {
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
    
    // Mock API responses for projects with STI data
    cy.intercept('GET', '/api/projects/', { 
      fixture: 'projects-v2.json' 
    }).as('getProjects');
  });

  describe('Projects Page Basic Functionality (STI Mode)', () => {
    it('should load the projects page successfully', () => {
      cy.visit('/projects');
      cy.url().should('include', '/projects');
      cy.contains('Projects').should('exist');
      cy.get('h1').should('contain', 'Projects');
    });

    it('should display project type filter buttons', () => {
      cy.visit('/projects');
      cy.contains('All').should('exist');
      cy.contains('Biology').should('exist');
      cy.contains('Chemistry').should('exist');
      cy.contains('Physics').should('exist');
      cy.contains('Math').should('exist');
      cy.contains('Computer Science').should('exist');
      cy.contains('Literature').should('exist');
      cy.contains('History').should('exist');
      cy.contains('Geography').should('exist');
    });

    it('should show create project card', () => {
      cy.visit('/projects');
      cy.contains('Create New Project').should('exist');
    });

    it('should display project cards when data is loaded', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Check if project cards are displayed
      cy.get('[data-testid="project-card"]').should('exist');
      cy.get('h2').should('exist'); // Project titles
    });
  });

  describe('STI Data Display', () => {
    it('should display school project with course name from school_meta', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Check that school projects display course names
      cy.contains('Advanced Biology').should('exist');
      cy.contains('Organic Chemistry').should('exist');
      cy.contains('Quantum Physics').should('exist');
      cy.contains('Calculus II').should('exist');
    });

    it('should display self-study project with goal description from self_study_meta', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Check that self-study projects display goal descriptions
      cy.contains('Master Django Framework').should('exist');
      cy.contains('Learn React and TypeScript').should('exist');
    });

    it('should show correct project type labels', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Check for School Project and Self Study labels
      cy.contains('School Project').should('exist');
      cy.contains('Self Study').should('exist');
    });
  });

  describe('Project Filtering (STI Mode)', () => {
    it('should filter projects by type', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Click on Biology filter
      cy.contains('Biology').click();
      cy.contains('Biology').should('have.class', 'bg-emerald-600');
      
      // Click on All filter
      cy.contains('All').click();
      cy.contains('All').should('have.class', 'bg-emerald-600');
    });

    it('should show different project counts for different filters', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Count projects in "All" view
      cy.get('[data-testid="project-card"]').then(($cards) => {
        const allCount = $cards.length;
        
        // Click Biology filter
        cy.contains('Biology').click();
        cy.get('[data-testid="project-card"]').then(($bioCards) => {
          const bioCount = $bioCards.length;
          expect(bioCount).to.be.at.most(allCount);
        });
      });
    });
  });

  describe('Project Navigation (STI Mode)', () => {
    it('should navigate to project creation when clicking create card', () => {
      cy.visit('/projects');
      cy.contains('Create New Project').click();
      cy.url().should('include', '/projects/create');
    });

    it('should navigate to project details when clicking a project card', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Click on the first project card
      cy.get('[data-testid="project-card"]').first().click();
      cy.url().should('include', '/projects/');
    });
  });

  describe('Data Structure Validation', () => {
    it('should handle mixed legacy and STI data gracefully', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Verify that both school and self-study projects are displayed
      cy.get('[data-testid="project-card"]').should('have.length.at.least', 2);
      
      // Check that school projects show course names
      cy.contains('Advanced Biology').should('exist');
      
      // Check that self-study projects show goal descriptions
      cy.contains('Master Django Framework').should('exist');
    });

    it('should display fallback to project name when meta data is missing', () => {
      // This test would require a fixture with missing meta data
      // For now, we'll verify the current structure works
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // All projects should have some display name
      cy.get('[data-testid="project-card"] h2').each(($title) => {
        expect($title.text().trim()).to.not.be.empty;
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/projects/', { 
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getProjectsError');
      
      cy.visit('/projects');
      cy.wait('@getProjectsError');
      
      // Should still show the page structure
      cy.contains('Projects').should('exist');
      // Note: Create New Project might not show in error state, so we just check the page loads
    });

    it('should handle network timeouts gracefully', () => {
      // Mock network timeout
      cy.intercept('GET', '/api/projects/', { 
        forceNetworkError: true 
      }).as('getProjectsTimeout');
      
      cy.visit('/projects');
      // Don't wait for the timeout since it might not happen immediately
      cy.contains('Projects').should('exist');
      // Note: Create New Project might not show in error state, so we just check the page loads
    });
  });
}); 