'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, FileText, ChevronLeft, Calendar, Clock, Users, Target, 
  GraduationCap, BookOpen, FlaskConical, Presentation, FileCheck,
  User, Trophy, Brain, Heart, Eye, Ear, HandIcon, PenTool,
  Coffee, Moon, Sun, Zap, Smartphone, Monitor, Gamepad2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectSetup } from '../types';
import { uploadFile, createProject, finalizeProject, ProjectData } from '../services/api';
import { 
  EVALUATION_TYPE_OPTIONS,
  DATE_TYPE_OPTIONS
} from '../services/evaluation';
import { 
  SCHOOL_PURPOSE_OPTIONS, 
  PURPOSE_OPTIONS, 
  TEST_LEVEL_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  TIMEFRAME_OPTIONS,
  FREQUENCY_OPTIONS,
  COLLABORATION_OPTIONS
} from '../services/options';
import { formatFileSize, formatDate } from '../services/formatters';

export function ProjectSummary({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // TODO: Replace with actual auth token
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload files and get their URLs
      const courseFileUrls = await Promise.all(
        setup.courseFiles.map(file => uploadFile(file, 'course-files'))
      );
      const testFileUrls = await Promise.all(
        setup.testFiles.map(file => uploadFile(file, 'test-files'))
      );

      // 2. Prepare project data
      const projectData: ProjectData = {
        name: setup.projectName,
        project_type: 'school', // This is the school setup
        course_name: setup.purpose, // Assuming purpose is course name for now
        goal_description: setup.goal,
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Include uploaded file URLs
        course_files: courseFileUrls,
        test_files: testFileUrls,
        // Add other fields from the 'setup' object as needed
      };

      // 3. Create project
      const newProject = await createProject(projectData);

      // 4. Finalize project (set is_draft to false)
      await finalizeProject(newProject.id);

      // 5. Clean up localStorage after successful project creation
      try {
        localStorage.removeItem('project-setup-guided-setup');
        console.log('🧹 Cleaned up localStorage after successful project creation');
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error);
      }

      // 6. Navigate to the new project's overview page
      router.push(`/projects/${newProject.id}/overview`);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions to get labels from constants
  const getPurposeLabel = (value: string) => {
    if (value === 'custom' && setup.customDescription) {
      return setup.customDescription;
    }
    return PURPOSE_OPTIONS.find(opt => opt.value === value)?.label || 
           SCHOOL_PURPOSE_OPTIONS.find(opt => opt.value === value)?.label || value;
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

  // Helper to format learning preferences
  const formatLearningPreference = (value: string | string[] | undefined | null) => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  // Calculate study summary stats
  const totalFiles = (setup.courseFiles || []).length + (setup.testFiles || []).length + (setup.uploadedFiles || []).length;
  const totalFileSize = [...(setup.courseFiles || []), ...(setup.testFiles || []), ...(setup.uploadedFiles || [])]
    .reduce((total, file) => total + file.size, 0);
  const upcomingDates = setup.importantDates.filter(date => new Date(date.date) > new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Setup
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Check className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{setup.projectName}</h1>
                      <p className="text-blue-100">{getPurposeLabel(setup.purpose || '')}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{totalFiles}</div>
                  <div className="text-sm text-blue-100">Files Uploaded</div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs text-blue-100">Timeline</div>
                  <div className="font-semibold">{getTimeframeLabel(setup.timeframe)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs text-blue-100">Frequency</div>
                  <div className="font-semibold">{getFrequencyLabel(setup.studyFrequency)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs text-blue-100">Collaboration</div>
                  <div className="font-semibold">{getCollaborationLabel(setup.collaboration || '')}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Trophy className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs text-blue-100">Level</div>
                  <div className="font-semibold">{getTestLevelLabel(setup.testLevel)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Core Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Academic Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Education Level</h4>
                      <p className="text-gray-600">{getTestLevelLabel(setup.testLevel)}</p>
                      {setup.gradeLevel && (
                        <p className="text-sm text-gray-500">{getGradeLevelLabel(setup.gradeLevel)}</p>
                      )}
                    </div>
                    {setup.assignmentDescription && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Course Description</h4>
                        <p className="text-gray-600 text-sm">{setup.assignmentDescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Preferences */}
              {(setup.learningStyle || setup.studyPreference) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Learning Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {setup.learningStyle && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Learning Style</h4>
                          <div className="flex flex-wrap gap-1">
                            {formatLearningPreference(setup.learningStyle).split(', ').filter(style => style.trim() !== '').map(style => (
                              <Badge key={style} variant="outline" className="text-xs">
                                {style === 'visual' && <Eye className="h-3 w-3 mr-1" />}
                                {style === 'auditory' && <Ear className="h-3 w-3 mr-1" />}
                                {style === 'kinesthetic' && <HandIcon className="h-3 w-3 mr-1" />}
                                {style === 'reading-writing' && <PenTool className="h-3 w-3 mr-1" />}
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {setup.studyPreference && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Study Preferences</h4>
                          <div className="flex flex-wrap gap-1">
                            {formatLearningPreference(setup.studyPreference).split(', ').filter(pref => pref.trim() !== '').map(pref => (
                              <Badge key={pref} variant="outline" className="text-xs">
                                {pref === 'morning' && <Sun className="h-3 w-3 mr-1" />}
                                {pref === 'evening' && <Moon className="h-3 w-3 mr-1" />}
                                {pref === 'short-bursts' && <Zap className="h-3 w-3 mr-1" />}
                                {pref === 'long-sessions' && <Coffee className="h-3 w-3 mr-1" />}
                                {pref === 'mobile' && <Smartphone className="h-3 w-3 mr-1" />}
                                {pref === 'desktop' && <Monitor className="h-3 w-3 mr-1" />}
                                {pref === 'interactive' && <Gamepad2 className="h-3 w-3 mr-1" />}
                                {pref.charAt(0).toUpperCase() + pref.slice(1).replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Goal */}
              {setup.goal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Learning Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{setup.goal}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Files & Dates */}
            <div className="space-y-6">
              
              {/* Study Materials */}
              {totalFiles > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Study Materials
                      </span>
                      <Badge variant="secondary">{totalFiles} files</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Course Files */}
                    {setup.courseFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Course Materials ({setup.courseFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {setup.courseFiles.slice(0, 3).map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="flex-1 truncate text-blue-800">{file.name}</span>
                              <span className="text-blue-600">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                          {setup.courseFiles.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{setup.courseFiles.length - 3} more files
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Test Files */}
                    {setup.testFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FileCheck className="h-4 w-4 mr-1" />
                          Test Materials ({setup.testFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {setup.testFiles.slice(0, 3).map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                              <FileCheck className="h-3 w-3 text-purple-600" />
                              <span className="flex-1 truncate text-purple-800">{file.name}</span>
                              <span className="text-purple-600">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                          {setup.testFiles.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{setup.testFiles.length - 3} more files
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Other Files */}
                    {setup.uploadedFiles && setup.uploadedFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Other Materials ({setup.uploadedFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {setup.uploadedFiles.slice(0, 3).map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                              <FileText className="h-3 w-3 text-gray-600" />
                              <span className="flex-1 truncate text-gray-800">{file.name}</span>
                              <span className="text-gray-600">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                          {setup.uploadedFiles.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{setup.uploadedFiles.length - 3} more files
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                                         <div className="border-t border-gray-200 pt-3 mt-3">
                       <div className="text-xs text-gray-500 text-center">
                         Total: {formatFileSize(totalFileSize)}
                       </div>
                     </div>
                  </CardContent>
                </Card>
              )}

              {/* Important Dates */}
              {setup.importantDates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Important Dates
                      </span>
                      <Badge variant="secondary">{upcomingDates} upcoming</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {setup.importantDates
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((dateItem, index) => {
                          const dateType = DATE_TYPE_OPTIONS.find(opt => opt.value === dateItem.type);
                          const isUpcoming = new Date(dateItem.date) > new Date();
                          return (
                            <div key={index} className={`p-3 rounded-lg border ${isUpcoming ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <Badge className={`text-xs mr-2 ${dateType?.color || 'bg-gray-100 text-gray-800'}`}>
                                      {dateType?.label || 'Other'}
                                    </Badge>
                                    {isUpcoming && (
                                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                        Upcoming
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-sm text-gray-900">{dateItem.description}</p>
                                  <p className="text-xs text-gray-600 mt-1">{formatDate(dateItem.date)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Ready to start learning?</h3>
                  <p className="text-sm text-gray-600">Your personalized study plan is ready to be created.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onBack}>
                    Edit Setup
                  </Button>
                  <Button onClick={handleCreateProject} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {isSubmitting ? 'Creating Project...' : 'Create Project & Start Learning'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
