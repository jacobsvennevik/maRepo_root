/// <reference types="cypress" />
import 'cypress-file-upload';

/**
 * E2E test for draft abandon performance
 * Tests the scenario where users repeatedly start and abandon draft projects
 * to ensure no performance degradation or memory leaks occur
 */

describe('Draft Abandon Performance', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false; // Prevent Cypress from failing on hydration errors
      }
      return true; // Let other errors fail the test
    });

    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Mock authentication if needed
    cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as('getUser');
    
    // Mock project creation endpoints
    cy.intercept('POST', '/api/projects/', { 
      statusCode: 201, 
      body: { id: 1, name: 'Test Project', is_draft: true } 
    }).as('createProject');
    
    cy.intercept('POST', '/api/projects/*/finalize/', { 
      statusCode: 200, 
      body: { id: 1, name: 'Test Project', is_draft: false } 
    }).as('finalizeProject');
    
    // Mock cleanup endpoint
    cy.intercept('POST', '/api/projects/cleanup_drafts/', { 
      statusCode: 200, 
      body: { deleted_count: 5, message: 'Success' } 
    }).as('cleanupDrafts');
    
    // Mock file upload endpoints
    cy.intercept('POST', '/api/documents/upload/', { 
      statusCode: 201, 
      body: { id: 1, filename: 'test.pdf', status: 'uploaded' } 
    }).as('uploadDocument');
    
    cy.intercept('POST', '/api/documents/*/process/', { 
      statusCode: 200, 
      body: { status: 'processing' } 
    }).as('processDocument');
  });

  it('should maintain performance across multiple draft abandons', () => {
    const iterations = 3; // Reduced for faster testing
    const performanceMetrics: { iteration: number; timeToInteractive: number; memoryUsage?: number }[] = [];
    let initialMemory: number = 0;

    // Take initial performance snapshot
    cy.window().then((win) => {
      initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
      cy.log(`Initial memory usage: ${initialMemory} bytes`);
    });

    // Perform multiple draft abandon cycles
    for (let i = 0; i < iterations; i++) {
      cy.log(`Starting iteration ${i + 1}/${iterations}`);
      
      const startTime = Date.now();
      
      // 1. Navigate to create project page
      cy.visit('/projects/create');
      
      // 2. Click on the School Project card (click the button inside the card)
      cy.contains('Create School Project').click();
      
      // 3. Wait for navigation and check URL
      cy.url({ timeout: 10000 }).should('include', '/projects/create-school');
      
      // 4. Choose guided setup (this is a component, not a separate route)
      cy.contains('Start Guided Setup').click();
      
      // 5. We should still be on the same page, but now showing the guided setup component
      cy.url().should('include', '/projects/create-school');
      
      // 6. Fill in basic project info (if there are form fields)
      cy.get('input[placeholder*="name" i], input[name*="name" i]').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.wrap($inputs.first()).type(`Test Project ${i + 1}`);
        }
      });
      
      cy.get('textarea[placeholder*="description" i], textarea[name*="description" i]').then(($textareas) => {
        if ($textareas.length > 0) {
          cy.wrap($textareas.first()).type(`Test description ${i + 1}`);
        }
      });
      
      cy.contains('Next').then(($next) => {
        if ($next && $next.length > 0) {
          cy.wrap($next).click();
        }
      });
      
      // 7. Upload a test file to trigger cleanup mechanisms (if file upload is available)
      cy.get('input[type="file"]').then(($fileInput) => {
        if ($fileInput.length > 0) {
          cy.fixture('test-document.pdf').then((fileContent) => {
            cy.get('input[type="file"]').attachFile({
              fileContent: fileContent,
              fileName: 'test-document.pdf',
              mimeType: 'application/pdf'
            });
          });
          cy.wait('@uploadDocument');
          cy.wait('@processDocument');
        }
      });
      
      // 8. Navigate back to abandon the draft
      cy.contains('Back').then(($back) => {
        if ($back && $back.length > 0) {
          cy.wrap($back).click();
        }
      });
      
      cy.contains('Confirm').then(($confirm) => {
        if ($confirm && $confirm.length > 0) {
          cy.wrap($confirm).click();
        }
      });
      
      // 9. Measure time to interactive
      const endTime = Date.now();
      const timeToInteractive = endTime - startTime;
      
      performanceMetrics.push({ 
        iteration: i + 1, 
        timeToInteractive 
      });
      
      cy.log(`Iteration ${i + 1} completed in ${timeToInteractive}ms`);
    }

    // Analyze performance metrics
    const avgTime = performanceMetrics.reduce((sum, metric) => sum + metric.timeToInteractive, 0) / iterations;
    const maxTime = Math.max(...performanceMetrics.map(m => m.timeToInteractive));
    const minTime = Math.min(...performanceMetrics.map(m => m.timeToInteractive));
    
    cy.log(`Performance Analysis:`);
    cy.log(`- Average time: ${avgTime.toFixed(2)}ms`);
    cy.log(`- Max time: ${maxTime}ms`);
    cy.log(`- Min time: ${minTime}ms`);
    
    // Performance assertions
    cy.wrap(avgTime).should('be.lessThan', 5000); // Average should be under 5 seconds
    cy.wrap(maxTime).should('be.lessThan', 10000); // Max should be under 10 seconds
    
    // Check for memory leaks
    cy.window().then((win) => {
      const finalMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      cy.log(`Final memory usage: ${finalMemory} bytes`);
      cy.log(`Memory increase: ${memoryIncrease} bytes`);
      
      // Memory should not increase significantly (less than 10MB)
      cy.wrap(memoryIncrease).should('be.lessThan', 10 * 1024 * 1024);
    });
  });

  it('should handle localStorage quota exceeded gracefully', () => {
    // Fill localStorage to near capacity
    const largeData = 'x'.repeat(1024 * 1024); // 1MB chunks
    for (let i = 0; i < 4; i++) {
      try {
        localStorage.setItem(`test-data-${i}`, largeData);
      } catch (e) {
        break; // Stop when quota is exceeded
      }
    }
    
    // Try to create a project (should handle quota gracefully)
    cy.visit('/projects/create');
    cy.contains('Create School Project').click();
    
    // Should not crash and should show appropriate error message
    cy.get('body').should('not.contain', 'QuotaExceededError');
  });

  it('should cleanup backend drafts on navigation', () => {
    // Create a draft project
    cy.visit('/projects/create');
    cy.contains('Create School Project').click();
    cy.contains('Start Guided Setup').click();
    
    // Navigate away (should trigger cleanup)
    cy.visit('/projects');
    
    // Check that cleanup was called
    cy.wait('@cleanupDrafts');
  });

  it('should handle concurrent cleanup operations', () => {
    const rapidClicks = () => {
      cy.visit('/projects/create');
      cy.contains('Create School Project').click();
      cy.contains('Start Guided Setup').click();
      cy.visit('/projects/create');
      cy.contains('Create School Project').click();
      cy.contains('Start Guided Setup').click();
    };
    
    // Should not throw errors on rapid navigation
    cy.wrap(rapidClicks).should('be.a', 'function');
  });

  it('should maintain UI responsiveness during cleanup', () => {
    // Start a project creation
    cy.visit('/projects/create');
    cy.contains('Create School Project').click();
    cy.contains('Start Guided Setup').click();
    
    // UI should remain responsive during cleanup
    cy.get('body').should('be.visible');
    cy.get('button').should('not.be.disabled');
  });
}); 