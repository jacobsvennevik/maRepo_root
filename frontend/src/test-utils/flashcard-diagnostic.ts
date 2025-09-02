/**
 * Flashcard Generation Diagnostic Tests
 * 
 * This file contains diagnostic tests to verify the flashcard generation API
 * is working correctly after fixing the URL routing issue.
 */

export interface MockFlashcardPayload {
  method: 'files';
  files: Array<{ name: string; size: number }>;
  existing_files: string[];
  deck_title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content_type: 'mixed' | 'text' | 'image';
  language: string;
  tags_csv: string;
  mock_mode: boolean;
}

export interface MockFlashcardResponse {
  mock_mode: boolean;
  mock_banner?: string;
  description?: string;
  learning_objectives?: string[];
  themes?: string[];
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: string;
    tags?: string[];
  }>;
}

/**
 * Test the flashcard generation endpoint with mock data
 */
export async function testFlashcardGeneration(
  projectId: string,
  mockPayload: MockFlashcardPayload
): Promise<{ success: boolean; response?: MockFlashcardResponse; error?: string }> {
  try {
    console.log('🧪 Testing flashcard generation endpoint...');
    console.log('📍 URL:', `/generation/api/projects/${projectId}/flashcards/generate/`);
    console.log('📦 Payload:', mockPayload);

    const response = await fetch(`/generation/api/projects/${projectId}/flashcards/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
      },
      body: JSON.stringify(mockPayload),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    console.log('✅ API Success:', data);

    return {
      success: true,
      response: data as MockFlashcardResponse
    };

  } catch (error) {
    console.error('💥 Fetch Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a sample mock payload for testing
 */
export function createMockPayload(): MockFlashcardPayload {
  return {
    method: 'files',
    files: [
      { name: 'sample-notes.pdf', size: 1024000 },
      { name: 'lecture-slides.pdf', size: 2048000 }
    ],
    existing_files: [],
    deck_title: 'Test Flashcard Set',
    difficulty: 'medium',
    content_type: 'mixed',
    language: 'English',
    tags_csv: 'flashcards,study,learning,test',
    mock_mode: true
  };
}

/**
 * Run comprehensive diagnostic tests
 */
export async function runFlashcardDiagnostics(projectId: string): Promise<void> {
  console.log('🔍 Starting Flashcard Generation Diagnostics...');
  console.log('=' .repeat(50));

  // Test 1: Basic endpoint accessibility
  console.log('\n🧪 Test 1: Endpoint Accessibility');
  const test1 = await testFlashcardGeneration(projectId, createMockPayload());
  
  if (test1.success) {
    console.log('✅ Test 1 PASSED: Endpoint is accessible');
  } else {
    console.log('❌ Test 1 FAILED:', test1.error);
  }

  // Test 2: Mock mode functionality
  if (test1.success && test1.response) {
    console.log('\n🧪 Test 2: Mock Mode Functionality');
    if (test1.response.mock_mode) {
      console.log('✅ Test 2 PASSED: Mock mode is working');
      console.log('📝 Mock banner:', test1.response.mock_banner);
    } else {
      console.log('❌ Test 2 FAILED: Mock mode not enabled');
    }
  }

  // Test 3: Response structure validation
  if (test1.success && test1.response) {
    console.log('\n🧪 Test 3: Response Structure Validation');
    const hasRequiredFields = test1.response.flashcards && 
                             test1.response.flashcards.length > 0;
    
    if (hasRequiredFields) {
      console.log('✅ Test 3 PASSED: Response has required structure');
      console.log(`📊 Generated ${test1.response.flashcards.length} flashcards`);
    } else {
      console.log('❌ Test 3 FAILED: Response missing required fields');
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🔍 Diagnostics Complete');
}

/**
 * Test the flashcard set creation endpoint
 */
export async function testFlashcardSetCreation(
  projectId: string,
  flashcardData: any
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    console.log('🧪 Testing flashcard set creation endpoint...');
    console.log('📍 URL:', `/generation/api/projects/${projectId}/flashcard-sets/`);

    const response = await fetch(`/generation/api/projects/${projectId}/flashcard-sets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
      },
      body: JSON.stringify(flashcardData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: `HTTP ${response.status}: ${JSON.stringify(errorData)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      response: data
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
