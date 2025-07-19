'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  Users, 
  Eye, 
  MessageSquare, 
  Hand,
  Lightbulb,
  Sparkles
} from "lucide-react";

interface LearningPreferencesStepProps {
  learningStyle: string | string[];
  studyPreference: string | string[];
  learningDifficulties: string;
  courseType?: string; // Auto-detected from uploaded content
  assessmentTypes?: {
    has_final_exam: boolean;
    has_regular_quizzes: boolean;
    has_essays: boolean;
    has_projects: boolean;
    has_lab_work: boolean;
    has_group_work: boolean;
    primary_assessment_method: string;
  }; // Auto-detected from uploaded content
  onLearningStyleChange: (value: string | string[]) => void;
  onStudyPreferenceChange: (value: string | string[]) => void;
  onLearningDifficultiesChange: (value: string) => void;
}

const LEARNING_STYLE_OPTIONS = [
  { value: 'visual', label: 'Visual (diagrams, charts, images)', icon: Eye },
  { value: 'verbal', label: 'Verbal (reading, writing, discussion)', icon: MessageSquare },
  { value: 'kinesthetic', label: 'Kinesthetic (hands-on, movement)', icon: Hand },
  { value: 'mixed', label: 'Mixed approach', icon: Brain },
  { value: 'unsure', label: 'Not sure / No preference', icon: Lightbulb },
];

const STUDY_PREFERENCE_OPTIONS = [
  { value: 'alone', label: 'Alone (independent study)', icon: BookOpen },
  { value: 'groups', label: 'In groups (collaborative study)', icon: Users },
  { value: 'mixed', label: 'Mix of both', icon: Brain },
];

export function LearningPreferencesStep({
  learningStyle,
  studyPreference,
  learningDifficulties,
  courseType,
  assessmentTypes,
  onLearningStyleChange,
  onStudyPreferenceChange,
  onLearningDifficultiesChange
}: LearningPreferencesStepProps) {
  // Handle course type as single selection, others as multi-select
  const selectedLearningStyles = Array.isArray(learningStyle) ? learningStyle : (learningStyle ? [learningStyle] : []);
  const selectedStudyPreferences = Array.isArray(studyPreference) ? studyPreference : (studyPreference ? [studyPreference] : []);


  const handleLearningStyleToggle = (value: string) => {
    const newSelection = selectedLearningStyles.includes(value)
      ? selectedLearningStyles.filter(item => item !== value)
      : [...selectedLearningStyles, value];
    onLearningStyleChange(newSelection);
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

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Auto-detected Course Information */}
        {(courseType || assessmentTypes) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium text-green-900">Auto-detected from your content</h3>
            </div>
            
            {courseType && (
              <div className="mb-3">
                <Label className="text-sm font-medium text-green-800">Course Type:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-green-700">{courseType}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Auto-detected
                  </Badge>
                </div>
              </div>
            )}

            {assessmentTypes && (
              <div>
                <Label className="text-sm font-medium text-green-800">Assessment Methods:</Label>
                <div className="text-xs text-green-600 space-y-1 mt-1">
                  {assessmentTypes.has_final_exam && <div>• Final Exam</div>}
                  {assessmentTypes.has_regular_quizzes && <div>• Regular Quizzes/Tests</div>}
                  {assessmentTypes.has_essays && <div>• Essays/Papers</div>}
                  {assessmentTypes.has_projects && <div>• Projects/Presentations</div>}
                  {assessmentTypes.has_lab_work && <div>• Lab Work/Practicals</div>}
                  {assessmentTypes.has_group_work && <div>• Group Work</div>}
                  {assessmentTypes.primary_assessment_method && (
                    <div className="text-green-700 font-medium mt-2">
                      Primary: {assessmentTypes.primary_assessment_method}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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