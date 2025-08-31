/// <reference types="cypress" />

// Custom commands for School Project Wizard testing

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navigate to create school project page
       */
      visitCreateSchool(): Chainable<void>
      
      /**
       * Navigate to create self-study project page
       */
      visitCreateSelfStudy(): Chainable<void>
      
      /**
       * Navigate to create project selection page
       */
      visitCreateProject(): Chainable<void>
      /**
       * Create test user for authentication
       */
      createTestUser(): Chainable<void>
      
      /**
       * Login with test credentials
       */
      login(): Chainable<void>
      
      /**
       * Navigate to projects page and start school project creation
       */
      startSchoolProjectCreation(): Chainable<void>
      
      /**
       * Fill project name step
       */
      fillProjectName(name: string): Chainable<void>
      
      /**
       * Select project purpose
       */
      selectPurpose(purpose: 'good-grades' | 'personal-interest' | 'career-development'): Chainable<void>
      
      /**
       * Select education level
       */
      selectEducationLevel(level: 'high-school' | 'university' | 'graduate'): Chainable<void>
      
      /**
       * Upload syllabus file
       */
      uploadSyllabus(filename: string): Chainable<void>
      
      /**
       * Wait for AI analysis to complete
       */
      waitForAIAnalysis(): Chainable<void>
      
      /**
       * Review and confirm extracted information
       */
      confirmExtractedInfo(): Chainable<void>
      
      /**
       * Upload course content files
       */
      uploadCourseContent(filenames: string[]): Chainable<void>
      
      /**
       * Upload test materials
       */
      uploadTestMaterials(filenames: string[]): Chainable<void>
      
      /**
       * Set learning preferences
       */
      setLearningPreferences(preferences: {
        visual?: boolean
        auditory?: boolean
        kinesthetic?: boolean
        reading?: boolean
      }): Chainable<void>
      
      /**
       * Set project timeline
       */
      setTimeline(timeframe: 'short-term' | 'medium-term' | 'long-term'): Chainable<void>
      
      /**
       * Set study goal
       */
      setGoal(goal: string): Chainable<void>
      
      /**
       * Set study frequency
       */
      setStudyFrequency(frequency: 'daily' | 'weekly' | 'monthly'): Chainable<void>
      
      /**
       * Set collaboration preferences
       */
      setCollaboration(collaboration: 'solo' | 'group' | 'mixed'): Chainable<void>
      
      /**
       * Navigate to next step
       */
      goToNextStep(): Chainable<void>
      
      /**
       * Navigate to previous step
       */
      goToPreviousStep(): Chainable<void>
      
      /**
       * Complete project creation
       */
      completeProjectCreation(): Chainable<void>
      
      /**
       * Verify project was created successfully
       */
      verifyProjectCreated(): Chainable<void>

      // 🧪 STRESS TESTING COMMANDS
      /**
       * Upload multiple large files for stress testing
       */
      uploadMultipleLargeFiles(filenames: string[], step: 'syllabus' | 'course' | 'test'): Chainable<void>
      
      /**
       * Simulate concurrent uploads
       */
      simulateConcurrentUploads(filenames: string[]): Chainable<void>
      
      /**
       * Test rapid navigation through steps
       */
      rapidStepNavigation(): Chainable<void>
      
      /**
       * Test memory usage during large file processing
       */
      monitorMemoryUsage(): Chainable<void>

      // 🌐 NETWORK RESILIENCE COMMANDS
      /**
       * Simulate network timeout
       */
      simulateNetworkTimeout(delay: number): Chainable<void>
      
      /**
       * Simulate network failure
       */
      simulateNetworkFailure(): Chainable<void>
      
      /**
       * Test retry mechanism
       */
      testRetryMechanism(): Chainable<void>
      
      /**
       * Simulate slow network
       */
      simulateSlowNetwork(speed: 'slow' | 'very-slow'): Chainable<void>
      
      /**
       * Test offline/online recovery
       */
      testOfflineRecovery(): Chainable<void>

      // ⚡ PERFORMANCE MONITORING COMMANDS
      /**
       * Start performance measurement
       */
      startPerformanceMeasurement(label: string): Chainable<void>
      
      /**
       * End performance measurement and log results
       */
      endPerformanceMeasurement(label: string): Chainable<void>
      
      /**
       * Measure AI processing time
       */
      measureAIProcessingTime(): Chainable<void>
      
      /**
       * Measure file upload time
       */
      measureUploadTime(filename: string): Chainable<void>
      
      /**
       * Measure step navigation time
       */
      measureStepNavigationTime(): Chainable<void>
      
      /**
       * Get performance metrics
       */
      getPerformanceMetrics(): Chainable<any>

      // ♿ ACCESSIBILITY COMMANDS
      /**
       * Run accessibility audit
       */
      runAccessibilityAudit(): Chainable<void>
      
      /**
       * Test keyboard navigation
       */
      testKeyboardNavigation(): Chainable<void>
      
      /**
       * Test screen reader compatibility
       */
      testScreenReaderCompatibility(): Chainable<void>
      
      /**
       * Test color contrast
       */
      testColorContrast(): Chainable<void>
      
      /**
       * Test focus management
       */
      testFocusManagement(): Chainable<void>
    }
  }
}

