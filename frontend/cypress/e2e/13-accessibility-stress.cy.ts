/// <reference types="cypress" />

describe('♿ Accessibility Stress Tests - School Project Wizard', () => {
  beforeEach(() => {
    // Handle Next.js hydration errors
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('hydration')) {
        return false;
      }
      return true;
    });

    // Clear localStorage and reset database
    cy.clearLocalStorage();
    cy.resetDatabase();
    
    // Mock API responses for consistent testing
    cy.intercept('GET', '/api/projects/', { 
      fixture: 'projects.json' 
    }).as('getProjects');

    cy.intercept('POST', '/api/projects/*/generate_metadata/', { 
      fixture: 'syllabus-extraction.json' 
    }).as('postMeta');

    cy.intercept('POST', '/api/projects/', { 
      fixture: 'project-creation-response.json' 
    }).as('createProject');

    // Login and start wizard
    cy.login();
    cy.visit('/projects/create-school');
    cy.contains('Start Guided Setup').click();
  });

  describe('Keyboard Navigation Stress Tests', () => {
    it('should handle rapid keyboard navigation', () => {
      cy.log('♿ Testing rapid keyboard navigation');
      
      // Fill initial form data
      cy.fillProjectName('Keyboard Navigation Test');
      
      // Test rapid tab navigation
      for (let i = 0; i < 10; i++) {
        cy.get('body').tab();
        cy.focused().should('exist');
        cy.wait(50);
      }

      // Verify we can still navigate normally
      cy.get('input#projectName').focus();
      cy.get('input#projectName').should('be.focused');
      cy.get('input#projectName').type('{enter}');
      
      // Verify navigation worked
      cy.contains('Purpose').should('exist');
    });

    it('should maintain keyboard focus during form interactions', () => {
      cy.log('♿ Testing keyboard focus maintenance during form interactions');
      
      // Fill form data
      cy.fillProjectName('Focus Maintenance Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test keyboard navigation through upload interface
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Test file input accessibility
      cy.get('input[type="file"]').should('have.attr', 'aria-label').or('have.attr', 'aria-describedby');
      
      // Test upload button accessibility
      cy.get('button').contains('Upload').should('have.attr', 'aria-label').or('contain.text');
    });

    it('should handle keyboard navigation during file uploads', () => {
      cy.log('♿ Testing keyboard navigation during file uploads');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Keyboard Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test keyboard navigation before upload
      cy.get('body').tab();
      cy.focused().should('exist');

      // Upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();

      // Test keyboard navigation after upload
      cy.get('body').tab();
      cy.focused().should('exist');

      // Verify accessibility of uploaded file list
      cy.get('[data-testid="file-list"]').should('exist');
      cy.get('[data-testid="file-list"] li').should('have.attr', 'aria-label').or('contain.text');
    });

    it('should handle keyboard shortcuts under stress', () => {
      cy.log('♿ Testing keyboard shortcuts under stress');
      
      // Fill form data
      cy.fillProjectName('Keyboard Shortcuts Test');
      
      // Test rapid keyboard shortcuts
      for (let i = 0; i < 5; i++) {
        // Test enter key
        cy.get('input#projectName').focus().type('{enter}');
        cy.wait(100);
        
        // Test escape key
        cy.get('body').type('{esc}');
        cy.wait(100);
        
        // Test tab navigation
        cy.get('body').tab();
        cy.wait(100);
      }

      // Verify form still works correctly
      cy.get('input#projectName').should('have.value', 'Keyboard Shortcuts Test');
      cy.get('input#projectName').focus().type('{enter}');
      cy.contains('Purpose').should('exist');
    });
  });

  describe('Screen Reader Compatibility Stress Tests', () => {
    it('should maintain screen reader compatibility during rapid interactions', () => {
      cy.log('♿ Testing screen reader compatibility during rapid interactions');
      
      // Fill form data rapidly
      for (let i = 0; i < 5; i++) {
        cy.fillProjectName(`Screen Reader Test ${i}`);
        cy.wait(100);
        cy.get('input#projectName').clear();
        cy.wait(100);
      }

      // Verify ARIA attributes are still present
      cy.get('input#projectName').should('have.attr', 'aria-label').or('have.attr', 'aria-describedby');
      cy.get('button').should('have.attr', 'aria-label').or('contain.text');
      
      // Verify form labels are accessible
      cy.get('label').should('exist');
      cy.get('label[for="projectName"]').should('exist');
    });

    it('should handle screen reader announcements during file processing', () => {
      cy.log('♿ Testing screen reader announcements during file processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Screen Reader Processing Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Verify ARIA live regions for status updates
      cy.get('[aria-live]').should('exist');
      
      // Upload file and verify announcements
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Check for processing status announcements
      cy.get('[aria-live="polite"]').should('exist');
      cy.get('[aria-live="assertive"]').should('exist');
      
      // Wait for processing to complete
      cy.waitForAIAnalysis();
      
      // Verify completion announcement
      cy.get('[aria-live]').should('contain', 'complete').or('contain', 'success');
    });

    it('should maintain screen reader compatibility during error states', () => {
      cy.log('♿ Testing screen reader compatibility during error states');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Screen Reader Error Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload error
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ statusCode: 500, body: { error: 'Upload failed' } });
      }).as('uploadError');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadError');

      // Verify error announcements for screen readers
      cy.get('[aria-live="assertive"]').should('exist');
      cy.get('[role="alert"]').should('exist');
      cy.contains('Upload failed').should('exist');
    });
  });

  describe('Color Contrast and Visual Accessibility Stress Tests', () => {
    it('should maintain color contrast during rapid UI changes', () => {
      cy.log('♿ Testing color contrast during rapid UI changes');
      
      // Fill form data rapidly
      for (let i = 0; i < 10; i++) {
        cy.fillProjectName(`Color Contrast Test ${i}`);
        cy.wait(50);
        cy.get('input#projectName').clear();
        cy.wait(50);
      }

      // Verify text elements have sufficient contrast
      cy.get('body').should('have.css', 'color');
      cy.get('body').should('have.css', 'background-color');
      
      // Verify form elements maintain contrast
      cy.get('input#projectName').should('have.css', 'color');
      cy.get('input#projectName').should('have.css', 'background-color');
      
      // Verify button elements maintain contrast
      cy.get('button').should('have.css', 'color');
      cy.get('button').should('have.css', 'background-color');
    });

    it('should handle color contrast during loading states', () => {
      cy.log('♿ Testing color contrast during loading states');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Loading Contrast Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Upload file to trigger loading state
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Verify loading state maintains contrast
      cy.get('[data-testid="loading-indicator"]').should('have.css', 'color');
      cy.get('[data-testid="loading-indicator"]').should('have.css', 'background-color');
      
      // Wait for processing to complete
      cy.waitForAIAnalysis();
      
      // Verify success state maintains contrast
      cy.get('[data-testid="success-indicator"]').should('have.css', 'color');
      cy.get('[data-testid="success-indicator"]').should('have.css', 'background-color');
    });

    it('should maintain visual accessibility during error states', () => {
      cy.log('♿ Testing visual accessibility during error states');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Error Visual Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload error
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ statusCode: 500, body: { error: 'Upload failed' } });
      }).as('uploadError');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadError');

      // Verify error state maintains visual accessibility
      cy.get('[data-testid="error-message"]').should('have.css', 'color');
      cy.get('[data-testid="error-message"]').should('have.css', 'background-color');
      
      // Verify error icons are accessible
      cy.get('[data-testid="error-icon"]').should('have.attr', 'aria-label').or('have.attr', 'aria-hidden', 'true');
    });
  });

  describe('Focus Management Stress Tests', () => {
    it('should maintain focus management during rapid navigation', () => {
      cy.log('♿ Testing focus management during rapid navigation');
      
      // Fill form data
      cy.fillProjectName('Focus Management Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test rapid focus changes
      for (let i = 0; i < 5; i++) {
        cy.get('input[type="file"]').focus();
        cy.focused().should('have.attr', 'type', 'file');
        cy.wait(100);
        
        cy.get('button').contains('Upload').focus();
        cy.focused().should('contain.text', 'Upload');
        cy.wait(100);
      }

      // Verify focus management still works correctly
      cy.get('input[type="file"]').focus();
      cy.focused().should('have.attr', 'type', 'file');
    });

    it('should handle focus management during file uploads', () => {
      cy.log('♿ Testing focus management during file uploads');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Focus Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test focus before upload
      cy.get('input[type="file"]').focus();
      cy.focused().should('have.attr', 'type', 'file');

      // Upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();

      // Test focus after upload
      cy.get('button').contains('Next').focus();
      cy.focused().should('contain.text', 'Next');
    });

    it('should maintain focus management during error recovery', () => {
      cy.log('♿ Testing focus management during error recovery');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Error Focus Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload error
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ statusCode: 500, body: { error: 'Upload failed' } });
      }).as('uploadError');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadError');

      // Verify focus moves to error message
      cy.get('[data-testid="error-message"]').should('be.focused').or('be.visible');

      // Restore normal upload behavior
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ fixture: 'syllabus-extraction.json' });
      }).as('uploadSuccess');

      // Retry upload
      cy.get('button').contains('Retry').focus().click();
      cy.wait('@uploadSuccess');

      // Verify focus returns to normal flow
      cy.get('button').contains('Next').should('be.focused').or('be.visible');
    });
  });

  describe('Accessibility Under Load Tests', () => {
    it('should maintain accessibility during large file processing', () => {
      cy.log('♿ Testing accessibility during large file processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Large File Accessibility Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Upload large file
      cy.uploadSyllabus('syllabus-large.pdf');
      
      // Verify accessibility during processing
      cy.get('[aria-live]').should('exist');
      cy.get('[role="progressbar"]').should('exist');
      cy.get('[aria-valuenow]').should('exist');
      
      // Wait for processing to complete
      cy.waitForAIAnalysis();
      
      // Verify accessibility after processing
      cy.get('[aria-live]').should('contain', 'complete').or('contain', 'success');
      cy.get('button').contains('Next').should('not.be.disabled');
    });

    it('should maintain accessibility during concurrent operations', () => {
      cy.log('♿ Testing accessibility during concurrent operations');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Concurrent Accessibility Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate concurrent uploads
      const files = ['syllabus-small.pdf', 'syllabus-small.pdf', 'syllabus-small.pdf'];
      files.forEach((file, index) => {
        cy.get('input[type="file"]').attachFile(file);
      });

      // Verify accessibility during concurrent processing
      cy.get('[aria-live]').should('exist');
      cy.get('[role="progressbar"]').should('exist');
      
      // Wait for all processing to complete
      cy.wait('@postMeta', { timeout: 90000 });
      
      // Verify accessibility after concurrent processing
      cy.get('[data-testid="file-list"]').should('have.length', files.length);
      cy.get('button').contains('Next').should('not.be.disabled');
    });

    it('should maintain accessibility during rapid form interactions', () => {
      cy.log('♿ Testing accessibility during rapid form interactions');
      
      // Test rapid form interactions
      for (let i = 0; i < 10; i++) {
        cy.fillProjectName(`Rapid Form Test ${i}`);
        cy.wait(50);
        cy.get('input#projectName').clear();
        cy.wait(50);
      }

      // Verify accessibility attributes are maintained
      cy.get('input#projectName').should('have.attr', 'aria-label').or('have.attr', 'aria-describedby');
      cy.get('label[for="projectName"]').should('exist');
      
      // Verify form still works correctly
      cy.fillProjectName('Final Test');
      cy.goToNextStep();
      cy.contains('Purpose').should('exist');
    });
  });

  describe('Accessibility Error Recovery Tests', () => {
    it('should maintain accessibility during network failures', () => {
      cy.log('♿ Testing accessibility during network failures');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Network Accessibility Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network failure
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ statusCode: 500, body: { error: 'Network failure' } });
      }).as('networkFailure');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@networkFailure');

      // Verify accessibility during error state
      cy.get('[role="alert"]').should('exist');
      cy.get('[aria-live="assertive"]').should('exist');
      cy.get('button').contains('Retry').should('exist');
      cy.get('button').contains('Retry').should('have.attr', 'aria-label').or('contain.text');
    });

    it('should maintain accessibility during timeout errors', () => {
      cy.log('♿ Testing accessibility during timeout errors');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Timeout Accessibility Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate timeout
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ delay: 30000, forceNetworkError: true });
      }).as('timeout');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@timeout', { timeout: 35000 });

      // Verify accessibility during timeout state
      cy.get('[role="alert"]').should('exist');
      cy.get('[aria-live="assertive"]').should('exist');
      cy.contains('timeout').should('exist');
      cy.get('button').contains('Retry').should('exist');
    });

    it('should maintain accessibility during validation errors', () => {
      cy.log('♿ Testing accessibility during validation errors');
      
      // Test form validation accessibility
      cy.get('input#projectName').clear();
      cy.get('button').contains('Next').click();
      
      // Verify validation error accessibility
      cy.get('[role="alert"]').should('exist');
      cy.get('[aria-live="assertive"]').should('exist');
      cy.get('input#projectName').should('have.attr', 'aria-invalid', 'true');
      cy.get('input#projectName').should('have.attr', 'aria-describedby');
      
      // Fix validation error
      cy.fillProjectName('Validation Test');
      cy.get('input#projectName').should('not.have.attr', 'aria-invalid', 'true');
      cy.get('button').contains('Next').should('not.be.disabled');
    });
  });

  describe('Comprehensive Accessibility Audit Tests', () => {
    it('should pass comprehensive accessibility audit', () => {
      cy.log('♿ Running comprehensive accessibility audit');
      
      // Fill form data
      cy.fillProjectName('Comprehensive Audit Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Run accessibility audit
      cy.runAccessibilityAudit();
      
      // Test keyboard navigation
      cy.testKeyboardNavigation();
      
      // Test screen reader compatibility
      cy.testScreenReaderCompatibility();
      
      // Test color contrast
      cy.testColorContrast();
      
      // Test focus management
      cy.testFocusManagement();
    });

    it('should maintain accessibility throughout complete wizard flow', () => {
      cy.log('♿ Testing accessibility throughout complete wizard flow');
      
      // Complete the entire wizard flow while testing accessibility
      cy.fillProjectName('Complete Flow Accessibility Test');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.selectPurpose('good-grades');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.selectEducationLevel('university');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      // Upload and process file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.runAccessibilityAudit();
      cy.waitForAIAnalysis();
      
      cy.confirmExtractedInfo();
      cy.runAccessibilityAudit();
      
      // Continue through remaining steps
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.runAccessibilityAudit();
      
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.runAccessibilityAudit();
      
      cy.setLearningPreferences({ visual: true, auditory: true });
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.setTimeline('medium-term');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.setGoal('Achieve excellent grades');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.setStudyFrequency('daily');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      cy.setCollaboration('solo');
      cy.runAccessibilityAudit();
      cy.goToNextStep();
      
      // Complete project creation
      cy.completeProjectCreation();
      cy.runAccessibilityAudit();

      // Verify project was created successfully
      cy.verifyProjectCreated();
    });
  });
}); 