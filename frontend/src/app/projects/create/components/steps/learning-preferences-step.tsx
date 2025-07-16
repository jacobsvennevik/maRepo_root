'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  Users, 
  Eye, 
  MessageSquare, 
  Hand,
  Target,
  FileText,
  PenTool,
  Lightbulb,
  Sparkles
} from "lucide-react";

interface LearningPreferencesStepProps {
  courseType: string | string[];
  learningStyle: string | string[];
  assessmentType: string | string[];
  studyPreference: string | string[];
  learningDifficulties: string;
  onCourseTypeChange: (value: string | string[]) => void;
  onLearningStyleChange: (value: string | string[]) => void;
  onAssessmentTypeChange: (value: string | string[]) => void;
  onStudyPreferenceChange: (value: string | string[]) => void;
  onLearningDifficultiesChange: (value: string) => void;
}

const COURSE_TYPE_OPTIONS = [
  { value: 'stem', label: 'STEM (Science, Technology, Engineering, Math)', icon: Brain },
  { value: 'humanities', label: 'Humanities (Literature, History, Philosophy)', icon: BookOpen },
  { value: 'language', label: 'Language Learning', icon: MessageSquare },
  { value: 'business', label: 'Business & Economics', icon: Target },
  { value: 'arts', label: 'Arts & Creative Studies', icon: PenTool },
  { value: 'mixed', label: 'Mixed / Multiple Subjects', icon: Lightbulb },
];

const LEARNING_STYLE_OPTIONS = [
  { value: 'visual', label: 'Visual (diagrams, charts, images)', icon: Eye },
  { value: 'verbal', label: 'Verbal (reading, writing, discussion)', icon: MessageSquare },
  { value: 'kinesthetic', label: 'Kinesthetic (hands-on, movement)', icon: Hand },
  { value: 'mixed', label: 'Mixed approach', icon: Brain },
  { value: 'unsure', label: 'Not sure / No preference', icon: Lightbulb },
];

const ASSESSMENT_TYPE_OPTIONS = [
  { value: 'cumulative-final', label: 'Cumulative final exam', icon: FileText },
  { value: 'regular-quizzes', label: 'Regular quizzes and tests', icon: Target },
  { value: 'essays-projects', label: 'Essays and projects', icon: PenTool },
  { value: 'mixed-assessments', label: 'Mix of all types', icon: Brain },
];

const STUDY_PREFERENCE_OPTIONS = [
  { value: 'alone', label: 'Alone (independent study)', icon: BookOpen },
  { value: 'groups', label: 'In groups (collaborative study)', icon: Users },
  { value: 'mixed', label: 'Mix of both', icon: Brain },
];

export function LearningPreferencesStep({
  courseType,
  learningStyle,
  assessmentType,
  studyPreference,
  learningDifficulties,
  onCourseTypeChange,
  onLearningStyleChange,
  onAssessmentTypeChange,
  onStudyPreferenceChange,
  onLearningDifficultiesChange
}: LearningPreferencesStepProps) {
  // Handle course type as single selection, others as multi-select
  const selectedCourseType = Array.isArray(courseType) ? courseType[0] || '' : (courseType || '');
  const selectedLearningStyles = Array.isArray(learningStyle) ? learningStyle : (learningStyle ? [learningStyle] : []);
  const selectedAssessmentTypes = Array.isArray(assessmentType) ? assessmentType : (assessmentType ? [assessmentType] : []);
  const selectedStudyPreferences = Array.isArray(studyPreference) ? studyPreference : (studyPreference ? [studyPreference] : []);

  const handleCourseTypeChange = (value: string) => {
    onCourseTypeChange(value);
  };

  const handleLearningStyleToggle = (value: string) => {
    const newSelection = selectedLearningStyles.includes(value)
      ? selectedLearningStyles.filter(item => item !== value)
      : [...selectedLearningStyles, value];
    onLearningStyleChange(newSelection);
  };

  const handleAssessmentTypeToggle = (value: string) => {
    const newSelection = selectedAssessmentTypes.includes(value)
      ? selectedAssessmentTypes.filter(item => item !== value)
      : [...selectedAssessmentTypes, value];
    onAssessmentTypeChange(newSelection);
  };

  const handleStudyPreferenceToggle = (value: string) => {
    const newSelection = selectedStudyPreferences.includes(value)
      ? selectedStudyPreferences.filter(item => item !== value)
      : [...selectedStudyPreferences, value];
    onStudyPreferenceChange(newSelection);
  };

  const handleDifficultiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onLearningDifficultiesChange(e.target.value);
  };

  // Helper to show auto-population badge
  const AutoPopulatedBadge = () => (
    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
      <Sparkles className="h-3 w-3 mr-1" />
      Auto-detected
    </Badge>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Course Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Label className="text-base font-medium text-gray-900">
              What type of course are you trying to master?
            </Label>
            {selectedCourseType && <AutoPopulatedBadge />}
          </div>
          <RadioGroup value={selectedCourseType} onValueChange={handleCourseTypeChange}>
            <div className="space-y-3">
              {COURSE_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={option.value}
                      id={`course-${option.value}`}
                      className="mt-1"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <Icon className="h-4 w-4 text-blue-600" />
                      <Label 
                        htmlFor={`course-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Learning Style */}
        <div>
          <Label className="text-base font-medium text-gray-900 mb-4 block">
            What is your preferred learning style? (Select all that apply)
          </Label>
          <div className="space-y-3">
            {LEARNING_STYLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedLearningStyles.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`learning-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleLearningStyleToggle(option.value)}
                    className="mt-1"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Icon className="h-4 w-4 text-purple-600" />
                    <Label 
                      htmlFor={`learning-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Label className="text-base font-medium text-gray-900">
              Are you preparing for a cumulative final exam, regular quizzes, essays, or projects? (Select all that apply)
            </Label>
            {selectedAssessmentTypes.length > 0 && <AutoPopulatedBadge />}
          </div>
          <div className="space-y-3">
            {ASSESSMENT_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedAssessmentTypes.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`assessment-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleAssessmentTypeToggle(option.value)}
                    className="mt-1"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Icon className="h-4 w-4 text-orange-600" />
                    <Label 
                      htmlFor={`assessment-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Preference */}
        <div>
          <Label className="text-base font-medium text-gray-900 mb-4 block">
            Do you study better alone, in groups, or using a mix of both? (Select all that apply)
          </Label>
          <div className="space-y-3">
            {STUDY_PREFERENCE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStudyPreferences.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={`study-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleStudyPreferenceToggle(option.value)}
                    className="mt-1"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <Icon className="h-4 w-4 text-green-600" />
                    <Label 
                      htmlFor={`study-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Difficulties */}
        <div>
          <Label htmlFor="difficulties" className="text-base font-medium text-gray-900 mb-2 block">
            Do you have any difficulties with specific aspects of learning? (Optional)
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Such as memory retention, concentration, or understanding abstract concepts
          </p>
          <Textarea
            id="difficulties"
            placeholder="Describe any learning challenges you'd like help with..."
            value={learningDifficulties}
            onChange={handleDifficultiesChange}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
} 