'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Check, FileText, ChevronLeft, Calendar, Clock, Users, Target, 
  GraduationCap, BookOpen, FlaskConical, Presentation, FileCheck,
  User, Trophy, Brain, Heart, Eye, Ear, HandIcon, PenTool,
  Coffee, Moon, Sun, Zap, Smartphone, Monitor, Gamepad2,
  Sparkles, Rocket, Star, TrendingUp, Award, Waves, Activity,
  CheckCircle, Eye as EyeIcon, BookOpen as BookOpenIcon, BookMarked
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectSetup } from '../types';
import { uploadFile, createProject, ProjectData } from '../services/api';
import { 
  TIMEFRAME_OPTIONS, 
  FREQUENCY_OPTIONS, 
  TEST_LEVEL_OPTIONS,
  GRADE_LEVEL_OPTIONS
} from '../constants/options';
import { formatFileSize, formatDate } from '../utils/formatters';
import { validateProjectCreateInput, type ProjectCreateInput } from '../types';

// Variant 1: Colorful Dashboard Style
export function ProjectSummaryColorful({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';

  const totalFiles = (setup.courseFiles || []).length + (setup.testFiles || []).length + (setup.uploadedFiles || []).length;
  const upcomingDates = setup.importantDates.filter(date => new Date(date.date) > new Date()).length;

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
      const projectData = validateProjectCreateInput({
        name: setup.projectName,
        project_type: 'school', // This is the school setup
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Include uploaded file URLs
        course_files: courseFileUrls,
        test_files: testFileUrls,
        // Mock mode flags for backend AI mocking
        mock_mode: true,
        seed_syllabus: true,
        seed_tests: true,
        seed_content: true,
        seed_flashcards: false,
      });

      // 3. Create project
      const newProject = await createProject(projectData);

      // 4. Navigate to the new project's overview page
      router.push(`/projects/${newProject.id}/overview`);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with Animation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center hover:scale-105 transition-transform">
            <ChevronLeft size={16} className="mr-1" />
            Back to Setup
          </Button>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-sm font-medium text-purple-700">Almost Ready!</span>
          </div>
        </div>

        {/* Hero Section - More Dynamic */}
        <Card className="overflow-hidden mb-8 border-0 shadow-2xl">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
              <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/15 rounded-full animate-ping"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-6 shadow-lg">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{setup.projectName}</h1>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        <Star className="h-3 w-3 mr-1" />
                        School Project
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold">{totalFiles}</div>
                  <div className="text-lg text-white/80">Study Materials</div>
                  <div className="text-sm text-white/60">Ready to Process</div>
                </div>
              </div>
              
              {/* Enhanced Stats Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: 'Timeline', value: TIMEFRAME_OPTIONS.find(opt => opt.value === setup.timeframe)?.label, color: 'from-blue-400 to-blue-600' },
                  { icon: Clock, label: 'Frequency', value: FREQUENCY_OPTIONS.find(opt => opt.value === setup.studyFrequency)?.label, color: 'from-green-400 to-green-600' },
                  { icon: Trophy, label: 'Level', value: TEST_LEVEL_OPTIONS.find(opt => opt.value === setup.testLevel)?.label, color: 'from-yellow-400 to-yellow-600' }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-r ${stat.color} rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform duration-200`}>
                    <stat.icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-xs text-white/80">{stat.label}</div>
                    <div className="font-bold text-sm">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Enhanced Cards */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Academic Details - Enhanced */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center text-blue-700">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  Academic Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Education Level</h4>
                        <p className="text-gray-600">{TEST_LEVEL_OPTIONS.find(opt => opt.value === setup.testLevel)?.label}</p>
                      </div>
                    </div>
                    {setup.gradeLevel && (
                      <div className="ml-11">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {GRADE_LEVEL_OPTIONS.find(opt => opt.value === setup.gradeLevel)?.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {setup.assignmentDescription && (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <BookMarked className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Course Focus</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{setup.assignmentDescription}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Enhanced Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Study Materials - More Visual */}
            {totalFiles > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center text-green-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      Study Arsenal
                    </span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">{totalFiles} files</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Course Files */}
                  {setup.courseFiles && setup.courseFiles.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <BookOpen className="h-3 w-3 text-blue-600" />
                          </div>
                          Course Materials
                        </h4>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                          {setup.courseFiles.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {setup.courseFiles.slice(0, 2).map((file, index) => (
                          <div key={index} className="group flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-900 truncate">{file.name}</p>
                              <p className="text-xs text-blue-600">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                        {setup.courseFiles.length > 2 && (
                          <div className="text-center py-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                              +{setup.courseFiles.length - 2} more files
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Test Files */}
                  {setup.testFiles && setup.testFiles.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center text-sm">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <FileCheck className="h-3 w-3 text-purple-600" />
                          </div>
                          Test Prep
                        </h4>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                          {setup.testFiles.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {setup.testFiles.slice(0, 2).map((file, index) => (
                          <div key={index} className="group flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                              <FileCheck className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-purple-900 truncate">{file.name}</p>
                              <p className="text-xs text-purple-600">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                        {setup.testFiles.length > 2 && (
                          <div className="text-center py-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-xs">
                              +{setup.testFiles.length - 2} more files
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Important Dates - Enhanced */}
            {setup.importantDates && setup.importantDates.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center text-red-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      Key Dates
                    </span>
                    <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                      {upcomingDates} upcoming
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {setup.importantDates
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 4)
                      .map((dateItem, index) => {
                        const isUpcoming = new Date(dateItem.date) > new Date();
                        return (
                          <div key={index} className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                            isUpcoming 
                              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-yellow-100' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-1 ${
                                isUpcoming ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs ${dateItem.type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {dateItem.type === 'exam' ? 'Exam' : 'Event'}
                                  </Badge>
                                  {isUpcoming && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs animate-bounce">
                                      Upcoming!
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium text-sm text-gray-900 leading-snug">{dateItem.description}</p>
                                <p className="text-xs text-gray-600 mt-1 font-mono">{formatDate(dateItem.date)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {setup.importantDates.length > 4 && (
                      <div className="text-center py-2">
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                          +{setup.importantDates.length - 4} more dates
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Section - More Engaging */}
        <Card className="mt-8 border-0 shadow-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Ready for Liftoff? 🚀</h3>
                  <p className="text-gray-600">Your personalized learning adventure is about to begin!</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      {totalFiles} files processed
                    </span>
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      {upcomingDates} dates tracked
                    </span>
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                      AI tutor ready
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={onBack} className="hover:scale-105 transition-transform">
                  ✏️ Fine-tune Setup
                </Button>
                <Button 
                  onClick={handleCreateProject} 
                  disabled={isSubmitting} 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Magic...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start Learning Journey
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Variant 2: Glass Morphism Style
export function ProjectSummaryGlass({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';
  const totalFiles = (setup.courseFiles || []).length + (setup.testFiles || []).length + (setup.uploadedFiles || []).length;
  const upcomingDates = setup.importantDates.filter(date => new Date(date.date) > new Date()).length;

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
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Include uploaded file URLs
        course_files: courseFileUrls,
        test_files: testFileUrls,
        // Mock mode flags for backend AI mocking
        mock_mode: true,
        seed_syllabus: true,
        seed_tests: true,
        seed_content: true,
        seed_flashcards: false,
        // Add other fields from the 'setup' object as needed
      };

      // 3. Create project
      const newProject = await createProject(projectData);

      // 4. Navigate to the new project's overview page
      router.push(`/projects/${newProject.id}/overview`);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="flex items-center text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Setup
          </Button>
        </div>

        {/* Hero - Glass Card */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg backdrop-blur-sm">
                <Star className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  {setup.projectName}
                </h1>
                <p className="text-white/80 text-lg">School Project</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                {totalFiles}
              </div>
              <div className="text-white/60">Study Materials</div>
            </div>
          </div>
          
          {/* Floating Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Timeline', value: TIMEFRAME_OPTIONS.find(opt => opt.value === setup.timeframe)?.label },
              { icon: Clock, label: 'Frequency', value: FREQUENCY_OPTIONS.find(opt => opt.value === setup.studyFrequency)?.label },
              { icon: Trophy, label: 'Level', value: TEST_LEVEL_OPTIONS.find(opt => opt.value === setup.testLevel)?.label }
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-sm bg-white/10 border border-white/30 rounded-2xl p-4 text-center text-white hover:bg-white/20 transition-all duration-300">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-cyan-300" />
                <div className="text-xs text-white/60">{stat.label}</div>
                <div className="font-semibold text-sm">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Details */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Academic Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <div>
                  <h4 className="font-semibold text-cyan-200 mb-2">Education Level</h4>
                  <p className="text-white/90">{TEST_LEVEL_OPTIONS.find(opt => opt.value === setup.testLevel)?.label}</p>
                </div>
                {setup.assignmentDescription && (
                  <div>
                    <h4 className="font-semibold text-cyan-200 mb-2">Course Focus</h4>
                    <p className="text-white/80 text-sm">{setup.assignmentDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Files */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-cyan-300" />
                  Materials
                </h3>
                <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-300/30">{totalFiles}</Badge>
              </div>
              
              <div className="space-y-3">
                {setup.courseFiles.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <FileText className="h-4 w-4 text-cyan-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm truncate">{file.name}</p>
                      <p className="text-white/60 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            {setup.importantDates.length > 0 && (
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-pink-300" />
                    Key Dates
                  </h3>
                  <Badge className="bg-pink-500/20 text-pink-200 border-pink-300/30">{upcomingDates}</Badge>
                </div>
                
                <div className="space-y-3">
                  {setup.importantDates.slice(0, 3).map((dateItem, index) => {
                    const isUpcoming = new Date(dateItem.date) > new Date();
                    return (
                      <div key={index} className={`p-3 rounded-xl border ${
                        isUpcoming 
                          ? 'bg-yellow-500/10 border-yellow-300/30' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <p className="text-white/90 text-sm font-medium">{dateItem.description}</p>
                        <p className="text-white/60 text-xs mt-1">{formatDate(dateItem.date)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Begin Your Journey?</h3>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Edit Setup
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/30"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Project...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Launch Project
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Variant 3: Gamified Style
export function ProjectSummaryGameified({ setup, onBack }: { setup: ProjectSetup; onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const authToken = '203e2ee2825aaf19fbd5a9a5c4768c243944058c';
  const totalFiles = (setup.courseFiles || []).length + (setup.testFiles || []).length + (setup.uploadedFiles || []).length;
  const upcomingDates = setup.importantDates.filter(date => new Date(date.date) > new Date()).length;

  // Calculate "completion" percentage for progress bars
  const setupCompletion = 85; // This could be calculated based on filled fields
  const readinessLevel = Math.min(100, (totalFiles * 10) + (upcomingDates * 5) + 30);

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
        study_frequency: setup.studyFrequency,
        important_dates: setup.importantDates.map(d => ({ title: d.description, date: d.date })),
        // Include uploaded file URLs
        course_files: courseFileUrls,
        test_files: testFileUrls,
        // Mock mode flags for backend AI mocking
        mock_mode: true,
        seed_syllabus: true,
        seed_tests: true,
        seed_content: true,
        seed_flashcards: false,
        // Add other fields from the 'setup' object as needed
      };

      // 3. Create project
      const newProject = await createProject(projectData);

      // 4. Navigate to the new project's overview page
      router.push(`/projects/${newProject.id}/overview`);

    } catch (error) {
      console.error("Failed to create project:", error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header with XP Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="text-white/80 hover:text-white hover:bg-white/10">
            <ChevronLeft size={16} className="mr-1" />
            Back to Character Creation
          </Button>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-white/60 text-xs">Setup Progress</div>
              <div className="text-white font-bold">{setupCompletion}% Complete</div>
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${setupCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hero - Character Card */}
        <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-purple-500/50 shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {Math.floor(totalFiles / 2) + 1}
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold mb-1">{setup.projectName}</h1>
                  <p className="text-purple-200 mb-2">School Project</p>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/50">
                      <Star className="h-3 w-3 mr-1" />
                      Learning Hero
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50">
                      Level {Math.floor(setupCompletion / 20) + 1}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Stats Panel */}
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">{totalFiles}</div>
                <div className="text-purple-200 text-sm">Items Collected</div>
                <div className="w-16 h-1 bg-purple-700 rounded-full mt-2 mx-auto overflow-hidden">
                  <div className="h-full bg-yellow-400 animate-pulse" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
            
            {/* Skill Points */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Time Mgmt', value: TIMEFRAME_OPTIONS.find(opt => opt.value === setup.timeframe)?.label, level: 3 },
                { icon: Clock, label: 'Focus', value: FREQUENCY_OPTIONS.find(opt => opt.value === setup.studyFrequency)?.label, level: 4 },
                { icon: Brain, label: 'Knowledge', value: TEST_LEVEL_OPTIONS.find(opt => opt.value === setup.testLevel)?.label, level: 5 }
              ].map((skill, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-center text-white">
                  <skill.icon className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
                  <div className="text-xs text-slate-300 mb-1">{skill.label}</div>
                  <div className="font-bold text-xs">{skill.value}</div>
                  <div className="flex justify-center mt-2 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < skill.level ? 'bg-yellow-400' : 'bg-slate-600'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quest Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Quest */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border border-cyan-500/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50">
                <CardTitle className="flex items-center text-cyan-300">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center mr-3">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Main Quest
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-white">
                  <h4 className="font-bold text-lg mb-3 text-cyan-300">Objective:</h4>
                  <p className="text-slate-200 leading-relaxed mb-4">Master your chosen subject and achieve academic excellence!</p>
                  
                  <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                    <span className="text-slate-300">Quest Progress</span>
                    <span className="text-cyan-400 font-bold">{readinessLevel}% Ready</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                      style={{ width: `${readinessLevel}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory */}
          <Card className="bg-slate-800/50 border border-green-500/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-900/50 to-emerald-900/50">
              <CardTitle className="flex items-center text-green-300">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Course Materials */}
                {setup.courseFiles && setup.courseFiles.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                      <div>
                        <div className="text-blue-300 font-medium text-sm">Study Scrolls</div>
                        <div className="text-blue-400/70 text-xs">{setup.courseFiles.length} items</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/50">Common</Badge>
                  </div>
                )}

                {/* Test Materials */}
                {setup.testFiles && setup.testFiles.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center">
                      <FileCheck className="h-5 w-5 text-purple-400 mr-3" />
                      <div>
                        <div className="text-purple-300 font-medium text-sm">Test Arsenal</div>
                        <div className="text-purple-400/70 text-xs">{setup.testFiles.length} items</div>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50">Rare</Badge>
                  </div>
                )}

                {/* Upcoming Events */}
                {upcomingDates > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-400 mr-3" />
                      <div>
                        <div className="text-yellow-300 font-medium text-sm">Active Quests</div>
                        <div className="text-yellow-400/70 text-xs">{upcomingDates} pending</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/50 animate-pulse">Urgent</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements & Action */}
        <Card className="bg-slate-800/50 border border-yellow-500/50 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
                  <p className="text-slate-300 mb-3">🎯 Master Strategist - Complete project setup</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center text-green-400">
                      <Check className="h-4 w-4 mr-1" />
                      Profile created
                    </span>
                    <span className="flex items-center text-green-400">
                      <Check className="h-4 w-4 mr-1" />
                      Materials gathered
                    </span>
                    <span className="flex items-center text-green-400">
                      <Check className="h-4 w-4 mr-1" />
                      Goals set
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  🔧 Modify Build
                </Button>
                <Button 
                  onClick={handleCreateProject} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entering World...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Rocket className="h-4 w-4 mr-2" />
                      Begin Adventure!
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add custom CSS for animations
const customStyles = `
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
`;

// Export the styles to be added to your CSS
export { customStyles };
