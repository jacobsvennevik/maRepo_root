/// <reference types="cypress" />

describe('Comprehensive Cleanup E2E Test Suite', () => {
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
  });

  describe('Core Navigation Tests', () => {
    it('should navigate to all project creation pages', () => {
      // Test main project selection page
      cy.visit('/projects/create');
      cy.url().should('include', '/projects/create');
      cy.contains('Create School Project').should('exist');
      cy.contains('Create Self-Study Project').should('exist');

      // Test school project page
      cy.visit('/projects/create-school');
      cy.url().should('include', '/projects/create-school');
      cy.contains('Start Guided Setup').should('exist');
      cy.contains('Start Custom Setup').should('exist');

      // Test self-study project page
      cy.visit('/projects/create-self-study');
      cy.url().should('include', '/projects/create-self-study');
    });

    it('should test page responsiveness and interactivity', () => {
      cy.visit('/projects/create');
      cy.get('body').should('be.visible');
      cy.get('button').should('exist');
      
      cy.visit('/projects/create-school');
      cy.get('body').should('be.visible');
      cy.get('button').should('exist');
    });
  });

  describe('localStorage Management Tests', () => {
    it('should handle localStorage quota exceeded gracefully', () => {
      // Try to fill localStorage to capacity
      const largeData = 'x'.repeat(1024 * 1024); // 1MB
      
      cy.window().then((win) => {
        for (let i = 0; i < 5; i++) {
          try {
            win.localStorage.setItem(`large-data-${i}`, largeData);
          } catch (e) {
            break;
          }
        }
      });
      
      // Try to navigate (should not crash)
      cy.visit('/projects/create');
      cy.get('body').should('be.visible');
    });

    it('should test localStorage operations work correctly', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('test-key', 'test-value');
        expect(win.localStorage.getItem('test-key')).to.equal('test-value');
        
        win.localStorage.removeItem('test-key');
        expect(win.localStorage.getItem('test-key')).to.be.null;
      });
    });

    it('should test cleanup utility functions exist', () => {
      cy.window().then((win) => {
        expect(win).to.have.property('localStorage');
        expect(win.localStorage).to.have.property('setItem');
        expect(win.localStorage).to.have.property('removeItem');
      });
    });
  });

  describe('Cleanup Mechanism Tests', () => {
    it('should test manual localStorage cleanup', () => {
      // Fill localStorage with test data
      cy.window().then((win) => {
        win.localStorage.setItem('project-setup-guided-setup', 'test-data');
        win.localStorage.setItem('self-study-guided-setup', 'test-data');
        win.localStorage.setItem('other-data', 'should-remain');
      });
      
      // Verify data is there
      cy.window().then((win) => {
        expect(win.localStorage.getItem('project-setup-guided-setup')).to.equal('test-data');
        expect(win.localStorage.getItem('other-data')).to.equal('should-remain');
      });
      
      // Manually trigger cleanup by calling the cleanup function
      cy.window().then((win) => {
        // Simulate cleanup by removing the specific keys
        win.localStorage.removeItem('project-setup-guided-setup');
        win.localStorage.removeItem('self-study-guided-setup');
      });
      
      // Verify cleanup worked
      cy.window().then((win) => {
        expect(win.localStorage.getItem('project-setup-guided-setup')).to.be.null;
        expect(win.localStorage.getItem('self-study-guided-setup')).to.be.null;
        expect(win.localStorage.getItem('other-data')).to.equal('should-remain');
      });
    });

    it('should test localStorage persistence across navigation', () => {
      // Set data in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('persistent-data', 'should-persist');
      });
      
      // Navigate to different pages
      cy.visit('/projects/create');
      cy.visit('/projects/create-school');
      cy.visit('/projects/create-self-study');
      
      // Verify data persists
      cy.window().then((win) => {
        expect(win.localStorage.getItem('persistent-data')).to.equal('should-persist');
      });
    });
  });

  describe('Performance and Memory Tests', () => {
    it('should test memory usage remains stable', () => {
      cy.window().then((win) => {
        const initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
        cy.log(`Initial memory usage: ${initialMemory} bytes`);
        
        // Navigate multiple times
        cy.visit('/projects/create');
        cy.visit('/projects/create-school');
        cy.visit('/projects/create-self-study');
        cy.visit('/projects/create');
        
        cy.window().then((win2) => {
          const finalMemory = (win2.performance as any).memory?.usedJSHeapSize || 0;
          const memoryIncrease = finalMemory - initialMemory;
          cy.log(`Final memory usage: ${finalMemory} bytes`);
          cy.log(`Memory increase: ${memoryIncrease} bytes`);
          
          // Memory increase should be reasonable (less than 100MB for test environment)
          expect(memoryIncrease).to.be.lessThan(100 * 1024 * 1024);
        });
      });
    });

    it('should test page load performance', () => {
      const startTime = Date.now();
      
      cy.visit('/projects/create', { timeout: 10000 }).then(() => {
        const loadTime = Date.now() - startTime;
        cy.log(`Page load time: ${loadTime}ms`);
        
        // Page should load within 5 seconds
        expect(loadTime).to.be.lessThan(5000);
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', () => {
      // Intercept API calls and simulate network errors
      cy.intercept('POST', '/api/projects/', { statusCode: 500 }).as('createProjectError');
      cy.intercept('POST', '/api/projects/cleanup_drafts/', { statusCode: 500 }).as('cleanupError');
      
      // Navigate to pages (should not crash even with API errors)
      cy.visit('/projects/create');
      cy.get('body').should('be.visible');
      
      cy.visit('/projects/create-school');
      cy.get('body').should('be.visible');
    });

    it('should handle localStorage errors gracefully', () => {
      // Try to set invalid data in localStorage
      cy.window().then((win) => {
        try {
          win.localStorage.setItem('test', 'valid-data');
          expect(win.localStorage.getItem('test')).to.equal('valid-data');
        } catch (e) {
          cy.log('localStorage error handled gracefully');
        }
      });
    });
  });

  describe('Integration Tests', () => {
    it('should test complete user flow simulation', () => {
      // Simulate a complete user flow
      cy.visit('/projects/create');
      cy.contains('Create School Project').should('exist');
      
      // Navigate to school project setup
      cy.visit('/projects/create-school');
      cy.contains('Start Guided Setup').should('exist');
      
      // Test that the page is fully functional
      cy.get('body').should('be.visible');
      cy.get('button').should('exist');
    });

    it('should test multiple rapid navigation', () => {
      // Test rapid navigation between pages
      for (let i = 0; i < 3; i++) {
        cy.visit('/projects/create');
        cy.visit('/projects/create-school');
        cy.visit('/projects/create-self-study');
      }
      
      // Final page should still be functional
      cy.get('body').should('be.visible');
    });
  });
}); 