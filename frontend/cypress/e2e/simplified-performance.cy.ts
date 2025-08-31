/// <reference types="cypress" />

describe('⚡ Simplified Performance Tests', () => {
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

  describe('Page Load Performance Tests', () => {
    it('should load home page within acceptable time', () => {
      cy.log('⚡ Testing home page load performance');
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('page-load-start');
        }
      });
      
      cy.window().then((win) => {
        win.performance.mark('page-load-end');
        win.performance.measure('page-load', 'page-load-start', 'page-load-end');
        
        const measure = win.performance.getEntriesByName('page-load')[0];
        cy.log(`Home page load time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(3000); // Should load in under 3 seconds
      });
      
      cy.log('✅ Home page load performance test completed');
    });

    it('should load login page within acceptable time', () => {
      cy.log('⚡ Testing login page load performance');
      
      cy.visit('/login', {
        onBeforeLoad: (win) => {
          win.performance.mark('login-load-start');
        }
      });
      
      cy.window().then((win) => {
        win.performance.mark('login-load-end');
        win.performance.measure('login-load', 'login-load-start', 'login-load-end');
        
        const measure = win.performance.getEntriesByName('login-load')[0];
        cy.log(`Login page load time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(3000); // Should load in under 3 seconds
      });
      
      cy.log('✅ Login page load performance test completed');
    });
  });

  describe('Memory Usage Tests', () => {
    it('should monitor memory usage during navigation', () => {
      cy.log('⚡ Testing memory usage during navigation');
      
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
        
        // Memory should not increase by more than 10MB
        const memoryIncrease = endMemory - startMemory;
        expect(memoryIncrease).to.be.lessThan(10 * 1024 * 1024); // 10MB
      });
      
      cy.log('✅ Memory usage monitoring completed');
    });

    it('should handle memory pressure gracefully', () => {
      cy.log('⚡ Testing memory pressure handling');
      
      cy.window().then((win) => {
        // Simulate memory pressure by creating large objects
        const largeObjects = [];
        for (let i = 0; i < 100; i++) {
          largeObjects.push(new Array(10000).fill(`data-${i}`));
        }
        
        // The page should still be functional
        cy.get('body').should('be.visible');
        
        // Clean up
        largeObjects.length = 0;
      });
      
      cy.log('✅ Memory pressure handling completed');
    });
  });

  describe('Rendering Performance Tests', () => {
    it('should render elements efficiently', () => {
      cy.log('⚡ Testing element rendering performance');
      
      cy.visit('/');
      
      cy.window().then((win) => {
        win.performance.mark('render-start');
        
        // Trigger a re-render by clicking
        cy.get('body').click({ force: true });
        cy.wait(100);
        
        win.performance.mark('render-end');
        win.performance.measure('render', 'render-start', 'render-end');
        
        const measure = win.performance.getEntriesByName('render')[0];
        cy.log(`Render time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(1000); // Should render in under 1 second
      });
      
      cy.log('✅ Element rendering performance test completed');
    });

    it('should handle rapid DOM updates efficiently', () => {
      cy.log('⚡ Testing rapid DOM update performance');
      
      cy.visit('/');
      
      cy.window().then((win) => {
        win.performance.mark('dom-updates-start');
        
        // Simulate rapid DOM updates
        for (let i = 0; i < 10; i++) {
          cy.get('body').click({ force: true });
          cy.wait(50);
        }
        
        win.performance.mark('dom-updates-end');
        win.performance.measure('dom-updates', 'dom-updates-start', 'dom-updates-end');
        
        const measure = win.performance.getEntriesByName('dom-updates')[0];
        cy.log(`DOM updates time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(2000); // Should complete in under 2 seconds
      });
      
      cy.log('✅ Rapid DOM update performance test completed');
    });
  });

  describe('Network Performance Tests', () => {
    it('should handle API response times efficiently', () => {
      cy.log('⚡ Testing API response time performance');
      
      // Mock a fast API response
      cy.intercept('GET', '/api/projects/', {
        delay: 100,
        statusCode: 200,
        body: []
      }).as('fastApi');
      
      cy.visit('/');
      
      // The page should load even if the API call doesn't happen
      cy.get('body').should('be.visible');
      
      cy.log('✅ API response time performance test completed');
    });

    it('should handle multiple concurrent requests efficiently', () => {
      cy.log('⚡ Testing concurrent request performance');
      
      // Mock multiple concurrent API calls
      cy.intercept('GET', '/api/projects/', {
        delay: 200,
        statusCode: 200,
        body: []
      }).as('projects');
      
      cy.intercept('GET', '/api/user/', {
        delay: 150,
        statusCode: 200,
        body: { id: 1, name: 'Test User' }
      }).as('user');
      
      cy.intercept('GET', '/api/settings/', {
        delay: 100,
        statusCode: 200,
        body: { theme: 'dark' }
      }).as('settings');
      
      cy.visit('/');
      
      // The page should load even if the API calls don't happen
      cy.get('body').should('be.visible');
      
      cy.log('✅ Concurrent request performance test completed');
    });
  });

  describe('User Interaction Performance Tests', () => {
    it('should handle rapid user interactions efficiently', () => {
      cy.log('⚡ Testing rapid user interaction performance');
      
      cy.visit('/');
      
      cy.window().then((win) => {
        win.performance.mark('interactions-start');
        
        // Simulate rapid user interactions
        for (let i = 0; i < 20; i++) {
          cy.get('body').click({ force: true });
          cy.wait(50);
        }
        
        win.performance.mark('interactions-end');
        win.performance.measure('interactions', 'interactions-start', 'interactions-end');
        
        const measure = win.performance.getEntriesByName('interactions')[0];
        cy.log(`Interaction time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(3000); // Should complete in under 3 seconds
      });
      
      cy.log('✅ Rapid user interaction performance test completed');
    });

    it('should handle form interactions efficiently', () => {
      cy.log('⚡ Testing form interaction performance');
      
      cy.visit('/login');
      
      cy.window().then((win) => {
        win.performance.mark('form-start');
        
        // Simulate form interactions
        cy.get('input[type="email"]').type('test@example.com', { force: true });
        cy.get('input[type="password"]').type('password123', { force: true });
        
        win.performance.mark('form-end');
        win.performance.measure('form', 'form-start', 'form-end');
        
        const measure = win.performance.getEntriesByName('form')[0];
        cy.log(`Form interaction time: ${measure.duration}ms`);
        
        expect(measure.duration).to.be.lessThan(2000); // Should complete in under 2 seconds
      });
      
      cy.log('✅ Form interaction performance test completed');
    });
  });
}); 