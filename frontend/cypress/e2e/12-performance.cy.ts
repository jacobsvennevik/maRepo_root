/// <reference types="cypress" />

describe('⚡ Performance Tests - School Project Wizard', () => {
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

  describe('AI Processing Performance Tests', () => {
    it('should measure AI processing time for small files', () => {
      cy.log('⚡ Testing AI processing performance for small files');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('AI Performance Test - Small');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure AI processing time
      cy.measureAIProcessingTime();

      // Upload file and trigger AI processing
      cy.uploadSyllabus('syllabus-small.pdf');

      // Verify processing completed successfully
      cy.contains('Analysis complete').should('exist');
    });

    it('should measure AI processing time for large files', () => {
      cy.log('⚡ Testing AI processing performance for large files');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('AI Performance Test - Large');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure AI processing time
      cy.measureAIProcessingTime();

      // Upload large file and trigger AI processing
      cy.uploadSyllabus('syllabus-large.pdf');

      // Verify processing completed successfully
      cy.contains('Analysis complete').should('exist');
    });

    it('should benchmark multiple AI processing requests', () => {
      cy.log('⚡ Benchmarking multiple AI processing requests');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('AI Benchmark Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      const processingTimes: number[] = [];

      // Process multiple files and measure each
      for (let i = 0; i < 3; i++) {
        cy.startPerformanceMeasurement(`ai-processing-${i}`);
        
        cy.uploadSyllabus('syllabus-small.pdf');
        cy.wait('@postMeta', { timeout: 60000 });
        
        cy.endPerformanceMeasurement(`ai-processing-${i}`);
        
        // Remove file for next iteration
        cy.get('[data-testid="remove-file"]').first().click();
      }

      // Log benchmark results
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        cy.log('⚡ AI Processing Benchmark Results:', measurements);
      });
    });

    it('should measure AI processing time under load', () => {
      cy.log('⚡ Testing AI processing performance under load');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('AI Load Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Simulate concurrent AI processing requests
      cy.startPerformanceMeasurement('ai-load-test');

      // Upload multiple files simultaneously
      const files = ['syllabus-small.pdf', 'syllabus-small.pdf', 'syllabus-small.pdf'];
      files.forEach((file, index) => {
        cy.get('input[type="file"]').attachFile(file);
      });

      // Wait for all processing to complete
      cy.wait('@postMeta', { timeout: 90000 });

      cy.endPerformanceMeasurement('ai-load-test');

      // Verify all files processed successfully
      cy.get('[data-testid="file-list"]').should('have.length', files.length);
    });
  });

  describe('File Upload Performance Tests', () => {
    it('should measure file upload time for small files', () => {
      cy.log('⚡ Testing file upload performance for small files');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Performance Test - Small');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure upload time
      cy.measureUploadTime('syllabus-small.pdf');

      // Verify upload completed successfully
      cy.get('[data-testid="upload-progress"]').should('contain', '100%');
    });

    it('should measure file upload time for large files', () => {
      cy.log('⚡ Testing file upload performance for large files');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Performance Test - Large');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure upload time
      cy.measureUploadTime('syllabus-large.pdf');

      // Verify upload completed successfully
      cy.get('[data-testid="upload-progress"]').should('contain', '100%');
    });

    it('should benchmark multiple file uploads', () => {
      cy.log('⚡ Benchmarking multiple file uploads');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Benchmark Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      const uploadTimes: number[] = [];

      // Upload multiple files and measure each
      for (let i = 0; i < 3; i++) {
        cy.startPerformanceMeasurement(`upload-${i}`);
        
        cy.get('input[type="file"]').attachFile('syllabus-small.pdf');
        cy.get('[data-testid="upload-progress"]').should('contain', '100%');
        
        cy.endPerformanceMeasurement(`upload-${i}`);
        
        // Remove file for next iteration
        cy.get('[data-testid="remove-file"]').first().click();
      }

      // Log benchmark results
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        cy.log('⚡ Upload Benchmark Results:', measurements);
      });
    });

    it('should measure concurrent file upload performance', () => {
      cy.log('⚡ Testing concurrent file upload performance');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Concurrent Upload Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure concurrent upload time
      cy.startPerformanceMeasurement('concurrent-upload');

      // Upload multiple files simultaneously
      const files = ['syllabus-small.pdf', 'syllabus-small.pdf', 'syllabus-small.pdf'];
      files.forEach(file => {
        cy.get('input[type="file"]').attachFile(file);
      });

      // Wait for all uploads to complete
      cy.get('[data-testid="upload-progress"]').should('contain', '100%');

      cy.endPerformanceMeasurement('concurrent-upload');

      // Verify all files uploaded successfully
      cy.get('[data-testid="file-list"]').should('have.length', files.length);
    });
  });

  describe('Step Navigation Performance Tests', () => {
    it('should measure step navigation time', () => {
      cy.log('⚡ Testing step navigation performance');
      
      // Fill initial form data
      cy.fillProjectName('Navigation Performance Test');
      
      // Measure step navigation time
      cy.measureStepNavigationTime();

      // Verify navigation worked correctly
      cy.contains('Purpose').should('exist');
    });

    it('should benchmark rapid step navigation', () => {
      cy.log('⚡ Benchmarking rapid step navigation');
      
      // Fill initial form data
      cy.fillProjectName('Rapid Navigation Benchmark');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      const navigationTimes: number[] = [];

      // Navigate back and forth rapidly
      for (let i = 0; i < 5; i++) {
        cy.startPerformanceMeasurement(`navigation-${i}`);
        
        cy.goToPreviousStep();
        cy.wait(100);
        cy.goToNextStep();
        
        cy.endPerformanceMeasurement(`navigation-${i}`);
      }

      // Log benchmark results
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        cy.log('⚡ Navigation Benchmark Results:', measurements);
      });
    });

    it('should measure form validation performance', () => {
      cy.log('⚡ Testing form validation performance');
      
      // Start performance measurement
      cy.startPerformanceMeasurement('form-validation');

      // Rapidly fill and clear form fields to test validation
      for (let i = 0; i < 10; i++) {
        cy.fillProjectName(`Test ${i}`);
        cy.wait(50);
        cy.get('input#projectName').clear();
        cy.wait(50);
      }

      cy.endPerformanceMeasurement('form-validation');

      // Verify form still works correctly
      cy.fillProjectName('Final Test');
      cy.goToNextStep();
      cy.contains('Purpose').should('exist');
    });
  });

  describe('Overall Performance Metrics Tests', () => {
    it('should measure complete wizard flow performance', () => {
      cy.log('⚡ Testing complete wizard flow performance');
      
      // Start performance measurement for entire flow
      cy.startPerformanceMeasurement('complete-wizard-flow');

      // Complete the entire wizard flow
      cy.fillProjectName('Complete Flow Performance Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();
      
      // Upload and process file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();
      cy.confirmExtractedInfo();
      
      // Continue through remaining steps
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true, auditory: true });
      cy.goToNextStep();
      cy.setTimeline('medium-term');
      cy.goToNextStep();
      cy.setGoal('Achieve excellent grades');
      cy.goToNextStep();
      cy.setStudyFrequency('daily');
      cy.goToNextStep();
      cy.setCollaboration('solo');
      cy.goToNextStep();
      
      // Complete project creation
      cy.completeProjectCreation();

      cy.endPerformanceMeasurement('complete-wizard-flow');

      // Verify project was created successfully
      cy.verifyProjectCreated();
    });

    it('should get comprehensive performance metrics', () => {
      cy.log('⚡ Getting comprehensive performance metrics');
      
      // Navigate to a page and get performance metrics
      cy.fillProjectName('Performance Metrics Test');
      cy.goToNextStep();

      // Get performance metrics
      cy.getPerformanceMetrics();

      // Verify metrics are available
      cy.window().then((win) => {
        const metrics = {
          navigationStart: win.performance.timing.navigationStart,
          loadEventEnd: win.performance.timing.loadEventEnd,
          domContentLoaded: win.performance.timing.domContentLoadedEventEnd,
        };
        
        // Verify metrics are valid
        expect(metrics.navigationStart).to.be.greaterThan(0);
        expect(metrics.loadEventEnd).to.be.greaterThan(metrics.navigationStart);
        expect(metrics.domContentLoaded).to.be.greaterThan(metrics.navigationStart);
      });
    });

    it('should measure memory usage during wizard flow', () => {
      cy.log('⚡ Testing memory usage during wizard flow');
      
      // Monitor memory before starting
      cy.monitorMemoryUsage();

      // Navigate through wizard steps
      cy.fillProjectName('Memory Usage Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Monitor memory after navigation
      cy.monitorMemoryUsage();

      // Upload and process file
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.waitForAIAnalysis();

      // Monitor memory after file processing
      cy.monitorMemoryUsage();

      // Continue through more steps
      cy.confirmExtractedInfo();
      cy.uploadCourseContent(['syllabus-small.pdf']);

      // Monitor memory after more processing
      cy.monitorMemoryUsage();

      // Verify successful completion
      cy.contains('Upload Course Materials').should('exist');
    });
  });

  describe('Performance Regression Tests', () => {
    it('should detect performance regressions in AI processing', () => {
      cy.log('⚡ Testing for AI processing performance regressions');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('AI Regression Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure AI processing time
      cy.startPerformanceMeasurement('ai-regression-test');
      
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@postMeta', { timeout: 60000 });
      
      cy.endPerformanceMeasurement('ai-regression-test');

      // Check if processing time is within acceptable limits
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        const aiProcessingTime = measurements.find(m => m.name === 'ai-regression-test');
        
        if (aiProcessingTime) {
          // Log the processing time for monitoring
          cy.log(`⚡ AI Processing Time: ${Math.round(aiProcessingTime.duration)}ms`);
          
          // Assert that processing time is reasonable (adjust threshold as needed)
          expect(aiProcessingTime.duration).to.be.lessThan(30000); // 30 seconds max
        }
      });

      // Verify processing completed successfully
      cy.contains('Analysis complete').should('exist');
    });

    it('should detect performance regressions in file uploads', () => {
      cy.log('⚡ Testing for file upload performance regressions');
      
      // Navigate to syllabus upload step
      cy.fillProjectName('Upload Regression Test');
      cy.goToNextStep();
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();

      // Measure upload time
      cy.startPerformanceMeasurement('upload-regression-test');
      
      cy.get('input[type="file"]').attachFile('syllabus-small.pdf');
      cy.get('[data-testid="upload-progress"]').should('contain', '100%');
      
      cy.endPerformanceMeasurement('upload-regression-test');

      // Check if upload time is within acceptable limits
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        const uploadTime = measurements.find(m => m.name === 'upload-regression-test');
        
        if (uploadTime) {
          // Log the upload time for monitoring
          cy.log(`⚡ Upload Time: ${Math.round(uploadTime.duration)}ms`);
          
          // Assert that upload time is reasonable (adjust threshold as needed)
          expect(uploadTime.duration).to.be.lessThan(10000); // 10 seconds max
        }
      });
    });

    it('should detect performance regressions in step navigation', () => {
      cy.log('⚡ Testing for step navigation performance regressions');
      
      // Fill initial form data
      cy.fillProjectName('Navigation Regression Test');
      
      // Measure navigation time
      cy.startPerformanceMeasurement('navigation-regression-test');
      
      cy.goToNextStep();
      cy.url().should('not.include', 'create-school');
      
      cy.endPerformanceMeasurement('navigation-regression-test');

      // Check if navigation time is within acceptable limits
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        const navigationTime = measurements.find(m => m.name === 'navigation-regression-test');
        
        if (navigationTime) {
          // Log the navigation time for monitoring
          cy.log(`⚡ Navigation Time: ${Math.round(navigationTime.duration)}ms`);
          
          // Assert that navigation time is reasonable (adjust threshold as needed)
          expect(navigationTime.duration).to.be.lessThan(2000); // 2 seconds max
        }
      });

      // Verify navigation worked correctly
      cy.contains('Purpose').should('exist');
    });
  });

  describe('Performance Monitoring and Reporting', () => {
    it('should generate performance report for CI/CD', () => {
      cy.log('⚡ Generating performance report for CI/CD');
      
      // Collect performance data throughout the test
      const performanceData: any = {};

      // Measure page load time
      cy.window().then((win) => {
        performanceData.pageLoadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
        performanceData.domContentLoaded = win.performance.timing.domContentLoadedEventEnd - win.performance.timing.navigationStart;
      });

      // Navigate and measure step performance
      cy.fillProjectName('CI/CD Performance Test');
      cy.startPerformanceMeasurement('ci-step-navigation');
      cy.goToNextStep();
      cy.endPerformanceMeasurement('ci-step-navigation');

      // Upload and measure processing performance
      cy.selectPurpose('good-grades');
      cy.goToNextStep();
      cy.selectEducationLevel('university');
      cy.goToNextStep();
      
      cy.startPerformanceMeasurement('ci-ai-processing');
      cy.uploadSyllabus('syllabus-small.pdf');
      cy.wait('@postMeta', { timeout: 60000 });
      cy.endPerformanceMeasurement('ci-ai-processing');

      // Collect final performance data
      cy.window().then((win) => {
        const measurements = win.performance.getEntriesByType('measure');
        
        performanceData.stepNavigation = measurements.find(m => m.name === 'ci-step-navigation')?.duration;
        performanceData.aiProcessing = measurements.find(m => m.name === 'ci-ai-processing')?.duration;
        
        // Log performance report for CI/CD
        cy.log('⚡ Performance Report for CI/CD:', JSON.stringify(performanceData, null, 2));
        
        // Assert performance thresholds for CI/CD
        expect(performanceData.pageLoadTime).to.be.lessThan(5000); // 5 seconds max
        expect(performanceData.stepNavigation).to.be.lessThan(2000); // 2 seconds max
        expect(performanceData.aiProcessing).to.be.lessThan(30000); // 30 seconds max
      });

      // Verify successful completion
      cy.contains('Analysis complete').should('exist');
    });
  });
}); 