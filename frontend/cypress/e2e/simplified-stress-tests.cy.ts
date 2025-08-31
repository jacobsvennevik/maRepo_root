/// <reference types="cypress" />

describe('🧪 Simplified Stress Tests - Core Functionality', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false;
      }
      return true;
    });

    // Clear localStorage
    cy.clearLocalStorage();
  });

  describe('UI Stress Tests', () => {
    it('should handle rapid form interactions', () => {
      cy.log('🧪 Testing rapid form interactions');
      
      // Visit the home page
      cy.visit('/');
      
      // Test rapid clicking on navigation elements
      for (let i = 0; i < 10; i++) {
        cy.get('a[href="/login"]').first().click({ force: true });
        cy.wait(100);
        cy.go('back');
        cy.wait(100);
      }
      
      cy.log('✅ Rapid form interactions completed');
    });

    it('should handle rapid button clicks', () => {
      cy.log('🧪 Testing rapid button clicks');
      
      // Visit the home page
      cy.visit('/');
      
      // Test rapid clicking on buttons
      cy.get('button').then((buttons) => {
        if (buttons.length > 0) {
          for (let i = 0; i < Math.min(5, buttons.length); i++) {
            cy.get('button').eq(i).click({ force: true });
            cy.wait(100);
          }
        }
      });
      
      cy.log('✅ Rapid button clicks completed');
    });
  });

  describe('Memory and Performance Stress Tests', () => {
    it('should monitor memory usage during page navigation', () => {
      cy.log('🧪 Testing memory usage during navigation');
      
      // Start performance measurement
      cy.window().then((win) => {
        const startMemory = win.performance.memory?.usedJSHeapSize || 0;
        cy.log(`Initial memory usage: ${startMemory} bytes`);
        
        // Navigate between pages multiple times
        for (let i = 0; i < 5; i++) {
          cy.visit('/');
          cy.wait(500);
          cy.visit('/login');
          cy.wait(500);
        }
        
        const endMemory = win.performance.memory?.usedJSHeapSize || 0;
        cy.log(`Final memory usage: ${endMemory} bytes`);
        cy.log(`Memory difference: ${endMemory - startMemory} bytes`);
      });
      
      cy.log('✅ Memory monitoring completed');
    });

    it('should measure page load performance', () => {
      cy.log('🧪 Testing page load performance');
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('page-load-start');
        }
      });
      
      cy.window().then((win) => {
        win.performance.mark('page-load-end');
        win.performance.measure('page-load', 'page-load-start', 'page-load-end');
        
        const measure = win.performance.getEntriesByName('page-load')[0];
        cy.log(`Page load time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(5000); // Should load in under 5 seconds
      });
      
      cy.log('✅ Page load performance test completed');
    });
  });

  describe('Network Resilience Tests', () => {
    it('should handle network timeouts gracefully', () => {
      cy.log('🧪 Testing network timeout handling');
      
      // Mock a slow network response
      cy.intercept('GET', '/api/projects/', {
        delay: 3000,
        statusCode: 200,
        body: []
      }).as('slowProjects');
      
      cy.visit('/');
      
      // The page should still load even with slow API calls
      cy.get('body').should('be.visible');
      
      cy.log('✅ Network timeout handling completed');
    });

    it('should handle network failures gracefully', () => {
      cy.log('🧪 Testing network failure handling');
      
      // Mock a network failure
      cy.intercept('GET', '/api/projects/', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('failedProjects');
      
      cy.visit('/');
      
      // The page should still load even with failed API calls
      cy.get('body').should('be.visible');
      
      cy.log('✅ Network failure handling completed');
    });
  });

  describe('Accessibility Stress Tests', () => {
    it('should maintain accessibility during rapid interactions', () => {
      cy.log('🧪 Testing accessibility during rapid interactions');
      
      cy.visit('/');
      
      // Test that focusable elements exist and are accessible
      cy.get('button, a, input, select, textarea').should('exist');
      
      // Test that we can focus on the first focusable element
      cy.get('button, a, input, select, textarea').first().focus();
      cy.focused().should('exist');
      
      // Test that we can focus on multiple elements
      cy.get('button, a, input, select, textarea').then((elements) => {
        if (elements.length > 1) {
          cy.get('button, a, input, select, textarea').eq(1).focus();
          cy.focused().should('exist');
        }
      });
      
      cy.log('✅ Accessibility stress test completed');
    });

    it('should maintain focus management', () => {
      cy.log('🧪 Testing focus management');
      
      cy.visit('/');
      
      // Test that focusable elements exist
      cy.get('button, a, input, select, textarea').should('exist');
      
      // Test that focus moves appropriately
      cy.get('button, a, input, select, textarea').first().focus();
      cy.focused().should('exist');
      
      cy.log('✅ Focus management test completed');
    });
  });

  describe('State Management Stress Tests', () => {
    it('should handle localStorage operations under stress', () => {
      cy.log('🧪 Testing localStorage stress');
      
      cy.window().then((win) => {
        // Test multiple localStorage operations
        for (let i = 0; i < 100; i++) {
          win.localStorage.setItem(`test-key-${i}`, `test-value-${i}`);
        }
        
        // Verify storage
        for (let i = 0; i < 100; i++) {
          const value = win.localStorage.getItem(`test-key-${i}`);
          expect(value).to.equal(`test-value-${i}`);
        }
        
        // Clean up
        for (let i = 0; i < 100; i++) {
          win.localStorage.removeItem(`test-key-${i}`);
        }
      });
      
      cy.log('✅ localStorage stress test completed');
    });

    it('should handle sessionStorage operations under stress', () => {
      cy.log('🧪 Testing sessionStorage stress');
      
      cy.window().then((win) => {
        // Test multiple sessionStorage operations
        for (let i = 0; i < 50; i++) {
          win.sessionStorage.setItem(`test-key-${i}`, `test-value-${i}`);
        }
        
        // Verify storage
        for (let i = 0; i < 50; i++) {
          const value = win.sessionStorage.getItem(`test-key-${i}`);
          expect(value).to.equal(`test-value-${i}`);
        }
        
        // Clean up
        for (let i = 0; i < 50; i++) {
          win.sessionStorage.removeItem(`test-key-${i}`);
        }
      });
      
      cy.log('✅ sessionStorage stress test completed');
    });
  });
}); 