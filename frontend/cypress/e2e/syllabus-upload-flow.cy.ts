describe('Syllabus Upload Flow', () => {
  beforeEach(() => {
    // Visit the create school project page
    cy.visit('/projects/create-school');
    
    // Wait for the page to load
    cy.get('[data-testid="guided-setup"]', { timeout: 10000 }).should('be.visible');
  });

  it('should complete the guided setup flow and allow syllabus upload', () => {
    // Step 1: Project Name
    cy.get('input[placeholder*="name" i]').type('Test School Project');
    cy.get('button').contains('Next').click();

    // Step 2: Purpose
    cy.get('button').contains('Academic').click();
    cy.get('button').contains('Next').click();

    // Step 3: Education Level
    cy.get('button').contains('Master').click();
    cy.get('button').contains('Next').click();

    // Step 4: Upload Syllabus - This is where we test the upload functionality
    cy.get('[data-testid="syllabus-upload-step"]').should('be.visible');
    
    // Verify the upload interface is present
    cy.contains('Upload your course materials').should('be.visible');
    cy.contains('Browse for course materials').should('be.visible');
    
    // Test that the upload interface is interactive
    cy.get('input[type="file"]').should('exist');
    
    // Verify the mock mode banner is shown (since we're in test mode)
    cy.contains('Mock Mode Active').should('be.visible');
  });

  it('should handle file upload and analysis in test mode', () => {
    // Navigate through the setup steps
    cy.get('input[placeholder*="name" i]').type('Test School Project');
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Academic').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Master').click();
    cy.get('button').contains('Next').click();

    // Upload a test file
    cy.fixture('sample-syllabus.pdf').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'sample-syllabus.pdf',
        mimeType: 'application/pdf'
      });
    });

    // Verify the analyze button appears
    cy.contains('Analyze').should('be.visible');
    
    // Click analyze
    cy.contains('Analyze').click();
    
    // Verify loading state
    cy.contains('🧪 Simulating AI analysis').should('be.visible');
    
    // Wait for analysis to complete and success message
    cy.contains('Syllabus analyzed successfully!', { timeout: 10000 }).should('be.visible');
    
    // Verify navigation to extraction results step
    cy.contains('Extraction Complete!', { timeout: 15000 }).should('be.visible');
  });

  it('should allow re-uploading after completion', () => {
    // Complete the initial flow
    cy.get('input[placeholder*="name" i]').type('Test School Project');
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Academic').click();
    cy.get('button').contains('Next').click();
    cy.get('button').contains('Master').click();
    cy.get('button').contains('Next').click();

    // Upload and analyze first file
    cy.fixture('sample-syllabus.pdf').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'sample-syllabus.pdf',
        mimeType: 'application/pdf'
      });
    });

    cy.contains('Analyze').click();
    cy.contains('Syllabus analyzed successfully!', { timeout: 10000 }).should('be.visible');
    cy.contains('Extraction Complete!', { timeout: 15000 }).should('be.visible');

    // Go back to upload step
    cy.get('button').contains('Previous').click();
    
    // Verify we can upload a different file
    cy.get('[data-testid="syllabus-upload-step"]').should('be.visible');
    cy.get('input[type="file"]').should('exist');
    
    // Upload a different file
    cy.fixture('sample-syllabus.pdf').then((fileContent) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: fileContent,
        fileName: 'different-syllabus.pdf',
        mimeType: 'application/pdf'
      });
    });

    // Verify we can analyze the new file
    cy.contains('Analyze').should('be.visible');
  });
}); 