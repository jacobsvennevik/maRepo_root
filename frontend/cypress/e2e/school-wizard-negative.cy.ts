/// <reference types="cypress" />

describe('@wizard School Project Wizard - Negative Scenarios & Error Handling', () => {
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
    
    // Reset database for clean state (temporarily disabled)
    // cy.resetDatabase();
    
    // Login and start wizard
    cy.login();
    cy.startSchoolProjectCreation();
  });

  describe('Network Error Handling', () => {
    it('should handle network failure during syllabus analysis', () => {
      // Mock network failure
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('postMetaError');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Should show error message
      cy.contains('Analysis failed').should('exist');
      cy.contains('Retry').should('exist');
    });

    it('should allow retrying failed analysis', () => {
      // First request fails
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('postMetaError1');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Click retry
      cy.contains('Retry').click();
      
      // Second request succeeds
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        fixture: 'syllabus-extraction.json'
      }).as('postMetaSuccess');
      
      cy.wait('@postMetaSuccess');
      cy.contains('Analysis complete').should('exist');
    });

    it('should handle timeout during file upload', () => {
      // Mock slow upload
      cy.intercept('POST', '/api/upload/', {
        delay: 10000,
        statusCode: 408,
        body: { error: 'Request timeout' }
      }).as('uploadTimeout');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      cy.contains('Upload timeout').should('exist');
      cy.contains('Try again').should('exist');
    });
  });

  describe('Validation Errors', () => {
    it('should validate project name requirements', () => {
      // Try to submit with empty name
      cy.goToNextStep();
      cy.contains('Project name is required').should('exist');
      
      // Try with very short name
      cy.fillProjectName('A');
      cy.goToNextStep();
      cy.contains('Project name must be at least 3 characters').should('exist');
      
      // Try with very long name
      const longName = 'A'.repeat(101);
      cy.fillProjectName(longName);
      cy.goToNextStep();
      cy.contains('Project name must be less than 100 characters').should('exist');
    });

    it('should validate file upload requirements', () => {
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Try to proceed without uploading syllabus
      cy.goToNextStep();
      cy.contains('Please upload a syllabus file').should('exist');
    });

    it('should validate goal description length', () => {
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@postMeta');
      cy.confirmExtractedInfo();
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      
      // Try with very short goal
      cy.setGoal('A');
      cy.goToNextStep();
      cy.contains('Goal must be at least 10 characters').should('exist');
      
      // Try with very long goal
      const longGoal = 'A'.repeat(1001);
      cy.setGoal(longGoal);
      cy.goToNextStep();
      cy.contains('Goal must be less than 1000 characters').should('exist');
    });
  });

  describe('File Upload Errors', () => {
    it('should handle unsupported file types', () => {
      // Create a test file with unsupported extension
      cy.writeFile('cypress/fixtures/test.txt', 'This is a text file');
      
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Try to upload unsupported file
      cy.get('input[type="file"]').first().attachFile('test.txt');
      cy.contains('Unsupported file type').should('exist');
      cy.contains('Please upload a PDF file').should('exist');
    });

    it('should handle corrupted files', () => {
      // Create a corrupted PDF file
      cy.writeFile('cypress/fixtures/corrupted.pdf', 'This is not a valid PDF');
      
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Try to upload corrupted file
      cy.get('input[type="file"]').first().attachFile('corrupted.pdf');
      cy.contains('Invalid file format').should('exist');
      cy.contains('Please upload a valid PDF file').should('exist');
    });

    it('should handle files that are too large', () => {
      // Mock a large file upload
      cy.intercept('POST', '/api/upload/', {
        statusCode: 413,
        body: { error: 'File too large' }
      }).as('fileTooLarge');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      cy.contains('File too large').should('exist');
      cy.contains('Maximum file size is 10MB').should('exist');
    });
  });

  describe('Session and Authentication Errors', () => {
    it('should handle expired authentication token', () => {
      // Mock expired token response
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('tokenExpired');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      cy.contains('Session expired').should('exist');
      cy.contains('Please log in again').should('exist');
    });

    it('should redirect to login when not authenticated', () => {
      // Clear authentication
      cy.clearLocalStorage();
      cy.visit('/projects/create-school');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('should handle unsupported browser features', () => {
      // Mock FileReader API failure
      cy.window().then((win) => {
        win.FileReader = undefined;
      });

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Try to upload file
      cy.get('input[type="file"]').first().attachFile('syllabus-small.pdf');
      cy.contains('File upload not supported').should('exist');
      cy.contains('Please use a modern browser').should('exist');
    });

    it('should handle slow network conditions', () => {
      // Mock slow network
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        delay: 5000,
        fixture: 'syllabus-extraction.json'
      }).as('slowAnalysis');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Should show loading state
      cy.contains('Analyzing').should('exist');
      cy.contains('This may take a few minutes').should('exist');
      
      // Should eventually complete
      cy.wait('@slowAnalysis');
      cy.contains('Analysis complete').should('exist');
    });
  });

  describe('Data Persistence Issues', () => {
    it('should handle localStorage corruption', () => {
      // Corrupt localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('wizard-data', 'invalid-json');
      });

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Should handle gracefully
      cy.contains('Data reset').should('exist');
      cy.contains('Continue with fresh start').should('exist');
    });

    it('should handle form data loss during navigation', () => {
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Simulate page refresh
      cy.reload();
      
      // Should show recovery message
      cy.contains('Form data lost').should('exist');
      cy.contains('Start over').should('exist');
    });
  });

  describe('Recovery and Fallback Mechanisms', () => {
    it('should provide manual entry option when AI fails', () => {
      // Mock AI failure
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        statusCode: 500,
        body: { error: 'AI service unavailable' }
      }).as('aiFailure');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Should offer manual entry
      cy.contains('Enter manually').should('exist');
      cy.contains('Enter manually').click();
      
      // Should show manual form
      cy.contains('Course Name').should('exist');
      cy.contains('Course Code').should('exist');
      cy.contains('Teacher Name').should('exist');
    });

    it('should allow skipping optional steps', () => {
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@postMeta');
      cy.confirmExtractedInfo();
      
      // Should allow skipping course content upload
      cy.contains('Skip for now').should('exist');
      cy.contains('Skip for now').click();
      
      // Should proceed to next step
      cy.contains('Learning preferences').should('exist');
    });

    it('should provide clear error recovery instructions', () => {
      // Mock various errors and verify helpful messages
      cy.intercept('POST', '/api/projects/*/generate_metadata/', {
        statusCode: 500,
        body: { error: 'Service temporarily unavailable' }
      }).as('serviceError');

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      cy.uploadSyllabus('syllabus-small.pdf');
      
      // Should provide helpful error message
      cy.contains('Service temporarily unavailable').should('exist');
      cy.contains('Please try again in a few minutes').should('exist');
      cy.contains('If the problem persists, contact support').should('exist');
    });
  });

  describe('Accessibility Error Handling', () => {
    it('should handle screen reader errors gracefully', () => {
      // Mock screen reader API failure
      cy.window().then((win) => {
        win.speechSynthesis = undefined;
      });

      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Should still be functional without screen reader
      cy.goToNextStep();
      cy.contains('Education level').should('exist');
    });

    it('should provide keyboard navigation fallbacks', () => {
      cy.fillProjectName('Test Project');
      cy.selectPurpose('good-grades');
      cy.selectEducationLevel('university');
      
      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('exist');
      
      // Should be able to navigate with keyboard
      cy.get('body').type('{enter}');
      cy.contains('Education level').should('exist');
    });
  });
}); 