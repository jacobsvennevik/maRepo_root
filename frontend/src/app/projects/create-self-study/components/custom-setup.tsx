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
// import { projectIcons, projectColors, type ProjectType } from '../../create/types';

interface CustomSetupProps {
  onBack: () => void;
}

interface CustomProjectConfig {
  title: string;
  description: string;
  type: string;
  topics: string[];
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

const topicOptions = [
  { value: 'technology', label: 'Technology', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'creative-arts', label: 'Creative Arts', color: 'bg-purple-100 text-purple-800' },
  { value: 'business', label: 'Business', color: 'bg-green-100 text-green-800' },
  { value: 'language', label: 'Language', color: 'bg-red-100 text-red-800' },
  { value: 'health-wellness', label: 'Health & Wellness', color: 'bg-blue-100 text-blue-800' },
  { value: 'science', label: 'Science', color: 'bg-teal-100 text-teal-800' },
  { value: 'humanities', label: 'Humanities', color: 'bg-amber-100 text-amber-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

export function CustomSetup({ onBack }: CustomSetupProps) {
  const router = useRouter();
  const [config, setConfig] = useState<CustomProjectConfig>({
    title: '',
    description: '',
    type: 'technology',
    topics: [],
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

  const handleTopicToggle = (topic: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(s => s !== topic)
        : [...prev.topics, topic]
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
        project_type: 'self_study',
        goal_description: config.goal,
        study_frequency: config.studyFrequency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Clean up any localStorage data that might exist
      try {
        localStorage.removeItem('project-setup-guided-setup');
        localStorage.removeItem('self-study-guided-setup');
        console.log('🧹 Cleaned up localStorage after successful custom self-study project creation');
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
           config.topics.length > 0 &&
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
            <span className="text-sm font-medium text-purple-600">Custom Self-Study Setup</span>
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
                  <Label htmlFor="description" className="text-sm sm:text-base">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe your self-study project..."
                    value={config.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Topics *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Select the main topics for your self-study project.</p>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map((topic) => (
                    <Badge
                      key={topic.value}
                      variant={config.topics.includes(topic.value) ? 'default' : 'outline'}
                      className={`cursor-pointer ${config.topics.includes(topic.value) ? 'bg-purple-600 text-white' : topic.color}`}
                      onClick={() => handleTopicToggle(topic.value)}
                    >
                      {topic.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Learning Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Learning Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-sm sm:text-base">Difficulty Level *</Label>
                  <RadioGroup
                    value={config.difficulty}
                    onValueChange={(value) => handleInputChange('difficulty', value)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-2"
                  >
                    {difficultyOptions.map((option) => (
                      <Label key={option.value} htmlFor={`difficulty-${option.value}`} className="cursor-pointer">
                        <Card className={`text-center transition-all ${config.difficulty === option.value ? 'border-purple-500 shadow-lg' : 'hover:shadow-md'}`}>
                          <CardContent className="p-3 sm:p-4">
                            <span className="font-semibold text-xs sm:text-sm">{option.label}</span>
                            <p className="text-xs text-gray-500 hidden sm:block">{option.description}</p>
                          </CardContent>
                        </Card>
                        <RadioGroupItem value={option.value} id={`difficulty-${option.value}`} className="sr-only" />
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="timeframe" className="text-sm sm:text-base">Project Timeframe *</Label>
                  <select
                    id="timeframe"
                    value={config.timeframe}
                    onChange={(e) => handleInputChange('timeframe', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="" disabled>Select a timeframe</option>
                    {timeframeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="goal" className="text-sm sm:text-base">Primary Goal *</Label>
                  <Textarea
                    id="goal"
                    placeholder="What is the main goal of your self-study project?"
                    value={config.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Collaboration & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Collaboration & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="collaboration" className="text-sm sm:text-base">Collaboration Style</Label>
                  <select
                    id="collaboration"
                    value={config.collaboration}
                    onChange={(e) => handleInputChange('collaboration', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="" disabled>Select a style</option>
                    {collaborationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm sm:text-base">Project Visibility</Label>
                   <RadioGroup
                    value={config.visibility}
                    onValueChange={(value) => handleInputChange('visibility', value)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-2"
                  >
                    {visibilityOptions.map((option) => (
                      <Label key={option.value} htmlFor={`visibility-${option.value}`} className="cursor-pointer">
                        <Card className={`text-center transition-all ${config.visibility === option.value ? 'border-purple-500 shadow-lg' : 'hover:shadow-md'}`}>
                          <CardContent className="p-3 sm:p-4">
                            <span className="font-semibold text-xs sm:text-sm">{option.label}</span>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </CardContent>
                        </Card>
                        <RadioGroupItem value={option.value} id={`visibility-${option.value}`} className="sr-only" />
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Tags & Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-sm sm:text-base">Tags</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="tags"
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} className="ml-2">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} &times;
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Settings */}
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm sm:text-base">Power-up Settings</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(config.customSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <input
                          type="checkbox"
                          id={key}
                          checked={value}
                          onChange={() => handleSettingToggle(key as keyof CustomProjectConfig['customSettings'])}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button
              onClick={handleCreateProject}
              disabled={!isFormValid()}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
