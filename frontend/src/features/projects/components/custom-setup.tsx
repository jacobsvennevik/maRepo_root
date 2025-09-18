'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Settings, BookOpen, Users, Calendar, Target, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { projectIcons, projectColors, type ProjectType } from '../types';

interface CustomSetupProps {
  onBack: () => void;
}

interface CustomProjectConfig {
  title: string;
  description: string;
  type: ProjectType;
  subjects: string[];
  difficulty: string;
  timeframe: string;
  goal: string;
  studyFrequency: string;
  collaboration: string;
  visibility: string;
  tags: string[];
  customSettings: {
    enableAI: boolean;
    enableCollaboration: boolean;
    enableProgressTracking: boolean;
    enableReminders: boolean;
  };
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', description: 'New to the subject' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some knowledge' },
  { value: 'advanced', label: 'Advanced', description: 'Strong foundation' },
  { value: 'expert', label: 'Expert', description: 'Deep knowledge' }
];

const timeframeOptions = [
  { value: '1-week', label: '1 Week' },
  { value: '2-weeks', label: '2 Weeks' },
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '1-year', label: '1 Year' },
  { value: 'ongoing', label: 'Ongoing' }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: '2-3-times-week', label: '2-3 times per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'flexible', label: 'Flexible' }
];

const collaborationOptions = [
  { value: 'solo', label: 'Solo Learning' },
  { value: 'small-group', label: 'Small Group (2-5 people)' },
  { value: 'large-group', label: 'Large Group (6+ people)' },
  { value: 'mentor', label: 'With a Mentor' },
  { value: 'flexible', label: 'Flexible' }
];

const visibilityOptions = [
  { value: 'private', label: 'Private', description: 'Only you can see this project' },
  { value: 'shared', label: 'Shared', description: 'Invited collaborators can see this project' },
  { value: 'public', label: 'Public', description: 'Anyone can discover this project' }
];

const subjectOptions = [
  { value: 'biology', label: 'Biology', color: 'bg-green-100 text-green-800' },
  { value: 'chemistry', label: 'Chemistry', color: 'bg-blue-100 text-blue-800' },
  { value: 'physics', label: 'Physics', color: 'bg-purple-100 text-purple-800' },
  { value: 'math', label: 'Mathematics', color: 'bg-orange-100 text-orange-800' },
  { value: 'computer-science', label: 'Computer Science', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'literature', label: 'Literature', color: 'bg-red-100 text-red-800' },
  { value: 'history', label: 'History', color: 'bg-amber-100 text-amber-800' },
  { value: 'geography', label: 'Geography', color: 'bg-teal-100 text-teal-800' }
];