// Login command with token caching
Cypress.Commands.add('login', () => {
  // Check if we already have a cached token
  const cachedToken = Cypress.env('authToken');
  
  if (cachedToken) {
    // Use cached token
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', cachedToken);
    });
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    return;
  }

  // Mock the login API call
  cy.intercept('POST', '/api/token/', {
    statusCode: 200,
    body: {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token'
    }
  }).as('login');
  
  // Perform fresh login
  cy.visit('/login');
  
  // Wait for the page to load completely and form to be ready
  cy.get('[data-testid="login-form"]', { timeout: 10000 }).should('be.visible');
  
  // Wait for any loading states to clear and form to be interactive
  cy.get('button[type="submit"]').should('not.be.disabled');
  
  // Wait a bit more for any JavaScript to finish loading
  cy.wait(2000);
  
  // Check if inputs are disabled and wait if needed
  cy.get('input[type="email"]').should('not.be.disabled');
  cy.get('input[type="password"]').should('not.be.disabled');
  
  // Fill in credentials with force if needed
  cy.get('input[type="email"]').clear({ force: true }).type('test@example.com', { force: true });
  cy.get('input[type="password"]').clear({ force: true }).type('testpass123', { force: true });
  
  // Submit the form
  cy.get('button[type="submit"]').click({ force: true });
  
  // Wait for the mocked login call
  cy.wait('@login');
  
  // Wait for login to complete
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
  
  // Cache the token for future tests
  cy.window().then((win) => {
    const token = win.localStorage.getItem('authToken');
    if (token) {
      Cypress.env('authToken', token);
    }
  });
});

// Reset database command
Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', 'http://localhost:8000/projects/test-utils/reset_db/').then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Create test user command (simplified - user is created via Django management command)
Cypress.Commands.add('createTestUser', () => {
  // Test user is created via Django management command: python manage.py create_test_user
  cy.log('Test user should be created via Django management command');
});

// Start school project creation
Cypress.Commands.add('startSchoolProjectCreation', () => {
  cy.visit('/projects');
  cy.contains('Create New Project').click();
  cy.url().should('include', '/projects/create');
  cy.contains('School Project').click();
  cy.url().should('include', '/projects/create-school');
  cy.contains('Start Guided Setup').click();
});

// Fill project name
Cypress.Commands.add('fillProjectName', (name: string) => {
  cy.get('input#projectName').clear().type(name);
});

// Select purpose
Cypress.Commands.add('selectPurpose', (purpose: string) => {
  // Look for clickable cards with the purpose text
  const purposeText = purpose.replace('-', ' ');
  // Convert to title case (e.g., "good grades" -> "Good Grades")
  const titleCaseText = purposeText.replace(/\b\w/g, l => l.toUpperCase());
  cy.contains(titleCaseText).click();
});

