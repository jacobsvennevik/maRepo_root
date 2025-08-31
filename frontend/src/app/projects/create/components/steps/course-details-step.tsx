import { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Check, 
  HelpCircle,
  GraduationCap,
  FileCheck,
  Users,
  Presentation,
  FlaskConical,
  Hand,
  Home,
  Users2,
  Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AIPreview, AILoading } from "../ai";
import { analyzeUploadedFiles, DetectedDate } from "../../utils/ai-analysis";
import { createDragHandlers, formatFileSize } from "../../utils/file-helpers";

export interface EducationLevelOption {
  value: string;
  label: string;
  description: string;
}

export interface GradeLevelOption {
  value: string;
  label: string;
}

export interface EvaluationTypeOption {
  value: string;
  label: string;
  description: string;
  icon: any;
}

interface CourseDetailsStepProps {
  testLevel: string;
  gradeLevel?: string;
  assignmentDescription?: string;
  courseFiles: File[];
  evaluationTypes: string[];
  onTestLevelChange: (level: string) => void;
  onGradeLevelChange: (grade: string) => void;
  onAssignmentDescriptionChange: (description: string) => void;
  onCourseFilesChange: (files: File[]) => void;
  onCourseFileRemove: (index: number) => void;
  onEvaluationTypeToggle: (evaluationType: string) => void;
  onApplyAITopics: (topics: string[]) => void;
  onApplyAIDates: (dates: DetectedDate[]) => void;
  onApplyAITestTypes: (types: string[]) => void;
  onApplyAIRecommendations: (recommendations: any[]) => void;
  testLevelOptions: EducationLevelOption[];
  gradeLevelOptions: GradeLevelOption[];
  evaluationTypeOptions: EvaluationTypeOption[];
}

