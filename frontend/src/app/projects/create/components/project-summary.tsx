'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, FileText, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectSetup } from '../types';
import { uploadFile, createProject, ProjectData } from '../services/api';
import { 
  SCHOOL_PURPOSE_OPTIONS,
  TEST_LEVEL_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS,
  EVALUATION_TYPE_OPTIONS,
  DATE_TYPE_OPTIONS
} from '../constants';
import { formatFileSize, formatDate } from '../utils';

export function ProjectSummary({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // TODO: Replace with actual auth token
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload files and get their URLs
      const courseFileUrls = await Promise.all(
        setup.courseFiles.map(file => uploadFile(file, 'course-files', authToken))
      );
      const testFileUrls = await Promise.all(
        setup.testFiles.map(file => uploadFile(file, 'test-files', authToken))
      );

      // 2. Prepare project data
      const projectData: ProjectData = {
        name: setup.projectName,
        project_type: 'school', // This is the school setup
        course_name: setup.purpose, // Assuming purpose is course name for now
        goal_description: setup.goal,
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Add other fields from the 'setup' object as needed
      };

      // 3. Create project
      const newProject = await createProject(projectData, authToken);

      // 4. Clear autosave and redirect
      // clearStorage(); // You might need to pass clearStorage down to this component
      router.push(`/projects/${newProject.id}/success`);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPurposeLabel = (value: string) => {
    if (value === 'custom' && setup.customDescription) {
      return setup.customDescription;
    }
    return SCHOOL_PURPOSE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getTestLevelLabel = (value: string) => {
    return TEST_LEVEL_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getGradeLevelLabel = (value: string) => {
    return GRADE_LEVEL_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getTimeframeLabel = (value: string) => {
    return TIMEFRAME_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getFrequencyLabel = (value: string) => {
    return FREQUENCY_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getCollaborationLabel = (value: string) => {
    return COLLABORATION_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getEvaluationTypeLabel = (value: string) => {
    return EVALUATION_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getDateTypeLabel = (value: string) => {
    return DATE_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Setup
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900">Project Summary</CardTitle>
            <p className="text-sm sm:text-base text-slate-600">Review your project configuration before creating</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Project Name</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.projectName}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Purpose</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getPurposeLabel(setup.purpose)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Education Level</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getTestLevelLabel(setup.testLevel)}</p>
                {setup.gradeLevel && (
                  <p className="text-slate-600 text-sm sm:text-base">{getGradeLevelLabel(setup.gradeLevel)}</p>
                )}
              </div>
              {setup.purpose === 'school' && (setup.assignmentDescription || setup.courseFiles.length > 0) && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Course Information</h3>
                  {setup.assignmentDescription && (
                    <p className="text-slate-600 text-sm sm:text-base">{setup.assignmentDescription}</p>
                  )}
                  {setup.courseFiles.length > 0 && (
                    <p className="text-slate-600 text-sm sm:text-base">{setup.courseFiles.length} course documents uploaded</p>
                  )}
                </div>
              )}
              {setup.purpose === 'school' && setup.evaluationTypes.length > 0 && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Evaluation Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {setup.evaluationTypes.map(type => (
                      <Badge key={type} className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                        {getEvaluationTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {setup.purpose === 'school' && setup.importantDates.length > 0 && (
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Important Dates</h3>
                  <p className="text-slate-600 text-sm sm:text-base">{setup.importantDates.length} dates scheduled</p>
                </div>
              )}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Uploaded Files</h3>
                <p className="text-slate-600 text-sm sm:text-base">{(setup.uploadedFiles || []).length} files uploaded</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Timeline</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getTimeframeLabel(setup.timeframe)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Study Frequency</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getFrequencyLabel(setup.studyFrequency)}</p>
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Collaboration</h3>
                <p className="text-slate-600 text-sm sm:text-base">{getCollaborationLabel(setup.collaboration)}</p>
              </div>
            </div>
            
            {setup.goal && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Learning Goal</h3>
                <p className="text-slate-600 text-sm sm:text-base">{setup.goal}</p>
              </div>
            )}

            {setup.purpose === 'school' && setup.courseFiles.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Course Documents</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(setup.courseFiles || []).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {setup.purpose === 'school' && setup.importantDates.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Scheduled Dates</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {setup.importantDates
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((dateItem, index) => {
                      const dateType = DATE_TYPE_OPTIONS.find(opt => opt.value === dateItem.type);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <Badge className={`text-xs ${dateType?.color || 'bg-gray-100 text-gray-800'}`}>
                            {dateType?.label || 'Other'}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{dateItem.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(dateItem.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {(setup.uploadedFiles || []).length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Files</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(setup.uploadedFiles || []).map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" onClick={onBack}>Edit</Button>
              <Button onClick={handleCreateProject} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Project...' : 'Create Project & Start Learning'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 