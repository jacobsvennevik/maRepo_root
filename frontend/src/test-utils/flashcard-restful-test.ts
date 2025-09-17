import { axiosApi } from '@/lib/axios-api';

export interface FlashcardSetTest {
  id: number;
  title: string;
  description: string;
  created_at: string;
  total_cards: number;
  due_cards: number;
  learning_cards: number;
  review_cards: number;
  new_cards: number;
  average_accuracy: number;
}

export interface CreateFlashcardSetResponse {
  id: number;
  title: string;
  description: string;
  created_at: string;
  linked: boolean;
  created: boolean;
  link_created: boolean;
}

export async function testRestfulFlashcardEndpoints(projectId: string) {
  console.log('🧪 Testing RESTful flashcard endpoints...');
  
  try {
    // Test 1: GET /api/projects/{projectId}/flashcard-sets/
    console.log('📋 Test 1: Listing flashcard sets...');
    const listResponse = await axiosApi.get(`projects/${projectId}/flashcard-sets/`);
    console.log('✅ List response:', listResponse.data);
    
    // Test 2: POST /api/projects/{projectId}/flashcard-sets/ (create)
    console.log('📝 Test 2: Creating flashcard set...');
    const createData = {
      title: `Test Set ${Date.now()}`,
      description: 'Test flashcard set for RESTful API',
      flashcards: [
        { front: 'What is REST?', back: 'Representational State Transfer' },
        { front: 'What is idempotent?', back: 'Multiple identical requests have the same effect as a single request' }
      ]
    };
    
    const createResponse = await axiosApi.post(`projects/${projectId}/flashcard-sets/`, createData);
    console.log('✅ Create response:', createResponse.data);
    console.log('📍 Location header:', createResponse.headers.location);
    
    // Test 3: GET again to verify the set appears
    console.log('📋 Test 3: Verifying set appears in list...');
    const listResponse2 = await axiosApi.get(`projects/${projectId}/flashcard-sets/`);
    console.log('✅ Updated list response:', listResponse2.data);
    
    // Test 4: POST same data again (idempotency test)
    console.log('🔄 Test 4: Testing idempotency...');
    const createResponse2 = await axiosApi.post(`projects/${projectId}/flashcard-sets/`, createData);
    console.log('✅ Idempotent create response:', createResponse2.data);
    
    return {
      success: true,
      listCount: listResponse2.data.count,
      createdSet: createResponse.data,
      idempotentResult: createResponse2.data
    };
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
}

export async function testFlashcardDueEndpoint(projectId: string) {
  console.log('📅 Testing flashcard due endpoint...');
  
  try {
    const dueResponse = await axiosApi.get(`projects/${projectId}/flashcards/due/?limit=10`);
    console.log('✅ Due response:', dueResponse.data);
    
    return {
      success: true,
      dueData: dueResponse.data
    };
  } catch (error: any) {
    console.error('❌ Due test failed:', error);
    return {
      success: false,
      error: error.message,
      response: error.response?.data
    };
  }
}