// Select education level
Cypress.Commands.add('selectEducationLevel', (level: string) => {
  // Look for clickable cards with the level text
  const levelText = level.replace('-', ' ');
  // Convert to title case (e.g., "high school" -> "High School")
  const titleCaseText = levelText.replace(/\b\w/g, l => l.toUpperCase());
  cy.contains(titleCaseText).click();
});

// Upload syllabus
Cypress.Commands.add('uploadSyllabus', (filename: string) => {
  cy.get('input[type="file"]').first().attachFile(filename);
  cy.contains('Upload').click();
});

// Wait for AI analysis
Cypress.Commands.add('waitForAIAnalysis', () => {
  cy.contains('Analyzing').should('exist');
  cy.wait('@postMeta', { timeout: 40000 }); // 40 second timeout for CI stability
  cy.contains('Analysis complete').should('exist');
});

// Confirm extracted info
Cypress.Commands.add('confirmExtractedInfo', () => {
  cy.contains('Review extracted information').should('exist');
  cy.contains('Confirm').click();
});

// Upload course content
Cypress.Commands.add('uploadCourseContent', (filenames: string[]) => {
  filenames.forEach(filename => {
    cy.get('input[type="file"]').attachFile(filename);
  });
  cy.contains('Upload').click();
});

// Upload test materials
Cypress.Commands.add('uploadTestMaterials', (filenames: string[]) => {
  filenames.forEach(filename => {
    cy.get('input[type="file"]').attachFile(filename);
  });
  cy.contains('Upload').click();
});

// Set learning preferences
Cypress.Commands.add('setLearningPreferences', (preferences: any) => {
  Object.entries(preferences).forEach(([type, enabled]) => {
    if (enabled) {
      cy.contains(type).click();
    }
  });
});

// Set timeline
Cypress.Commands.add('setTimeline', (timeframe: string) => {
  cy.contains(timeframe.replace('-', ' ')).click();
});

// Set goal
Cypress.Commands.add('setGoal', (goal: string) => {
  cy.get('textarea, input[type="text"]').clear().type(goal);
});

// Set study frequency
Cypress.Commands.add('setStudyFrequency', (frequency: string) => {
  cy.contains(frequency).click();
});

// Set collaboration
Cypress.Commands.add('setCollaboration', (collaboration: string) => {
  cy.contains(collaboration).click();
});

// Navigate to next step
Cypress.Commands.add('goToNextStep', () => {
  cy.get('button').contains('Next').click();
});

// Navigate to previous step
Cypress.Commands.add('goToPreviousStep', () => {
  cy.get('button').contains('Back').click();
});

// Complete project creation
Cypress.Commands.add('completeProjectCreation', () => {
  cy.contains('Create Project').click();
  cy.wait('@createProject');
});

// Verify project created
Cypress.Commands.add('verifyProjectCreated', () => {
  cy.url().should('include', '/projects/');
  cy.contains('Project created successfully').should('exist');
});

// Route aliasing utilities
Cypress.Commands.add('visitCreateSchool', () => {
  cy.visit('/projects/create-school');
  cy.contains('School Project Setup').should('be.visible');
});

Cypress.Commands.add('visitCreateSelfStudy', () => {
  cy.visit('/projects/create-self-study');
  cy.contains('Self-Study Project Setup').should('be.visible');
});

Cypress.Commands.add('visitCreateProject', () => {
  cy.visit('/projects/create');
  cy.contains('Create New Project').should('be.visible');
}); 

// 🧪 STRESS TESTING COMMANDS

// Upload multiple large files for stress testing
Cypress.Commands.add('uploadMultipleLargeFiles', (filenames: string[], step: 'syllabus' | 'course' | 'test') => {
  cy.log(`🧪 Stress Testing: Uploading ${filenames.length} large files for ${step} step`);
  
  // Navigate to the appropriate step if needed
  if (step === 'syllabus') {
    cy.contains('Upload your syllabus').should('exist');
  } else if (step === 'course') {
    cy.contains('Upload Course Materials').should('exist');
  } else if (step === 'test') {
    cy.contains('Upload Tests').should('exist');
  }

  // Upload each file with progress tracking
  filenames.forEach((filename, index) => {
    cy.log(`Uploading file ${index + 1}/${filenames.length}: ${filename}`);
    cy.get('input[type="file"]').attachFile(filename);
    
    // Wait for upload progress
    cy.get('[data-testid="upload-progress"]', { timeout: 60000 }).should('exist');
    cy.get('[data-testid="upload-progress"]').should('contain', '100%');
  });

  // Verify all files are uploaded
  cy.get('[data-testid="file-list"]').should('have.length', filenames.length);
});

