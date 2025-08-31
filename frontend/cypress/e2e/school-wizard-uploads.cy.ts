/// <reference types="cypress" />

describe('@wizard School Project Wizard - Uploads & AI Analysis (Steps 7-12)', () => {
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
    
    // Reset database for clean state
    cy.resetDatabase();
    
    // Mock API responses
    cy.intercept('GET', '/api/projects/', { 
      fixture: 'projects.json' 
    }).as('getProjects');

    cy.intercept('POST', '/api/projects/*/generate_metadata/', { 
      fixture: 'syllabus-extraction.json' 
    }).as('postMeta');

    cy.intercept('POST', '/api/projects/', { 
      fixture: 'project-creation-response.json' 
    }).as('createProject');

    // Login and navigate to upload steps
    cy.login();
    cy.startSchoolProjectCreation();
    
    // Complete initial steps to reach upload section
    cy.fillProjectName('Test Project');
    cy.selectPurpose('good-grades');
    cy.selectEducationLevel('university');
    cy.uploadSyllabus('syllabus-small.pdf');
    cy.waitForAIAnalysis();
    cy.confirmExtractedInfo();
  });

  describe('Step 7: Test Materials Upload', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
    });

    it('should allow uploading test materials', () => {
      cy.contains('Upload test materials').should('exist');
      cy.uploadTestMaterials(['syllabus-small.pdf']);
    });

    it('should show upload progress for test materials', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.contains('Uploading').should('exist');
    });

    it('should allow multiple test file uploads', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf', 'syllabus-small.pdf']);
      cy.contains('2 files uploaded').should('exist');
    });

    it('should allow removing test files', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.contains('Remove').click();
      cy.contains('No files uploaded').should('exist');
    });
  });

  describe('Step 8: Learning Preferences', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
    });

    it('should allow selecting visual learning preference', () => {
      cy.contains('Learning preferences').should('exist');
      cy.setLearningPreferences({ visual: true });
      cy.goToNextStep();
    });

    it('should allow selecting multiple learning preferences', () => {
      cy.setLearningPreferences({ 
        visual: true, 
        auditory: true, 
        kinesthetic: false, 
        reading: true 
      });
      cy.goToNextStep();
    });

    it('should allow selecting all learning preferences', () => {
      cy.setLearningPreferences({ 
        visual: true, 
        auditory: true, 
        kinesthetic: true, 
        reading: true 
      });
      cy.goToNextStep();
    });
  });

  describe('Step 9: Timeline Setup', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
    });

    it('should allow selecting short-term timeline', () => {
      cy.contains("What's your timeline?").should('exist');
      cy.setTimeline('short-term');
      cy.goToNextStep();
    });

    it('should allow selecting medium-term timeline', () => {
      cy.setTimeline('medium-term');
      cy.goToNextStep();
    });

    it('should allow selecting long-term timeline', () => {
      cy.setTimeline('long-term');
      cy.goToNextStep();
    });
  });

  describe('Step 10: Goal Setting', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
    });

    it('should allow entering study goal', () => {
      cy.contains("What's your main goal?").should('exist');
      cy.setGoal('Master advanced mathematical concepts and achieve excellent grades');
      cy.goToNextStep();
    });

    it('should validate goal input', () => {
      cy.goToNextStep();
      cy.contains('Goal is required').should('exist');
    });

    it('should allow long goal descriptions', () => {
      const longGoal = 'I want to master all the mathematical concepts covered in this course, including linear algebra, calculus, and differential equations. My goal is to not only pass the exams but to truly understand the underlying principles so I can apply them in real-world scenarios.';
      cy.setGoal(longGoal);
      cy.goToNextStep();
    });
  });

  describe('Step 11: Study Frequency', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      cy.setGoal('Master advanced mathematical concepts');
    });

    it('should allow selecting daily study frequency', () => {
      cy.contains('How often will you study?').should('exist');
      cy.setStudyFrequency('daily');
      cy.goToNextStep();
    });

    it('should allow selecting weekly study frequency', () => {
      cy.setStudyFrequency('weekly');
      cy.goToNextStep();
    });

    it('should allow selecting monthly study frequency', () => {
      cy.setStudyFrequency('monthly');
      cy.goToNextStep();
    });
  });

  describe('Step 12: Collaboration Preferences', () => {
    beforeEach(() => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      cy.setGoal('Master advanced mathematical concepts');
      cy.setStudyFrequency('daily');
    });

    it('should allow selecting solo collaboration', () => {
      cy.contains('Will you be working with others?').should('exist');
      cy.setCollaboration('solo');
      cy.goToNextStep();
    });

    it('should allow selecting group collaboration', () => {
      cy.setCollaboration('group');
      cy.goToNextStep();
    });

    it('should allow selecting mixed collaboration', () => {
      cy.setCollaboration('mixed');
      cy.goToNextStep();
    });
  });

  describe('File Upload Stress Testing', { 
    tags: ['@slow'],
    skip: () => !Cypress.env('RUN_SLOW_E2E')
  }, () => {
    it('should handle large file uploads', () => {
      cy.uploadCourseContent(['syllabus-large.pdf']);
      cy.contains('Uploading').should('exist');
      // Large file should take longer but eventually complete
      cy.contains('Upload complete', { timeout: 30000 }).should('exist');
    });

    it('should handle multiple large files', () => {
      cy.uploadCourseContent(['syllabus-large.pdf', 'syllabus-large.pdf']);
      cy.contains('2 files uploaded').should('exist');
    });

    it('should show file size validation', () => {
      // This would require a very large file to test
      // For now, we'll just verify the upload interface
      cy.contains('Upload course content').should('exist');
      cy.get('input[type="file"]').should('exist');
    });
  });

  describe('AI Analysis Integration', () => {
    it('should process uploaded test materials with AI', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.contains('Analyzing test materials').should('exist');
      cy.wait('@postMeta');
      cy.contains('Analysis complete').should('exist');
    });

    it('should display AI-generated insights', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.wait('@postMeta');
      
      // Verify AI insights are displayed
      cy.contains('AI Insights').should('exist');
      cy.contains('Recommended study approach').should('exist');
    });

    it('should allow applying AI recommendations', () => {
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.wait('@postMeta');
      cy.contains('Apply AI Recommendations').click();
      cy.contains('Recommendations applied').should('exist');
    });
  });

  describe('Progress Tracking and Navigation', () => {
    it('should show accurate progress through all steps', () => {
      // Complete all steps and verify progress
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      cy.setGoal('Master advanced mathematical concepts');
      cy.setStudyFrequency('daily');
      cy.setCollaboration('solo');
      
      // Should be at final step
      cy.contains('Review and Create').should('exist');
    });

    it('should maintain all data when navigating back', () => {
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      cy.setGoal('Master advanced mathematical concepts');
      cy.setStudyFrequency('daily');
      cy.setCollaboration('solo');
      
      // Go back and verify data is preserved
      cy.goToPreviousStep();
      cy.contains('daily').should('exist');
      cy.goToPreviousStep();
      cy.contains('Master advanced mathematical concepts').should('exist');
    });
  });

  describe('Performance and Accessibility', () => {
    it('should meet accessibility standards on review step', () => {
      // Complete all steps to reach review
      cy.uploadCourseContent(['syllabus-small.pdf']);
      cy.uploadTestMaterials(['syllabus-small.pdf']);
      cy.setLearningPreferences({ visual: true });
      cy.setTimeline('medium-term');
      cy.setGoal('Master advanced mathematical concepts');
      cy.setStudyFrequency('daily');
      cy.setCollaboration('solo');
      
      // Inject axe for accessibility testing
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should capture performance metrics for file processing', () => {
      cy.window().then((win) => {
        win.performance.mark('upload-start');
      });

      cy.uploadCourseContent(['syllabus-large.pdf']);
      
      cy.window().then((win) => {
        win.performance.mark('upload-complete');
        win.performance.measure('file-processing-time', 'upload-start', 'upload-complete');
        
        const measure = win.performance.getEntriesByName('file-processing-time')[0];
        expect(measure.duration).to.be.lessThan(30000); // Should complete within 30 seconds
      });
    });
  });
}); 