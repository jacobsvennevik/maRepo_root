import { useState, useCallback } from 'react';
import { DEFAULTS } from '../constants';
import { transformBackendData, ExtractedData } from '../utils/transformBackendData';

export interface ProjectSetup {
  projectName: string;
  purpose: string;
  testLevel: string;
  timeframe: string;
  goal: string;
  studyFrequency: string;
  collaboration: string;
  learningStyle: string[];
  studyPreference: string[];
  learningDifficulties: string[];
  uploadedFiles: File[];
  importantDates: Array<{
    id: string;
    date: string;
    description: string;
    type: string;
  }>;
  courseFiles: File[];
  testFiles: File[];
  is_draft: boolean;
}

export const useGuidedSetupState = (initialSetup: Partial<ProjectSetup> = {}) => {
  const [setup, setSetup] = useState<ProjectSetup>({ ...DEFAULTS, ...initialSetup });
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string>('');
  const [contentData, setContentData] = useState<any>(null);
  const [contentFileNames, setContentFileNames] = useState<string[]>([]);
  const [isSyllabusAnalysisComplete, setIsSyllabusAnalysisComplete] = useState(false);
  const [isCourseContentAnalysisComplete, setIsCourseContentAnalysisComplete] = useState(false);
  const [isTestAnalysisComplete, setIsTestAnalysisComplete] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [hasSyllabusUploadCompleted, setHasSyllabusUploadCompleted] = useState(false);

  const handleOptionSelect = useCallback((field: keyof ProjectSetup, value: any) => {
    setSetup(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const addDateToSetup = useCallback((newDate: { date: string; description: string; type: string }) => {
    if (!newDate.date || !newDate.description) return false;
    
    setSetup(prev => ({
      ...prev,
      importantDates: [...prev.importantDates, { ...newDate, id: `date-${Date.now()}` }]
    }));
    setHasUnsavedChanges(true);
    return true;
  }, []);

  const removeDateFromSetup = useCallback((index: number) => {
    setSetup(prev => ({
      ...prev,
      importantDates: prev.importantDates.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSyllabusUploadComplete = useCallback((newProjectId: string, backendData: any, fileName?: string) => {
    // Prevent multiple calls
    if (hasSyllabusUploadCompleted) {
      console.log('Syllabus upload already completed, skipping duplicate call');
      return;
    }
    
    setProjectId(newProjectId);
    const transformedData = transformBackendData(backendData);
    setExtractedData(transformedData);
    setSyllabusFileName(fileName || 'Syllabus');
    setIsSyllabusAnalysisComplete(true);
    setHasUnsavedChanges(true);
    setHasSyllabusUploadCompleted(true);
  }, [hasSyllabusUploadCompleted]);

  const handleCourseContentUploadComplete = useCallback((backendData: any, fileNames: string[], files?: File[]) => {
    setContentData(backendData);
    setContentFileNames(fileNames);
    setIsCourseContentAnalysisComplete(true);
    setHasUnsavedChanges(true);
    
    // Update the setup state with the uploaded files
    setSetup(prev => ({
      ...prev,
      courseFiles: files || fileNames.map((fileName, index) => {
        // Create a File object for each processed file
        const file = new File([''], fileName, { type: 'application/pdf' });
        return file;
      })
    }));
  }, []);

  const handleTestUploadComplete = useCallback((extractedTests: any[], fileNames: string[], files?: File[]) => {
    setIsTestAnalysisComplete(true);
    setHasUnsavedChanges(true);
    
    // Update the setup state with the uploaded files
    setSetup(prev => ({
      ...prev,
      testFiles: files || fileNames.map((fileName, index) => {
        // Create a File object for each processed file
        const file = new File([''], fileName, { type: 'application/pdf' });
        return file;
      })
    }));
  }, []);

  const resetSyllabusUploadState = useCallback(() => {
    setIsSyllabusAnalysisComplete(false);
    setHasSyllabusUploadCompleted(false);
  }, []);

  const cleanupState = useCallback(() => {
    setSetup(DEFAULTS);
    setProjectId(null);
    setExtractedData(null);
    setSyllabusFileName('');
    setContentData(null);
    setContentFileNames([]);
    setIsCourseContentAnalysisComplete(false);
    setIsTestAnalysisComplete(false);
    setIsSyllabusAnalysisComplete(false);
    setHasUnsavedChanges(false);
    setHasSyllabusUploadCompleted(false);
  }, []);

  return {
    setup,
    setSetup,
    extractedData,
    setExtractedData,
    syllabusFileName,
    setSyllabusFileName,
    contentData,
    setContentData,
    contentFileNames,
    setContentFileNames,
    isSyllabusAnalysisComplete,
    setIsSyllabusAnalysisComplete,
    isCourseContentAnalysisComplete,
    setIsCourseContentAnalysisComplete,
    isTestAnalysisComplete,
    setIsTestAnalysisComplete,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    projectId,
    setProjectId,
    hasSyllabusUploadCompleted,
    setHasSyllabusUploadCompleted,
    handleOptionSelect,
    addDateToSetup,
    removeDateFromSetup,
    handleSyllabusUploadComplete,
    handleCourseContentUploadComplete,
    handleTestUploadComplete,
    resetSyllabusUploadState,
    cleanupState,
  };
}; 