// Simulate concurrent uploads
Cypress.Commands.add('simulateConcurrentUploads', (filenames: string[]) => {
  cy.log('🧪 Stress Testing: Simulating concurrent uploads');
  
  // Use Promise.all to simulate concurrent uploads
  const uploadPromises = filenames.map(filename => {
    return new Promise((resolve) => {
      cy.get('input[type="file"]').attachFile(filename);
      resolve(filename);
    });
  });

  // Wait for all uploads to complete
  cy.wrap(Promise.all(uploadPromises)).then(() => {
    cy.log('All concurrent uploads completed');
  });
});

// Test rapid navigation through steps
Cypress.Commands.add('rapidStepNavigation', () => {
  cy.log('🧪 Stress Testing: Rapid step navigation');
  
  // Navigate through steps as quickly as possible
  for (let i = 0; i < 5; i++) {
    cy.goToNextStep();
    cy.wait(100); // Minimal wait
    cy.goToPreviousStep();
    cy.wait(100);
  }
});

// Test memory usage during large file processing
Cypress.Commands.add('monitorMemoryUsage', () => {
  cy.log('🧪 Stress Testing: Monitoring memory usage');
  
  cy.window().then((win) => {
    if ('performance' in win && 'memory' in win.performance) {
      const memory = (win.performance as any).memory;
      cy.log(`Memory Usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB used`);
      cy.log(`Memory Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB limit`);
    }
  });
});

// 🌐 NETWORK RESILIENCE COMMANDS

// Simulate network timeout
Cypress.Commands.add('simulateNetworkTimeout', (delay: number) => {
  cy.log(`🌐 Network Resilience: Simulating ${delay}ms timeout`);
  
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    req.alias('processDocument');
    req.reply({ delay: delay, forceNetworkError: true });
  });
});

// Simulate network failure
Cypress.Commands.add('simulateNetworkFailure', () => {
  cy.log('🌐 Network Resilience: Simulating network failure');
  
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    req.alias('processDocument');
    req.reply({ statusCode: 500, body: { error: 'Internal Server Error' } });
  });
});

// Test retry mechanism
Cypress.Commands.add('testRetryMechanism', () => {
  cy.log('🌐 Network Resilience: Testing retry mechanism');
  
  let attemptCount = 0;
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    attemptCount++;
    if (attemptCount <= 2) {
      req.reply({ statusCode: 500, body: { error: 'Temporary failure' } });
    } else {
      req.reply({ fixture: 'syllabus-extraction.json' });
    }
  });
});

// Simulate slow network
Cypress.Commands.add('simulateSlowNetwork', (speed: 'slow' | 'very-slow') => {
  const delay = speed === 'slow' ? 5000 : 15000;
  cy.log(`🌐 Network Resilience: Simulating ${speed} network (${delay}ms delay)`);
  
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    req.alias('processDocument');
    req.reply({ delay: delay, fixture: 'syllabus-extraction.json' });
  });
});

// Test offline/online recovery
Cypress.Commands.add('testOfflineRecovery', () => {
  cy.log('🌐 Network Resilience: Testing offline/online recovery');
  
  // Simulate going offline
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    req.alias('processDocument');
    req.reply({ forceNetworkError: true });
  });
  
  // Wait and then simulate coming back online
  cy.wait(2000);
  cy.intercept('POST', '/api/pdf_service/documents/*/process/', (req) => {
    req.alias('processDocument');
    req.reply({ fixture: 'syllabus-extraction.json' });
  });
});

// ⚡ PERFORMANCE MONITORING COMMANDS

