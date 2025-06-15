import { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, HelpCircle, CalendarDays, Plus, X, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { AIPreview, AILoading } from "../ai";
import { analyzeUploadedFiles, DetectedDate } from "../../utils/ai-analysis";

const ReactCalendar = dynamic(() => import('react-calendar'), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Loading calendar...</div>
});

interface ImportantDate {
  date: string;
  description: string;
  type: string;
}

interface DateTypeOption {
  value: string;
  label: string;
  color: string;
}

interface TestTimelineStepProps {
  testFiles: File[];
  importantDates: ImportantDate[];
  onTestFilesChange: (files: File[]) => void;
  onTestFileRemove: (index: number) => void;
  onAddDate: () => void;
  onRemoveDate: (index: number) => void;
  onApplyAITopics: (topics: string[]) => void;
  onApplyAIDates: (dates: DetectedDate[]) => void;
  onApplyAITestTypes: (types: string[]) => void;
  onApplyAIRecommendations: (recommendations: any[]) => void;
  dateTypeOptions: DateTypeOption[];
}

export function TestTimelineStep({
  testFiles,
  importantDates,
  onTestFilesChange,
  onTestFileRemove,
  onAddDate,
  onRemoveDate,
  onApplyAITopics,
  onApplyAIDates,
  onApplyAITestTypes,
  onApplyAIRecommendations,
  dateTypeOptions
}: TestTimelineStepProps) {
  const [isTestDragOver, setIsTestDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiResults, setAiResults] = useState<{
    topics: any[];
    dates: any[];
    testTypes: any[];
  }>({ topics: [], dates: [], testTypes: [] });
  const [newDate, setNewDate] = useState({ date: '', description: '', type: 'exam' });
  const testFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger AI analysis when test files are uploaded
  useEffect(() => {
    if (testFiles.length > 0 && !isAnalyzing && !showAIPreview) {
      analyzeTestFiles();
    }
  }, [testFiles]);

  const analyzeTestFiles = async () => {
    if (testFiles.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const results = await analyzeUploadedFiles(testFiles);
      setAiResults(results);
      setShowAIPreview(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsTestDragOver(true);
  }, []);

  const handleTestDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsTestDragOver(false);
  }, []);

  const handleTestDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsTestDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onTestFilesChange([...testFiles, ...droppedFiles]);
  }, [testFiles, onTestFilesChange]);

  const handleTestFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onTestFilesChange([...testFiles, ...selectedFiles]);
  }, [testFiles, onTestFilesChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDateTypeLabel = (value: string) => {
    return dateTypeOptions.find(opt => opt.value === value)?.label || value;
  };

  const getDateTypeColor = (value: string) => {
    return dateTypeOptions.find(opt => opt.value === value)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Previous Tests
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Important Dates
          </TabsTrigger>
        </TabsList>

        {/* Test Upload Tab */}
        <TabsContent value="tests" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-sm sm:text-base font-medium">
              Upload Previous Tests/Exams
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                isTestDragOver 
                  ? 'border-blue-400 bg-blue-50/50 scale-105' 
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50/50'
              }`}
              onDragOver={handleTestDragOver}
              onDragLeave={handleTestDragLeave}
              onDrop={handleTestDrop}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    {isTestDragOver ? 'Drop your test files here!' : 'Upload previous tests and exams'}
                  </h4>
                  <p className="text-slate-600 mb-3">
                    Upload previous exams, quizzes, practice tests, or sample questions to help with preparation.
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Supported formats: PDF, DOCX, PPTX, TXT, PNG, JPG
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => testFileInputRef.current?.click()}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Browse test files
                  </Button>
                </div>
              </div>
            </div>

            {/* Hidden test file input */}
            <input
              ref={testFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleTestFileSelect}
              accept=".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg"
            />

            {/* Uploaded Test Files List */}
            {testFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Test Documents ({testFiles.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {testFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTestFileRemove(index)}
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
                message="Analyzing your test files..."
                subMessage="Extracting question types, difficulty patterns, and key topics"
                variant="purple"
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

            <div className="text-xs sm:text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <HelpCircle className="inline h-4 w-4 mr-1 text-purple-600" />
              <span className="text-purple-800">
                <strong>AI Enhancement:</strong> Uploading previous tests helps our AI understand the format, difficulty level, 
                and question types you'll encounter, enabling better study recommendations!
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Important Dates Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-sm sm:text-base font-medium">Schedule your important dates</Label>
            <p className="text-sm text-gray-600">Add key dates like exams, assignments, and deadlines</p>

            {/* Add New Date Form */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-slate-900">Add New Date</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Date</Label>
                  <Input
                    type="date"
                    value={newDate.date}
                    onChange={(e) => setNewDate(prev => ({ ...prev, date: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Type</Label>
                  <select
                    value={newDate.type}
                    onChange={(e) => setNewDate(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Description</Label>
                  <Input
                    placeholder="e.g., Midterm Exam"
                    value={newDate.description}
                    onChange={(e) => setNewDate(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
              <Button 
                onClick={onAddDate}
                disabled={!newDate.date || !newDate.description}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Date
              </Button>
            </div>

            {/* Important Dates List */}
            {importantDates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Important Dates ({importantDates.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importantDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{formatDate(date.date)}</p>
                          <p className="text-sm text-gray-600">{date.description}</p>
                        </div>
                        <Badge className={`text-xs ${getDateTypeColor(date.type)}`}>
                          {getDateTypeLabel(date.type)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveDate(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importantDates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No important dates added yet</p>
                <p className="text-sm">Add your first date above to get started</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 