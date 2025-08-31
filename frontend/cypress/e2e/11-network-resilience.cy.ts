/// <reference types="cypress" />

describe('🌐 Network Resilience Tests - School Project Wizard', () => {
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

  describe('Network Timeout Tests', () => {
    it('should handle AI processing timeout gracefully', () => {
      cy.log('🌐 Testing AI processing timeout handling');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Timeout Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network timeout
      cy.simulateNetworkTimeout(30000); // 30 second timeout

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for timeout error
      cy.contains('timeout', { timeout: 35000 }).should('exist');
      cy.contains('try again').should('exist');

      // Verify retry mechanism is available
      cy.get('button').contains('Retry').should('exist');
    });

    it('should handle file upload timeout', () => {
      cy.log('🌐 Testing file upload timeout handling');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Timeout Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload timeout
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.alias('uploadTimeout');
        req.reply({ delay: 30000, forceNetworkError: true });
      });

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadTimeout', { timeout: 35000 });

      // Verify timeout error handling
      cy.contains('timeout').should('exist');
      cy.contains('try again').should('exist');
    });
  });

  describe('Network Failure Tests', () => {
    it('should handle AI processing network failure', () => {
      cy.log('🌐 Testing AI processing network failure');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Network Failure Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network failure
      cy.simulateNetworkFailure();

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for network error
      cy.contains('network error', { timeout: 10000 }).should('exist');
      cy.contains('try again').should('exist');

      // Verify retry mechanism is available
      cy.get('button').contains('Retry').should('exist');
    });

    it('should handle file upload network failure', () => {
      cy.log('🌐 Testing file upload network failure');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Failure Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload network failure
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.alias('uploadFailure');
        req.reply({ statusCode: 500, body: { error: 'Network failure' } });
      });

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadFailure');

      // Verify network error handling
      cy.contains('network error').should('exist');
      cy.contains('try again').should('exist');
    });
  });

  describe('Retry Mechanism Tests', () => {
    it('should retry AI processing after failure', () => {
      cy.log('🌐 Testing AI processing retry mechanism');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Retry Test Project');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test retry mechanism
      cy.testRetryMechanism();

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for retry attempts and eventual success
      cy.wait('@postMeta', { timeout: 60000 });

      // Verify successful processing after retries
      cy.contains('Analysis complete').should('exist');
    });

    it('should retry file upload after failure', () => {
      cy.log('🌐 Testing file upload retry mechanism');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Retry Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate upload failures followed by success
      let attemptCount = 0;
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        attemptCount++;
        if (attemptCount <= 2) {
          req.reply({ statusCode: 500, body: { error: 'Upload failed' } });
        } else {
          req.reply({ fixture: 'syllabus-extraction.json' });
        }
      }).as('uploadRetry');

      // Try to upload file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadRetry');

      // Verify successful upload after retries
      cy.contains('Analysis complete').should('exist');
    });
  });

  describe('Slow Network Tests', () => {
    it('should handle slow network during AI processing', () => {
      cy.log('🌐 Testing slow network during AI processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Slow Network Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate slow network
      cy.simulateSlowNetwork('slow');

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for processing to complete (with extended timeout)
      cy.wait('@postMeta', { timeout: 60000 });

      // Verify successful processing
      cy.contains('Analysis complete').should('exist');
    });

    it('should handle very slow network during file upload', () => {
      cy.log('🌐 Testing very slow network during file upload');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Very Slow Network Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate very slow network
      cy.simulateSlowNetwork('very-slow');

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for processing to complete (with extended timeout)
      cy.wait('@postMeta', { timeout: 90000 });

      // Verify successful processing
      cy.contains('Analysis complete').should('exist');
    });
  });

  describe('Offline/Online Recovery Tests', () => {
    it('should handle offline/online recovery during AI processing', () => {
      cy.log('🌐 Testing offline/online recovery during AI processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Offline Recovery Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test offline/online recovery
      cy.testOfflineRecovery();

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for processing to complete
      cy.wait('@postMeta', { timeout: 60000 });

      // Verify successful processing after recovery
      cy.contains('Analysis complete').should('exist');
    });

    it('should handle offline/online recovery during file upload', () => {
      cy.log('🌐 Testing offline/online recovery during file upload');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Recovery Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate going offline during upload
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.alias('uploadOffline');
        req.reply({ forceNetworkError: true });
      });

      // Try to upload file (should fail)
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@uploadOffline');

      // Verify offline error handling
      cy.contains('network error').should('exist');

      // Simulate coming back online
      cy.intercept('POST', '/api/pdf_service/documents/', (req) => {
        req.alias('uploadOnline');
        req.reply({ fixture: 'syllabus-extraction.json' });
      });

      // Retry upload
      cy.get('button').contains('Retry').click();
      cy.wait('@uploadOnline');

      // Verify successful upload after recovery
      cy.contains('Analysis complete').should('exist');
    });
  });

  describe('Intermittent Network Tests', () => {
    it('should handle intermittent network failures', () => {
      cy.log('🌐 Testing intermittent network failures');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Intermittent Network Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate intermittent network failures
      let requestCount = 0;
      cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
        requestCount++;
        if (requestCount % 2 === 0) {
          // Every other request fails
          req.reply({ statusCode: 500, body: { error: 'Intermittent failure' } });
        } else {
          req.reply({ fixture: 'syllabus-extraction.json' });
        }
      }).as('intermittentProcessing');

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for processing to complete (may take multiple attempts)
      cy.wait('@intermittentProcessing', { timeout: 60000 });

      // Verify eventual success
      cy.contains('Analysis complete').should('exist');
    });

    it('should handle network degradation during processing', () => {
      cy.log('🌐 Testing network degradation during processing');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Network Degradation Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network degradation (increasing delays)
      let requestCount = 0;
      cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
        requestCount++;
        const delay = Math.min(requestCount * 2000, 10000); // Increasing delays up to 10s
        req.reply({ delay: delay, fixture: 'syllabus-extraction.json' });
      }).as('degradedProcessing');

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Wait for processing to complete (with extended timeout)
      cy.wait('@degradedProcessing', { timeout: 90000 });

      // Verify successful processing despite degradation
      cy.contains('Analysis complete').should('exist');
    });
  });

  describe('Error Message and Recovery Tests', () => {
    it('should display appropriate error messages for different network issues', () => {
      cy.log('🌐 Testing error message display for different network issues');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Error Message Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Test timeout error message
      cy.simulateNetworkTimeout(5000);
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.contains('timeout').should('exist');
      cy.contains('try again').should('exist');

      // Test network failure error message
      cy.simulateNetworkFailure();
      cy.get('button').contains('Retry').click();
      cy.contains('network error').should('exist');
      cy.contains('try again').should('exist');

      // Test server error message
      cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
        req.reply({ statusCode: 503, body: { error: 'Service unavailable' } });
      });
      cy.get('button').contains('Retry').click();
      cy.contains('service unavailable').should('exist');
    });

    it('should provide clear recovery instructions', () => {
      cy.log('🌐 Testing recovery instruction display');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Recovery Instructions Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network failure
      cy.simulateNetworkFailure();
      cy.uploadSyllabus('syllabus-small.pdf');

      // Verify recovery instructions are displayed
      cy.contains('try again').should('exist');
      cy.contains('check your connection').should('exist');
      cy.get('button').contains('Retry').should('exist');
      cy.get('button').contains('Cancel').should('exist');
    });
  });

  describe('State Preservation During Network Issues', () => {
    it('should preserve form state during network failures', () => {
      cy.log('🌐 Testing form state preservation during network failures');
      
      // Fill form data
      cy.fillProjectName('State Preservation Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate network failure
      cy.simulateNetworkFailure();
      cy.uploadSyllabus('syllabus-small.pdf');

      // Verify form state is preserved
      cy.get('input#projectName').should('have.value', 'State Preservation Test');
      cy.contains('Upload your syllabus').should('exist');

      // Restore network and retry
      cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
        req.reply({ fixture: 'syllabus-extraction.json' });
      });
      cy.get('button').contains('Retry').click();

      // Verify successful processing
      cy.contains('Analysis complete').should('exist');
    });

    it('should preserve uploaded files during network failures', () => {
      cy.log('🌐 Testing file preservation during network failures');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('File Preservation Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Upload file successfully first
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();

      // Verify file is uploaded
      cy.get('[data-testid="file-list"]').should('have.length', 1);

      // Simulate network failure during next step
      cy.simulateNetworkFailure();
      cy.goToNextStep();

      // Verify file is still present
      cy.get('[data-testid="file-list"]').should('have.length', 1);
      cy.contains('syllabus-small.pdf').should('exist');
    });
  });
}); 