/// <reference types="cypress" />

describe('🧪 Stress Tests - School Project Wizard', () => {
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

    // Mock authentication state
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-token-for-testing');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    // Mock authentication API calls
    cy.intercept('GET', '/api/auth/user/', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      }
    }).as('getUser');
    
    // Mock the token endpoint
    cy.intercept('POST', '/api/token/', {
      statusCode: 200,
      body: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token'
      }
    }).as('login');
    
    // Visit the project creation page directly
    cy.visit('/projects/create-school');
    cy.contains('Start Guided Setup').click();
    
    // Wait for the guided setup to load and the first step to be visible
    cy.get('input#projectName', { timeout: 10000 }).should('be.visible');
  });

  describe('Large File Upload Stress Tests', () => {
    it('should handle multiple large file uploads in syllabus step', () => {
      cy.log('🧪 Testing multiple large file uploads in syllabus step');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Stress Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Monitor memory usage before uploads
      cy.monitorMemoryUsage();

      // Upload multiple large files
      const largeFiles = ['syllabus-large.pdf', 'syllabus-large.pdf', 'syllabus-large.pdf'];
      cy.uploadMultipleLargeFiles(largeFiles, 'syllabus');

      // Monitor memory usage after uploads
      cy.monitorMemoryUsage();

      // Verify the Next button is activated (enhanced mock system)
      cy.get('button').contains('Next').should('not.be.disabled');
    });

    it('should handle large file uploads in course content step', () => {
      cy.log('🧪 Testing large file uploads in course content step');
      
      // Navigate to course content step
      cy.fillProjectName('Course Content Stress Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();
      
      // Skip syllabus upload
      cy.get('[data-testid="skip-button"]').click();
      
      // Navigate to course content step
      cy.contains('Upload Course Materials').should('exist');

      // Upload multiple large files
      const courseFiles = ['syllabus-large.pdf', 'syllabus-large.pdf'];
      cy.uploadMultipleLargeFiles(courseFiles, 'course');

      // Verify the Next button is activated
      cy.get('button').contains('Next').should('not.be.disabled');
    });

    it('should handle large file uploads in test materials step', () => {
      cy.log('🧪 Testing large file uploads in test materials step');
      
      // Navigate to test materials step
      cy.fillProjectName('Test Materials Stress Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();
      
      // Skip syllabus upload
      cy.get('[data-testid="skip-button"]').click();
      
      // Skip course content upload
      cy.get('[data-testid="skip-button"]').click();
      
      // Navigate to test materials step
      cy.contains('Upload Tests').should('exist');

      // Upload multiple large files
      const testFiles = ['syllabus-large.pdf', 'syllabus-large.pdf', 'syllabus-large.pdf'];
      cy.uploadMultipleLargeFiles(testFiles, 'test');

      // Verify the Next button is activated
      cy.get('button').contains('Next').should('not.be.disabled');
    });
  });

  describe('Concurrent Operations Stress Tests', () => {
    it('should handle concurrent file uploads', () => {
      cy.log('🧪 Testing concurrent file uploads');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Concurrent Upload Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate concurrent uploads
      const concurrentFiles = ['syllabus-small.pdf', 'syllabus-small.pdf', 'syllabus-small.pdf'];
      cy.simulateConcurrentUploads(concurrentFiles);

      // Verify uploads completed successfully
      cy.get('[data-testid="file-list"]').should('have.length', concurrentFiles.length);
    });

    it('should handle rapid navigation between steps', () => {
      cy.log('🧪 Testing rapid step navigation');
      
      // Fill initial form data
      cy.fillProjectName('Rapid Navigation Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test rapid navigation
      cy.rapidStepNavigation();

      // Verify we're still on a valid step
      cy.url().should('include', '/projects/create-school');
    });
  });

  describe('Memory and Performance Stress Tests', () => {
    it('should monitor memory usage during large file processing', () => {
      cy.log('🧪 Testing memory usage during large file processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Memory Usage Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Monitor memory before processing
      cy.monitorMemoryUsage();

      // Upload large file and trigger AI processing
      cy.uploadSyllabus('syllabus-large.pdf');
      cy.waitForAIAnalysis();

      // Monitor memory after processing
      cy.monitorMemoryUsage();

      // Verify processing completed successfully
      cy.contains('Analysis complete').should('exist');
    });

    it('should handle multiple AI analysis requests', () => {
      cy.log('🧪 Testing multiple AI analysis requests');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Multiple AI Analysis Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Upload multiple files and trigger multiple AI analyses
      for (let i = 0; i < 3; i++) {
        cy.uploadSyllabus('syllabus-small.pdf');
        cy.waitForAIAnalysis();
        
        // Remove file and upload another
        cy.get('[data-testid="remove-file"]').first().click();
      }

      // Verify final state is correct
      cy.get('[data-testid="file-list"]').should('have.length', 1);
    });
  });

  describe('UI Stress Tests', () => {
    it('should handle rapid form interactions', () => {
      cy.log('🧪 Testing rapid form interactions');
      
      // Rapidly fill and change form fields
      for (let i = 0; i < 10; i++) {
        cy.fillProjectName(`Rapid Test ${i}`);
        cy.wait(50);
      }

      // Verify form still works correctly
      cy.fillProjectName('Final Test Name');
      cy.goToNextStep();
      
      // Verify navigation worked
      cy.contains('Purpose').should('exist');
    });

    it('should handle rapid button clicks', () => {
      cy.log('🧪 Testing rapid button clicks');
      
      // Fill required fields
      cy.fillProjectName('Button Click Test');
      
      // Rapidly click the Next button
      for (let i = 0; i < 5; i++) {
        cy.get('button').contains('Next').click({ force: true });
        cy.wait(100);
      }

      // Verify we're on the correct step
      cy.contains('Purpose').should('exist');
    });
  });

  describe('State Management Stress Tests', () => {
    it('should maintain state during rapid navigation', () => {
      cy.log('🧪 Testing state maintenance during rapid navigation');
      
      // Fill form data
      cy.fillProjectName('State Management Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Navigate back and forth rapidly
      for (let i = 0; i < 5; i++) {
        cy.goToPreviousStep();
        cy.wait(100);
        cy.goToNextStep();
        cy.wait(100);
      }

      // Verify state is preserved
      cy.contains('Upload your syllabus').should('exist');
      cy.get('input#projectName').should('have.value', 'State Management Test');
    });

    it('should handle form data persistence under stress', () => {
      cy.log('🧪 Testing form data persistence under stress');
      
      // Fill form data
      cy.fillProjectName('Persistence Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();

      // Navigate back and forth
      cy.goToPreviousStep();
      cy.goToNextStep();

      // Verify all data is preserved
      cy.contains('Upload your syllabus').should('exist');
      cy.get('[data-testid="file-list"]').should('have.length', 1);
      cy.get('input#projectName').should('have.value', 'Persistence Test');
    });
  });

  describe('Error Recovery Stress Tests', () => {
    it('should recover from upload failures gracefully', () => {
      cy.log('🧪 Testing recovery from upload failures');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Error Recovery Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload failure
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ statusCode: 500, body: { error: 'Upload failed' } });
      }).as('uploadFailure');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadFailure');

      // Verify error handling
      cy.contains('Upload failed').should('exist');

      // Restore normal upload behavior
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.reply({ fixture: 'syllabus-extraction.json' });
      }).as('uploadSuccess');

      // Try upload again
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadSuccess');

      // Verify successful recovery
      cy.contains('Analysis complete').should('exist');
    });
  });
}); 