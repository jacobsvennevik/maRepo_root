describe('@ai-metadata AI Metadata Generation', () => {
  beforeEach(() => {
    // Set feature flag to enabled
    cy.window().then((win) => {
      win.localStorage.setItem('NEXT_PUBLIC_SHOW_AI_META', 'true');
    });
    
    // Visit the projects page
    cy.visit('/projects');
  });

  it('should display AI-generated tags on project cards when feature flag is enabled', () => {
    // Mock the API response to include AI metadata
    cy.intercept('GET', '/api/projects/', {
      statusCode: 200,
      body: [
        {
          id: 'test-project-1',
          name: 'Advanced Machine Learning',
          project_type: 'school',
          description: 'Learn advanced ML concepts',
          lastUpdated: '2024-01-15',
          type: 'computer-science',
          is_draft: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          school_data: {
            course_name: 'Advanced Machine Learning',
            course_code: 'CS-677',
            teacher_name: 'Dr. Smith'
          },
          meta: {
            ai_generated_tags: ['machine-learning', 'python', 'neural-networks', 'deep-learning'],
            content_summary: 'Advanced course covering ML fundamentals',
            difficulty_level: 'advanced',
            ai_model_used: 'gpt-4',
            ai_prompt_version: '1.0'
          }
        }
      ]
    }).as('getProjects');

    // Wait for the API call
    cy.wait('@getProjects');

    // Check that the project card displays AI tags
    cy.get('[data-testid="project-card"]').should('be.visible');
    cy.get('[data-testid="project-card"]').within(() => {
      // Check for AI-generated tags
      cy.contains('machine-learning').should('be.visible');
      cy.contains('python').should('be.visible');
      cy.contains('neural-networks').should('be.visible');
      
      // Check for "more" indicator if there are more than 3 tags
      cy.contains('+1 more').should('be.visible');
    });
  });

  it('should not display AI tags when feature flag is disabled', () => {
    // Set feature flag to disabled
    cy.window().then((win) => {
      win.localStorage.setItem('NEXT_PUBLIC_SHOW_AI_META', 'false');
    });

    // Mock the API response with AI metadata
    cy.intercept('GET', '/api/projects/', {
      statusCode: 200,
      body: [
        {
          id: 'test-project-1',
          name: 'Advanced Machine Learning',
          project_type: 'school',
          description: 'Learn advanced ML concepts',
          lastUpdated: '2024-01-15',
          type: 'computer-science',
          is_draft: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          school_data: {
            course_name: 'Advanced Machine Learning',
            course_code: 'CS-677',
            teacher_name: 'Dr. Smith'
          },
          meta: {
            ai_generated_tags: ['machine-learning', 'python', 'neural-networks'],
            content_summary: 'Advanced course covering ML fundamentals',
            difficulty_level: 'advanced'
          }
        }
      ]
    }).as('getProjects');

    // Reload the page to apply the feature flag change
    cy.reload();
    cy.wait('@getProjects');

    // Check that AI tags are not displayed
    cy.get('[data-testid="project-card"]').should('be.visible');
    cy.get('[data-testid="project-card"]').within(() => {
      cy.contains('machine-learning').should('not.exist');
      cy.contains('python').should('not.exist');
      cy.contains('neural-networks').should('not.exist');
    });
  });

  it('should handle projects without AI metadata gracefully', () => {
    // Mock the API response without AI metadata
    cy.intercept('GET', '/api/projects/', {
      statusCode: 200,
      body: [
        {
          id: 'test-project-2',
          name: 'Basic Python Course',
          project_type: 'school',
          description: 'Learn Python basics',
          lastUpdated: '2024-01-10',
          type: 'computer-science',
          is_draft: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
          school_data: {
            course_name: 'Basic Python Course',
            course_code: 'CS-101',
            teacher_name: 'Dr. Johnson'
          }
          // No meta field
        }
      ]
    }).as('getProjects');

    cy.wait('@getProjects');

    // Check that the project card displays without errors
    cy.get('[data-testid="project-card"]').should('be.visible');
    cy.get('[data-testid="project-card"]').within(() => {
      cy.contains('Basic Python Course').should('be.visible');
      // Should not have any AI tags
      cy.get('[class*="badge"]').should('not.exist');
    });
  });

  it('should trigger metadata generation via API', () => {
    // Mock the metadata generation endpoint
    cy.intercept('POST', '/api/projects/*/generate_metadata/', {
      statusCode: 202,
      body: {
        message: 'Metadata generation started',
        task_id: 'test-task-id',
        project_id: 'test-project-1',
        force_regenerate: false
      }
    }).as('generateMetadata');

    // Visit a specific project page
    cy.visit('/projects/test-project-1/overview');

    // Trigger metadata generation (this would be done via a button in the UI)
    cy.window().then((win) => {
      // Simulate API call
      win.fetch('/api/projects/test-project-1/generate_metadata/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    // Verify the API call was made
    cy.wait('@generateMetadata');
  });

  it('should handle metadata generation with force parameter', () => {
    // Mock the metadata generation endpoint with force parameter
    cy.intercept('POST', '/api/projects/*/generate_metadata/?force=true', {
      statusCode: 202,
      body: {
        message: 'Metadata generation started',
        task_id: 'test-task-id-2',
        project_id: 'test-project-1',
        force_regenerate: true
      }
    }).as('generateMetadataForce');

    // Visit a specific project page
    cy.visit('/projects/test-project-1/overview');

    // Trigger metadata generation with force parameter
    cy.window().then((win) => {
      win.fetch('/api/projects/test-project-1/generate_metadata/?force=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
    });

    // Verify the API call was made
    cy.wait('@generateMetadataForce');
  });
}); 