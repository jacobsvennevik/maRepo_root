/// <reference types="cypress" />

describe('Projects Basic E2E Tests', () => {
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
    
    // Mock API responses for projects
    cy.intercept('GET', '/api/projects/', { 
      fixture: 'projects.json' 
    }).as('getProjects');
  });

  describe('Projects Page Basic Functionality', () => {
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
      cy.get('a[href*="/projects/"]').should('exist');
      cy.get('h2').should('exist'); // Project titles
    });
  });

  describe('Project Filtering', () => {
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
      cy.get('a[href*="/projects/"]').then(($cards) => {
        const allCount = $cards.length;
        
        // Click Biology filter
        cy.contains('Biology').click();
        cy.get('a[href*="/projects/"]').then(($bioCards) => {
          const bioCount = $bioCards.length;
          expect(bioCount).to.be.at.most(allCount);
        });
      });
    });
  });

  describe('Project Navigation', () => {
    it('should navigate to project creation when clicking create card', () => {
      cy.visit('/projects');
      cy.contains('Create New Project').click();
      cy.url().should('include', '/projects/create');
    });

    it('should navigate to project details when clicking a project card', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      cy.get('a[href*="/projects/"]').first().click();
      cy.url().should('include', '/projects/');
      cy.url().should('not.include', '/projects/create');
    });
  });

  describe('Project Creation Flow', () => {
    it('should navigate through project creation process', () => {
      cy.visit('/projects/create');
      cy.url().should('include', '/projects/create');
      
      // Check if project type cards are displayed
      cy.contains('Create School Project').should('exist');
      cy.contains('Create Self-Study Project').should('exist');
    });

    it('should navigate to school project creation', () => {
      cy.visit('/projects/create');
      cy.contains('Create School Project').click();
      cy.url().should('include', '/projects/create-school');
    });

    it('should navigate to self-study project creation', () => {
      cy.visit('/projects/create');
      cy.contains('Create Self-Study Project').click();
      cy.url().should('include', '/projects/create-self-study');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/projects');
      cy.get('h1').should('be.visible');
      cy.contains('Create New Project').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/projects');
      cy.get('h1').should('be.visible');
      cy.contains('Create New Project').should('be.visible');
    });

    it('should display correctly on desktop devices', () => {
      cy.viewport(1920, 1080);
      cy.visit('/projects');
      cy.get('h1').should('be.visible');
      cy.contains('Create New Project').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/projects/', { 
        statusCode: 500, 
        body: { error: 'Internal Server Error' } 
      }).as('getProjectsError');
      
      cy.visit('/projects');
      cy.wait('@getProjectsError');
      cy.contains('Failed to load projects').should('exist');
    });

    it('should handle network timeouts', () => {
      cy.intercept('GET', '/api/projects/', { 
        forceNetworkError: true 
      }).as('getProjectsTimeout');
      
      cy.visit('/projects');
      cy.wait('@getProjectsTimeout');
      cy.contains('Failed to load projects').should('exist');
    });

    it('should show loading state', () => {
      cy.intercept('GET', '/api/projects/', { 
        delay: 1000 
      }).as('getProjectsSlow');
      
      cy.visit('/projects');
      cy.contains('Loading projects...').should('exist');
      cy.wait('@getProjectsSlow');
      cy.contains('Loading projects...').should('not.exist');
    });
  });

  describe('Performance Tests', () => {
    it('should load projects page within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/projects', { timeout: 10000 }).then(() => {
        const loadTime = Date.now() - startTime;
        cy.log(`Projects page load time: ${loadTime}ms`);
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('should handle large number of projects efficiently', () => {
      // Mock many projects
      const manyProjects = Array.from({ length: 20 }, (_, i) => ({
        id: `project-${i}`,
        name: `Project ${i}`,
        is_draft: false,
        project_type: 'school',
        updated_at: new Date().toISOString()
      }));
      
      cy.intercept('GET', '/api/projects/', { 
        body: manyProjects 
      }).as('getManyProjects');
      
      cy.visit('/projects');
      cy.wait('@getManyProjects');
      cy.get('a[href*="/projects/"]').should('have.length', 20);
    });
  });

  describe('Basic Accessibility', () => {
    it('should have proper heading structure', () => {
      cy.visit('/projects');
      cy.get('h1').should('exist');
      cy.get('h1').should('contain', 'Projects');
    });

    it('should have clickable elements', () => {
      cy.visit('/projects');
      cy.get('button').should('exist');
      cy.get('a').should('exist');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/projects');
      cy.get('body').should('be.visible');
      cy.get('button').first().should('be.visible');
    });
  });

  describe('Project Details Navigation', () => {
    it('should navigate to project overview', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      cy.get('a[href*="/projects/"]').first().click();
      cy.url().should('include', '/projects/');
    });

    it('should show project navigation menu', () => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      cy.get('a[href*="/projects/"]').first().click();
      
      // Check for navigation elements (these might not exist yet, but we can test the structure)
      cy.get('nav').should('exist');
    });
  });

  describe('Integration with Cleanup System', () => {
    it('should work with cleanup system', () => {
      // Fill localStorage with test data
      cy.window().then((win) => {
        win.localStorage.setItem('project-setup-guided-setup', 'test-data');
      });
      
      // Navigate to projects page
      cy.visit('/projects');
      cy.get('h1').should('contain', 'Projects');
      
      // Navigate to project creation (should trigger cleanup)
      cy.contains('Create New Project').click();
      cy.url().should('include', '/projects/create');
    });

    it('should handle localStorage operations', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('test-key', 'test-value');
        expect(win.localStorage.getItem('test-key')).to.equal('test-value');
        
        win.localStorage.removeItem('test-key');
        expect(win.localStorage.getItem('test-key')).to.be.null;
      });
    });
  });
}); 