export function CourseDetailsStep({
  testLevel,
  gradeLevel,
  assignmentDescription,
  courseFiles,
  evaluationTypes,
  onTestLevelChange,
  onGradeLevelChange,
  onAssignmentDescriptionChange,
  onCourseFilesChange,
  onCourseFileRemove,
  onEvaluationTypeToggle,
  onApplyAITopics,
  onApplyAIDates,
  onApplyAITestTypes,
  onApplyAIRecommendations,
  testLevelOptions,
  gradeLevelOptions,
  evaluationTypeOptions
}: CourseDetailsStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiResults, setAiResults] = useState<{
    topics: any[];
    dates: any[];
    testTypes: any[];
  }>({ topics: [], dates: [], testTypes: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger AI analysis when files are uploaded
  useEffect(() => {
    if (courseFiles.length > 0 && !isAnalyzing && !showAIPreview) {
      analyzeFiles();
    }
  }, [courseFiles]);

  const analyzeFiles = async () => {
    if (courseFiles.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const results = await analyzeUploadedFiles(courseFiles);
      setAiResults(results);
      setShowAIPreview(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }

  // Use shared drag and drop handlers
  const { handleDragOver, handleDragLeave, handleDrop } = createDragHandlers(
    (droppedFiles) => onCourseFilesChange([...courseFiles, ...droppedFiles]),
    setIsDragOver
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onCourseFilesChange([...courseFiles, ...selectedFiles]);
  }, [courseFiles, onCourseFilesChange]);



  const getEvaluationIcon = (type: string) => {
    switch (type) {
      case 'exams': return <FileCheck className="h-4 w-4" />;
      case 'essays': return <FileText className="h-4 w-4" />;
      case 'presentations': return <Presentation className="h-4 w-4" />;
      case 'projects': return <Check className="h-4 w-4" />;
      case 'labs': return <FlaskConical className="h-4 w-4" />;
      case 'participation': return <Hand className="h-4 w-4" />;
      case 'homework': return <Home className="h-4 w-4" />;
      case 'group-work': return <Users2 className="h-4 w-4" />;
      default: return <Check className="h-4 w-4" />;
    }

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-blue-900">Course Details Required</h3>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${testLevel ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Education level selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${(assignmentDescription || courseFiles.length > 0) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Course description or files provided</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${evaluationTypes.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span>Evaluation methods selected</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Complete at least 2 of the 3 sections above to continue
        </p>
      </div>

      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="education" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Education Level
          </TabsTrigger>
          <TabsTrigger value="course" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Course Details
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Evaluation
          </TabsTrigger>
        </TabsList>

        {/* Education Level Tab */}
        <TabsContent value="education" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base font-medium">What's your education level?</Label>
              <button 
                onClick={() => onTestLevelChange('college')}
                className="text-sm text-red-500 hover:text-red-700 underline cursor-pointer"
              >
                Skip this section
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testLevelOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => onTestLevelChange(option.value)}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                    testLevel === option.value
                      ? 'border-blue-500 bg-blue-50 scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      testLevel === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {testLevel === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm sm:text-base font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grade Level for High School */}
            {testLevel === 'high-school' && (
              <div className="space-y-3">
                <Label className="text-sm sm:text-base font-medium">What grade are you in?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gradeLevelOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => onGradeLevelChange(option.value)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        gradeLevel === option.value
                          ? 'border-blue-500 bg-blue-50 scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <Label className="text-sm font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Course Details Tab */}
        <TabsContent value="course" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base font-medium">Describe your course</Label>
              <button 
                onClick={() => onAssignmentDescriptionChange('Course description skipped')}
                className="text-sm text-red-500 hover:text-red-700 underline cursor-pointer"
              >
                Skip this section
              </button>
            </div>
            <Textarea
              placeholder="Tell us about the specific course, its requirements, topics covered, and any special instructions..."
              value={assignmentDescription || ''}
              onChange={(e) => onAssignmentDescriptionChange(e.target.value)}
              className="min-h-[100px]"
            />

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Upload Course Documents (Optional)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50/50 scale-105' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-400 to-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 mb-2">
                      {isDragOver ? 'Drop your course files here!' : 'Upload course materials'}
                    </h4>
                    <p className="text-slate-600 mb-3">
                      Upload syllabus, course materials, or any relevant documents to help us understand your course better.
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Supported formats: PDF, DOCX, PPTX, TXT, PNG, JPG
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      Browse course files
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg"
              />

              {/* Uploaded Files List */}
              {courseFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Course Documents ({courseFiles.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {courseFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCourseFileRemove(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Loading */}
              {isAnalyzing && (
                <AILoading 
                  message="Analyzing your course files..."
                  subMessage="Extracting topics, evaluation methods, and important dates"
                  variant="blue"
                />
              )}

              {/* AI Preview */}
              {showAIPreview && (
                <AIPreview
                  detectedTopics={aiResults.topics}
                  detectedDates={aiResults.dates}
                  detectedTestTypes={aiResults.testTypes}
                  onApplyTopics={onApplyAITopics}
                  onApplyDates={onApplyAIDates}
                  onApplyTestTypes={onApplyAITestTypes}
                  onApplyRecommendations={onApplyAIRecommendations}
                  onDismiss={() => setShowAIPreview(false)}
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Evaluation Types Tab */}
        <TabsContent value="evaluation" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm sm:text-base font-medium">How will you be evaluated?</Label>
              <button 
                onClick={() => onEvaluationTypeToggle('exams')}
                className="text-sm text-red-500 hover:text-red-700 underline cursor-pointer"
              >
                Skip this section
              </button>
            </div>
            <p className="text-sm text-gray-600">Select all the evaluation methods used in this course</p>
            
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evaluationTypeOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => onEvaluationTypeToggle(option.value)}
                    className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                      evaluationTypes.includes(option.value)
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                        evaluationTypes.includes(option.value)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {evaluationTypes.includes(option.value) && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getEvaluationIcon(option.value)}
                          <Label className="text-sm sm:text-base font-medium cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {/* Selected Evaluation Types Summary */}
            {evaluationTypes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Evaluation Methods:</Label>
                <div className="flex flex-wrap gap-2">
                  {evaluationTypes.map((type) => {
                    const option = evaluationTypeOptions.find(opt => opt.value === type);
                    return (
                      <Badge key={type} variant="secondary" className="flex items-center gap-1">
                        {getEvaluationIcon(type)}
                        {option?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} }
}