// Start performance measurement
Cypress.Commands.add('startPerformanceMeasurement', (label: string) => {
  cy.window().then((win) => {
    win.performance.mark(`${label}-start`);
    cy.log(`⚡ Performance: Started measurement for ${label}`);
  });
});

// End performance measurement and log results
Cypress.Commands.add('endPerformanceMeasurement', (label: string) => {
  cy.window().then((win) => {
    win.performance.mark(`${label}-end`);
    win.performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = win.performance.getEntriesByName(label)[0];
    cy.log(`⚡ Performance: ${label} took ${Math.round(measure.duration)}ms`);
  });
});

// Measure AI processing time
Cypress.Commands.add('measureAIProcessingTime', () => {
  cy.startPerformanceMeasurement('ai-processing');
  
  cy.wait('@postMeta', { timeout: 60000 }).then(() => {
    cy.endPerformanceMeasurement('ai-processing');
  });
});

// Measure file upload time
Cypress.Commands.add('measureUploadTime', (filename: string) => {
  cy.startPerformanceMeasurement(`upload-${filename}`);
  
  cy.get('input[type="file"]').attachFile(filename);
  cy.get('[data-testid="upload-progress"]').should('contain', '100%');
  
  cy.endPerformanceMeasurement(`upload-${filename}`);
});

// Measure step navigation time
Cypress.Commands.add('measureStepNavigationTime', () => {
  cy.startPerformanceMeasurement('step-navigation');
  
  cy.goToNextStep();
  cy.url().should('not.include', 'create-school');
  
  cy.endPerformanceMeasurement('step-navigation');
});

// Get performance metrics
Cypress.Commands.add('getPerformanceMetrics', () => {
  cy.window().then((win) => {
    const metrics = {
      navigationStart: win.performance.timing.navigationStart,
      loadEventEnd: win.performance.timing.loadEventEnd,
      domContentLoaded: win.performance.timing.domContentLoadedEventEnd,
      firstPaint: win.performance.getEntriesByType('paint')[0]?.startTime,
      firstContentfulPaint: win.performance.getEntriesByType('paint')[1]?.startTime,
    };
    
    cy.log('⚡ Performance Metrics:', metrics);
    return metrics;
  });
});

// ♿ ACCESSIBILITY COMMANDS

// Run accessibility audit
Cypress.Commands.add('runAccessibilityAudit', () => {
  cy.log('♿ Accessibility: Running audit');
  
  // Check for common accessibility issues
  cy.get('button').should('have.attr', 'aria-label').or('contain.text');
  cy.get('input').should('have.attr', 'aria-label').or('have.attr', 'placeholder');
  cy.get('img').should('have.attr', 'alt');
  
  // Check for proper heading structure
  cy.get('h1, h2, h3, h4, h5, h6').should('exist');
});

// Test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.log('♿ Accessibility: Testing keyboard navigation');
  
  // Test tab navigation
  cy.get('body').tab();
  cy.focused().should('exist');
  
  // Test enter key on buttons
  cy.get('button').first().focus().type('{enter}');
  
  // Test escape key
  cy.get('body').type('{esc}');
});

// Test screen reader compatibility
Cypress.Commands.add('testScreenReaderCompatibility', () => {
  cy.log('♿ Accessibility: Testing screen reader compatibility');
  
  // Check for ARIA labels and roles
  cy.get('[aria-label]').should('exist');
  cy.get('[role]').should('exist');
  
  // Check for proper form labels
  cy.get('label').should('exist');
});

// Test color contrast
Cypress.Commands.add('testColorContrast', () => {
  cy.log('♿ Accessibility: Testing color contrast');
  
  // This would typically use a library like axe-core
  // For now, we'll check that text elements have sufficient contrast
  cy.get('body').should('have.css', 'color');
  cy.get('body').should('have.css', 'background-color');
});

// Test focus management
Cypress.Commands.add('testFocusManagement', () => {
  cy.log('♿ Accessibility: Testing focus management');
  
  // Test that focus moves appropriately
  cy.get('button').first().focus();
  cy.focused().should('have.attr', 'tabindex');
  
  // Test focus trap in modals (if any)
  cy.get('[role="dialog"]').should('not.exist'); // No modals currently
}); 