export function CustomSetup({ onBack }: CustomSetupProps) {
  const router = useRouter();
  const [config, setConfig] = useState<CustomProjectConfig>({
    title: '',
    description: '',
    type: 'biology',
    subjects: [],
    difficulty: '',
    timeframe: '',
    goal: '',
    studyFrequency: '',
    collaboration: '',
    visibility: 'private',
    tags: [],
    customSettings: {
      enableAI: true,
      enableCollaboration: true,
      enableProgressTracking: true,
      enableReminders: true
    }
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof CustomProjectConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !config.tags.includes(newTag.trim())) {
      setConfig(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSettingToggle = (setting: keyof CustomProjectConfig['customSettings']) => {
    setConfig(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        [setting]: !prev.customSettings[setting]
      }
    }));
  };

  const handleCreateProject = async () => {
    try {
      // TODO: Implement actual project creation API call
      console.log('Creating custom project with config:', config);
      
      // For now, we'll simulate project creation
      const mockProject = {
        id: Math.random().toString(36).substr(2, 9), // Generate random ID
        name: config.title,
        project_type: 'school',
        course_name: config.title,
        goal_description: config.goal,
        study_frequency: config.studyFrequency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Clean up any localStorage data that might exist
      try {
        localStorage.removeItem('project-setup-guided-setup');
        localStorage.removeItem('self-study-guided-setup');
        console.log('🧹 Cleaned up localStorage after successful custom project creation');
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error);
      }
      
      // Navigate to the new project's overview page
      router.push(`/projects/${mockProject.id}/overview`);
    } catch (error) {
      console.error('Failed to create custom project:', error);
      // Handle error (e.g., show a toast notification)
    }
  };

  const isFormValid = () => {
    return config.title.trim() && 
           config.description.trim() && 
           config.subjects.length > 0 &&
           config.difficulty &&
           config.timeframe &&
           config.goal.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Selection
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Custom Setup</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm sm:text-base">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your project title..."
                    value={config.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm sm:text-base">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project..."
                    value={config.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[80px] sm:min-h-[100px] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm sm:text-base">Primary Subject *</Label>
                  <RadioGroup value={config.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
                      {Object.entries(projectIcons).map(([type, Icon]) => (
                        <div
                          key={type}
                          className={`flex flex-col items-center p-2 sm:p-3 border rounded-lg cursor-pointer transition-all ${
                            config.type === type
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('type', type)}
                        >
                          <span className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${(projectColors[type as keyof typeof projectColors] || projectColors.default).split(' ')[1]}`}>
                            {projectIcons[type as keyof typeof projectIcons] || projectIcons.default}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-center">
                            {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Learning Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Learning Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm sm:text-base">Difficulty Level *</Label>
                  <RadioGroup value={config.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
                      {difficultyOptions.map((option) => (
                        <div key={option.value} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <div>
                            <Label htmlFor={option.value} className="text-xs sm:text-sm font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-xs text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Additional Subjects</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-2">
                    {subjectOptions.map((subject) => (
                      <div
                        key={subject.value}
                        onClick={() => handleSubjectToggle(subject.value)}
                        className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-all ${
                          config.subjects.includes(subject.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Badge className={`w-full justify-center text-xs sm:text-sm ${subject.color}`}>
                          {subject.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal" className="text-sm sm:text-base">Learning Goal *</Label>
                  <Textarea
                    id="goal"
                    placeholder="What do you want to achieve with this project?"
                    value={config.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="min-h-[80px] sm:min-h-[100px] mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Schedule & Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-sm sm:text-base">Timeline *</Label>
                    <RadioGroup value={config.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                      <div className="space-y-1 sm:space-y-2 mt-2">
                        {timeframeOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="text-xs sm:text-sm cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Study Frequency *</Label>
                    <RadioGroup value={config.studyFrequency} onValueChange={(value) => handleInputChange('studyFrequency', value)}>
                      <div className="space-y-1 sm:space-y-2 mt-2">
                        {frequencyOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="text-xs sm:text-sm cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Collaboration Style</Label>
                  <RadioGroup value={config.collaboration} onValueChange={(value) => handleInputChange('collaboration', value)}>
                    <div className="space-y-1 sm:space-y-2 mt-2">
                      {collaborationOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="text-xs sm:text-sm cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Visibility & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Visibility & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm sm:text-base">Project Visibility</Label>
                  <RadioGroup value={config.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                    <div className="space-y-1 sm:space-y-2 mt-2">
                      {visibilityOptions.map((option) => (
                        <div key={option.value} className="flex items-start space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                          <div>
                            <Label htmlFor={option.value} className="text-xs sm:text-sm font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-xs text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleAddTag} className="text-xs">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer text-xs" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enableAI" className="text-xs sm:text-sm">AI Assistance</Label>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                    <input
                      type="checkbox"
                      id="enableAI"
                      checked={config.customSettings.enableAI}
                      onChange={() => handleSettingToggle('enableAI')}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enableCollaboration" className="text-xs sm:text-sm">Collaboration Tools</Label>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                    <input
                      type="checkbox"
                      id="enableCollaboration"
                      checked={config.customSettings.enableCollaboration}
                      onChange={() => handleSettingToggle('enableCollaboration')}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enableProgressTracking" className="text-xs sm:text-sm">Progress Tracking</Label>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                    <input
                      type="checkbox"
                      id="enableProgressTracking"
                      checked={config.customSettings.enableProgressTracking}
                      onChange={() => handleSettingToggle('enableProgressTracking')}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enableReminders" className="text-xs sm:text-sm">Study Reminders</Label>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                    <input
                      type="checkbox"
                      id="enableReminders"
                      checked={config.customSettings.enableReminders}
                      onChange={() => handleSettingToggle('enableReminders')}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <Button 
                  onClick={handleCreateProject}
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  * Required fields
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 