/**
 * API Contract Tests - Verify the real endpoints exist and return expected shapes
 * These catch when backend routes change or are missing
 */

describe('API Contract Tests', () => {
  const projectId = '203062be-58d0-4f98-bbd4-33b4ce081276';

  it('flashcard sets endpoint should exist and return expected format', async () => {
    // This would have caught if the endpoint didn't exist
    const response = await fetch(`http://localhost:8000/generation/api/projects/${projectId}/flashcard-sets/`);
    
    // Should get 401 (auth required) not 404 (endpoint missing)  
    expect([200, 401]).toContain(response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(Array.isArray(data) || (data && Array.isArray(data.results))).toBeTruthy();
    } else if (response.status === 401) {
      // 401 means endpoint exists but requires auth - this is good!
      const data = await response.json();
      expect(data.detail).toMatch(/authentication|credentials/i);
    }
  });

  it('project details endpoint should exist', async () => {
    const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`);
    expect([200, 401, 403]).toContain(response.status);
  });

  it('diagnostic sessions endpoint should exist', async () => {  
    const response = await fetch(`http://localhost:8000/generation/api/diagnostic-sessions/?project=${projectId}`);
    expect([200, 401]).toContain(response.status);
  });
});
