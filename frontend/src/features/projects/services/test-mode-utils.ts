// Test mode utilities for realistic backend processing
import { axiosApi } from '@/lib/axios-api';

export interface TestFile {
  name: string;
  content: string; // Base64 encoded PDF content
  type: 'syllabus' | 'course_content' | 'test';
}

// Pre-defined test files with real PDF content
export const TEST_FILES: Record<string, TestFile> = {
  'sample-syllabus.pdf': {
    name: 'sample-syllabus.pdf',
    content: 'JVBERi0xLjQKJcOkw7zDtsO...', // Base64 encoded PDF
    type: 'syllabus'
  },
  'nlp-course-materials.pdf': {
    name: 'nlp-course-materials.pdf', 
    content: 'JVBERi0xLjQKJcOkw7zDtsO...', // Base64 encoded PDF
    type: 'course_content'
  },
  'sample-exam.pdf': {
    name: 'sample-exam.pdf',
    content: 'JVBERi0xLjQKJcOkw7zDtsO...', // Base64 encoded PDF
    type: 'test'
  }
};

/**
 * Convert base64 string to File object
 */
export function base64ToFile(base64: string, filename: string, mimeType: string = 'application/pdf'): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  
  return new File([blob], filename, { type: mimeType });
}

/**
 * Get test file by name
 */
export function getTestFile(filename: string): File | null {
  const testFile = TEST_FILES[filename];
  if (!testFile) {
    console.warn(`Test file ${filename} not found`);
    return null;
  }
  
  return base64ToFile(testFile.content, testFile.name);
}

/**
 * Upload test file to real backend
 */
export async function uploadTestFileToBackend(file: File, uploadType: string): Promise<any> {
  console.log(`🧪 TEST MODE: Uploading test file ${file.name} to real backend`);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'ppt');
  formData.append('upload_type', uploadType);

  try {
    const response = await axiosApi.post('pdf_service/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log(`🧪 TEST MODE: Test file uploaded successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`🧪 TEST MODE: Failed to upload test file:`, error);
    throw error;
  }
}

/**
 * Process test file through real backend
 */
export async function processTestFile(documentId: number): Promise<any> {
  console.log(`🧪 TEST MODE: Processing test document ${documentId} through real backend`);
  
  try {
    // Start processing
    const processResponse = await axiosApi.post(`pdf_service/documents/${documentId}/process/`);
    console.log(`🧪 TEST MODE: Processing started:`, processResponse.data);
    
    // Poll for completion
    const maxAttempts = 30;
    const pollInterval = 2000;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await axiosApi.get(`pdf_service/documents/${documentId}/`);
      const statusData = statusResponse.data;
      
      console.log(`🧪 TEST MODE: Polling attempt ${attempts + 1}:`, statusData.status);
      
      if (statusData.status === 'completed') {
        console.log(`🧪 TEST MODE: Processing completed successfully`);
        return statusData;
      } else if (statusData.status === 'error') {
        throw new Error(`Processing failed: ${statusData.error_message || 'Unknown error'}`);
      }
      
      attempts++;
    }
    
    throw new Error('Processing timed out');
  } catch (error) {
    console.error(`🧪 TEST MODE: Processing failed:`, error);
    throw error;
  }
}

/**
 * Get available test files for selection
 */
export function getAvailableTestFiles(): Array<{ name: string; type: string; description: string }> {
  return Object.entries(TEST_FILES).map(([filename, file]) => ({
    name: filename,
    type: file.type,
    description: `Sample ${file.type.replace('_', ' ')} file for testing`
  }));
} 