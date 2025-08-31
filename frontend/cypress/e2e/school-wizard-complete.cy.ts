/// <reference types="cypress" />

describe('@wizard School Project Wizard - Complete End-to-End Flow', () => {
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

    // Login and start wizard
    cy.login();
    cy.startSchoolProjectCreation();
  });

  it('should complete entire school project creation wizard successfully', () => {
    // Start performance tracking
    cy.window().then((win) => {
      win.performance.mark('wizard-start');
    });

    // Step 1: Project Name
    cy.contains("What's your project called?").should('exist');
    cy.fillProjectName('Advanced Mathematics Project');
    cy.goToNextStep();

    // Step 2: Purpose Selection
    cy.contains("What's your purpose?").should('exist');
    cy.selectPurpose('good-grades');
    cy.goToNextStep();

    // Step 3: Education Level
    cy.contains('Education level').should('exist');
    cy.selectEducationLevel('university');
    cy.goToNextStep();

    // Step 4: Syllabus Upload & AI Analysis
    cy.contains('Upload your syllabus').should('exist');
    cy.uploadSyllabus('syllabus-small.pdf');
    cy.waitForAIAnalysis();
    
    // Verify extracted data
    cy.contains('Advanced Mathematics').should('exist');
    cy.contains('MATH301').should('exist');
    cy.contains('Dr. Sarah Johnson').should('exist');

    // Step 5: Review Extracted Information
    cy.contains('Review extracted information').should('exist');
    cy.confirmExtractedInfo();

    // Step 6: Course Content Upload
    cy.contains('Upload course content').should('exist');
    cy.uploadCourseContent(['syllabus-small.pdf']);

    // Step 7: Test Materials Upload
    cy.contains('Upload test materials').should('exist');
    cy.uploadTestMaterials(['syllabus-small.pdf']);

    // Step 8: Learning Preferences
    cy.contains('Learning preferences').should('exist');
    cy.setLearningPreferences({ 
      visual: true, 
      auditory: true, 
      kinesthetic: false, 
      reading: true 
    });
    cy.goToNextStep();

    // Step 9: Timeline Setup
    cy.contains("What's your timeline?").should('exist');
    cy.setTimeline('medium-term');
    cy.goToNextStep();

    // Step 10: Goal Setting
    cy.contains("What's your main goal?").should('exist');
    cy.setGoal('Master advanced mathematical concepts and achieve excellent grades');
    cy.goToNextStep();

    // Step 11: Study Frequency
    cy.contains('How often will you study?').should('exist');
    cy.setStudyFrequency('daily');
    cy.goToNextStep();

    // Step 12: Collaboration Preferences
    cy.contains('Will you be working with others?').should('exist');
    cy.setCollaboration('solo');
    cy.goToNextStep();

    // Final Review Step
    cy.contains('Review and Create').should('exist');
    
    // Verify all entered data is displayed in review
    cy.contains('Advanced Mathematics Project').should('exist');
    cy.contains('good grades').should('exist');
    cy.contains('university').should('exist');
    cy.contains('Advanced Mathematics').should('exist');
    cy.contains('MATH301').should('exist');
    cy.contains('Dr. Sarah Johnson').should('exist');
    cy.contains('Master advanced mathematical concepts').should('exist');
    cy.contains('daily').should('exist');
    cy.contains('solo').should('exist');

    // Complete project creation
    cy.completeProjectCreation();

    // Verify success
    cy.verifyProjectCreated();

    // Performance tracking
    cy.window().then((win) => {
      win.performance.mark('wizard-complete');
      win.performance.measure('total-wizard-time', 'wizard-start', 'wizard-complete');
      
      const measure = win.performance.getEntriesByName('total-wizard-time')[0];
      expect(measure.duration).to.be.lessThan(60000); // Should complete within 60 seconds
    });
  });

  it('should handle navigation back and forth while preserving data', () => {
    // Complete initial steps
    cy.fillProjectName('Test Project');
    cy.selectPurpose('good-grades');
    cy.selectEducationLevel('university');
    cy.uploadSyllabus('syllabus-small.pdf');
    cy.waitForAIAnalysis();
    cy.confirmExtractedInfo();
    cy.uploadCourseContent(['syllabus-small.pdf']);
    cy.uploadTestMaterials(['syllabus-small.pdf']);
    cy.setLearningPreferences({ visual: true });
    cy.setTimeline('medium-term');
    cy.setGoal('Test goal');
    cy.setStudyFrequency('weekly');
    cy.setCollaboration('group');

    // Navigate back through all steps
    cy.goToPreviousStep(); // Back from collaboration to study frequency
    cy.contains('weekly').should('exist');
    
    cy.goToPreviousStep(); // Back to goal
    cy.contains('Test goal').should('exist');
    
    cy.goToPreviousStep(); // Back to timeline
    cy.contains('medium-term').should('exist');
    
    cy.goToPreviousStep(); // Back to learning preferences
    cy.contains('visual').should('exist');
    
    cy.goToPreviousStep(); // Back to test materials
    cy.contains('1 file uploaded').should('exist');
    
    cy.goToPreviousStep(); // Back to course content
    cy.contains('1 file uploaded').should('exist');
    
    cy.goToPreviousStep(); // Back to review extracted info
    cy.contains('Advanced Mathematics').should('exist');
    
    cy.goToPreviousStep(); // Back to syllabus upload
    cy.contains('Advanced Mathematics').should('exist');
    
    cy.goToPreviousStep(); // Back to education level
    cy.contains('university').should('exist');
    
    cy.goToPreviousStep(); // Back to purpose
    cy.contains('good grades').should('exist');
    
    cy.goToPreviousStep(); // Back to project name
    cy.contains('Test Project').should('exist');

    // Navigate forward again
    cy.goToNextStep(); // To purpose
    cy.goToNextStep(); // To education level
    cy.goToNextStep(); // To syllabus upload
    cy.goToNextStep(); // To review extracted info
    cy.goToNextStep(); // To course content
    cy.goToNextStep(); // To test materials
    cy.goToNextStep(); // To learning preferences
    cy.goToNextStep(); // To timeline
    cy.goToNextStep(); // To goal
    cy.goToNextStep(); // To study frequency
    cy.goToNextStep(); // To collaboration
    cy.goToNextStep(); // To final review

    // Verify all data is still intact
    cy.contains('Test Project').should('exist');
    cy.contains('good grades').should('exist');
    cy.contains('university').should('exist');
    cy.contains('Advanced Mathematics').should('exist');
    cy.contains('Test goal').should('exist');
    cy.contains('weekly').should('exist');
    cy.contains('group').should('exist');
  });

  it('should capture screenshots at key steps for visual regression testing', () => {
    // Step 1: Project Name
    cy.fillProjectName('Screenshot Test Project');
    cy.screenshot('wizard-step-1-project-name');

    // Step 2: Purpose Selection
    cy.goToNextStep();
    cy.selectPurpose('good-grades');
    cy.screenshot('wizard-step-2-purpose-selection');

    // Step 3: Education Level
    cy.goToNextStep();
    cy.selectEducationLevel('university');
    cy.screenshot('wizard-step-3-education-level');

    // Step 4: Syllabus Upload
    cy.goToNextStep();
    cy.uploadSyllabus('syllabus-small.pdf');
    cy.waitForAIAnalysis();
    cy.screenshot('wizard-step-4-syllabus-analysis');

    // Step 5: Review Extracted Information
    cy.confirmExtractedInfo();
    cy.screenshot('wizard-step-5-review-extracted-info');

    // Complete remaining steps quickly
    cy.uploadCourseContent(['syllabus-small.pdf']);
    cy.uploadTestMaterials(['syllabus-small.pdf']);
    cy.setLearningPreferences({ visual: true });
    cy.setTimeline('medium-term');
    cy.setGoal('Screenshot test goal');
    cy.setStudyFrequency('daily');
    cy.setCollaboration('solo');

    // Final Review Step (most important for visual regression)
    cy.screenshot('wizard-final-review-step');
  });

  it('should meet accessibility standards throughout the wizard', () => {
    // Inject axe for accessibility testing
    cy.injectAxe();

    // Test accessibility at each major step
    cy.fillProjectName('Accessibility Test Project');
    cy.checkA11y();

    cy.goToNextStep();
    cy.selectPurpose('good-grades');
    cy.checkA11y();

    cy.goToNextStep();
    cy.selectEducationLevel('university');
    cy.checkA11y();

    cy.goToNextStep();
    cy.uploadSyllabus('syllabus-small.pdf');
    cy.waitForAIAnalysis();
    cy.checkA11y();

    cy.confirmExtractedInfo();
    cy.uploadCourseContent(['syllabus-small.pdf']);
    cy.uploadTestMaterials(['syllabus-small.pdf']);
    cy.setLearningPreferences({ visual: true });
    cy.setTimeline('medium-term');
    cy.setGoal('Accessibility test goal');
    cy.setStudyFrequency('daily');
    cy.setCollaboration('solo');

    // Final review step accessibility
    cy.checkA11y();
  });
}); 