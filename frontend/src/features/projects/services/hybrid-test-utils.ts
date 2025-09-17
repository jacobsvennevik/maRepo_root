// Hybrid test utilities - Use mock data but process through real backend
import { axiosApi } from '@/lib/axios-api';
import { 
  MOCK_SYLLABUS_PROCESSED_DOCUMENT, 
  MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT,
  MOCK_PROCESSED_TESTS,
  simulateProcessingDelay 
} from '../services/mock-data';

export interface MockBackendResponse {
  id: number;
  original_text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processed_data?: any;
}

/**
 * Set test mode environment variable for backend
 */
function setTestModeEnvironment() {
  // Set a custom header to indicate test mode
  if (axiosApi.defaults && axiosApi.defaults.headers) {
    if (!axiosApi.defaults.headers.common) {
      axiosApi.defaults.headers.common = {};
    }
    axiosApi.defaults.headers.common['X-Test-Mode'] = 'true';
  }
  
  // Also try to set environment variable (may not work in browser)
  if (typeof window !== 'undefined') {
    (window as any).TEST_MODE = 'true';
  }
}

/**
 * Create mock File objects for testing
 */
function createMockFiles(fileNames: string[], uploadType: string): File[] {
  return fileNames.map((fileName, index) => {
    const content = `Mock ${uploadType} content for ${fileName}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    return new File([blob], fileName, { type: 'application/pdf' });
  });
}

/**
 * Upload mock data to backend and get real processing response
 */
export async function uploadMockDataToBackend(
  mockData: any, 
  uploadType: string,
  fileName: string
): Promise<MockBackendResponse> {
  console.log(`🧪 HYBRID MODE: Uploading mock data for ${fileName} to real backend`);
  
  // Set test mode environment
  setTestModeEnvironment();
  
  try {
    // Create a mock file from the mock data
    const mockFile = createMockFileFromData(mockData, fileName);
    
    // Upload to real backend
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('file_type', 'pdf');
    formData.append('upload_type', uploadType);

    const uploadResponse = await axiosApi.post('pdf_service/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Test-Mode': 'true', // Ensure test mode header is set
      }
    });
    
    console.log(`🧪 HYBRID MODE: Mock data uploaded successfully:`, uploadResponse.data);
    
    // Return the real backend response with mock data
    return {
      ...uploadResponse.data,
      original_text: mockData.original_text || "Mock document content",
      metadata: mockData.metadata || mockData,
      processed_data: mockData.metadata || mockData
    };
    
  } catch (error) {
    console.error(`🧪 HYBRID MODE: Failed to upload mock data:`, error);
    
    // Fallback to pure mock data if backend fails
    return {
      id: Math.floor(Math.random() * 1000),
      original_text: mockData.original_text || "Mock document content",
      metadata: mockData.metadata || mockData,
      status: 'completed',
      processed_data: mockData.metadata || mockData
    };
  }
}

/**
 * Process mock data through real backend pipeline
 */
export async function processMockDataThroughBackend(
  documentId: number,
  mockData: any
): Promise<MockBackendResponse> {
  console.log(`🧪 HYBRID MODE: Processing mock data through real backend pipeline`);
  
  // Set test mode environment
  setTestModeEnvironment();
  
  try {
    // Start real backend processing
    const processResponse = await axiosApi.post(`pdf_service/documents/${documentId}/process/`, {}, {
      headers: {
        'X-Test-Mode': 'true', // Ensure test mode header is set
      }
    });
    console.log(`🧪 HYBRID MODE: Real processing started:`, processResponse.data);
    
    // Simulate processing time (realistic delay)
    await simulateProcessingDelay(2000, 4000);
    
    // Poll for completion
    const maxAttempts = 15;
    const pollInterval = 2000;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await axiosApi.get(`pdf_service/documents/${documentId}/`, {
          headers: {
            'X-Test-Mode': 'true', // Ensure test mode header is set
          }
        });
        const statusData = statusResponse.data;
        
        console.log(`🧪 HYBRID MODE: Polling attempt ${attempts + 1}:`, statusData.status);
        
        if (statusData.status === 'completed') {
          console.log(`🧪 HYBRID MODE: Real processing completed, using mock data as fallback`);
          
          // Get the processed data from backend
          const processedDataResponse = await axiosApi.get(`pdf_service/documents/${documentId}/processed_data/`, {
            headers: {
              'X-Test-Mode': 'true', // Ensure test mode header is set
            }
          });
          
          return {
            id: documentId,
            original_text: mockData.original_text || "Mock document content",
            metadata: processedDataResponse.data?.data || mockData.metadata || mockData,
            status: 'completed',
            processed_data: processedDataResponse.data?.data || mockData.metadata || mockData
          };
        }
        
        attempts += 1;
      } catch (pollError) {
        console.error(`🧪 HYBRID MODE: Polling error:`, pollError);
        attempts += 1;
      }
    }
    
    console.log(`🧪 HYBRID MODE: Processing timeout, using mock data as fallback`);
    
    // Return mock data as fallback
    return {
      id: documentId,
      original_text: mockData.original_text || "Mock document content",
      metadata: mockData.metadata || mockData,
      status: 'completed',
      processed_data: mockData.metadata || mockData
    };
    
  } catch (error) {
    console.error(`🧪 HYBRID MODE: Processing failed, using mock data:`, error);
    
    // Return mock data as fallback
    return {
      id: documentId,
      original_text: mockData.original_text || "Mock document content",
      metadata: mockData.metadata || mockData,
      status: 'completed',
      processed_data: mockData.metadata || mockData
    };
  }
}

/**
 * Create a mock file from mock data
 */
function createMockFileFromData(mockData: any, fileName: string): File {
  // Create a simple text representation of the mock data
  const content = JSON.stringify(mockData, null, 2);
  const blob = new Blob([content], { type: 'application/pdf' });
  return new File([blob], fileName, { type: 'application/pdf' });
}

/**
 * Get appropriate mock data based on upload type
 */
export function getMockDataForType(uploadType: string, fileName: string): any {
  switch (uploadType) {
    case 'syllabus':
      return MOCK_SYLLABUS_PROCESSED_DOCUMENT;
    case 'learning_materials':
    case 'course_content':
      return MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT;
    case 'test_files':
      return MOCK_PROCESSED_TESTS[0];
    default:
      return MOCK_SYLLABUS_PROCESSED_DOCUMENT;
  }
}

/**
 * Enhanced hybrid upload and process function that properly updates state
 */
export async function hybridUploadAndProcess(
  files: File[],
  uploadType: string,
  onProgress?: (progress: number) => void,
  onStateUpdate?: (files: File[], data: any[]) => void
): Promise<MockBackendResponse[]> {
  console.log(`🧪 HYBRID MODE: Processing ${files.length} files through real backend with mock data`);
  
  // Set test mode environment
  setTestModeEnvironment();
  
  const results: MockBackendResponse[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Update progress
    if (onProgress) {
      onProgress((i / files.length) * 50); // First 50% for upload
    }
    
    // Get appropriate mock data
    const mockData = getMockDataForType(uploadType, file.name);
    
    try {
      // Upload mock data to real backend
      const uploadResult = await uploadMockDataToBackend(mockData, uploadType, file.name);
      
      // Update progress
      if (onProgress) {
        onProgress(50 + (i / files.length) * 25); // 50-75% for processing
      }
      
      // Process through real backend
      const processResult = await processMockDataThroughBackend(uploadResult.id, mockData);
      
      // Update progress
      if (onProgress) {
        onProgress(75 + (i / files.length) * 25); // 75-100% for completion
      }
      
      results.push(processResult);
      
    } catch (error) {
      console.error(`🧪 HYBRID MODE: Failed to process ${file.name}:`, error);
      
      // Fallback to pure mock data
      results.push({
        id: Math.floor(Math.random() * 1000),
        original_text: mockData.original_text || "Mock document content",
        metadata: mockData.metadata || mockData,
        status: 'completed',
        processed_data: mockData.metadata || mockData
      });
    }
  }
  
  // 🔧 CRITICAL FIX: Update parent state with files and data
  // This ensures the Next button gets activated
  if (onStateUpdate) {
    console.log(`🧪 HYBRID MODE: Updating parent state with ${files.length} files and ${results.length} results`);
    onStateUpdate(files, results);
  }
  
  return results;
}

/**
 * Enhanced mock upload function that properly handles state updates
 */
export async function enhancedMockUpload(
  files: File[],
  uploadType: string,
  onProgress?: (progress: number) => void,
  onStateUpdate?: (files: File[], data: any[]) => void
): Promise<MockBackendResponse[]> {
  console.log(`🧪 ENHANCED MOCK: Processing ${files.length} files with proper state updates`);
  
  // Simulate realistic processing time
  const totalTime = 2000 + Math.random() * 2000;
  const stepTime = totalTime / files.length;
  
  const results: MockBackendResponse[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Update progress
    if (onProgress) {
      onProgress((i / files.length) * 100);
    }
    
    // Get appropriate mock data
    const mockData = getMockDataForType(uploadType, file.name);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, stepTime));
    
    // Create mock result
    const mockResult: MockBackendResponse = {
      id: Math.floor(Math.random() * 1000) + i,
      original_text: mockData.original_text || `Mock content for ${file.name}`,
      metadata: mockData.metadata || mockData,
      status: 'completed',
      processed_data: mockData.metadata || mockData
    };
    
    results.push(mockResult);
  }
  
  // 🔧 CRITICAL FIX: Update parent state with files and data
  // This ensures the Next button gets activated
  if (onStateUpdate) {
    console.log(`🧪 ENHANCED MOCK: Updating parent state with ${files.length} files and ${results.length} results`);
    onStateUpdate(files, results);
  }
  
  return results;
} 