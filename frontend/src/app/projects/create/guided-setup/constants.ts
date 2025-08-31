import { CalendarDays, BookOpen, Target, Users, Clock, TrendingUp } from 'lucide-react';

export const TIMEFRAME_OPTIONS = [
  { value: '1_week', label: '1 Week', icon: CalendarDays },
  { value: '2_weeks', label: '2 Weeks', icon: CalendarDays },
  { value: '1_month', label: '1 Month', icon: CalendarDays },
  { value: '2_months', label: '2 Months', icon: CalendarDays },
  { value: '3_months', label: '3 Months', icon: CalendarDays },
  { value: '6_months', label: '6 Months', icon: CalendarDays },
  { value: '1_year', label: '1 Year', icon: CalendarDays },
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', icon: Clock },
  { value: '2_3_times_week', label: '2-3 times per week', icon: Clock },
  { value: 'weekly', label: 'Weekly', icon: Clock },
  { value: 'biweekly', label: 'Bi-weekly', icon: Clock },
  { value: 'monthly', label: 'Monthly', icon: Clock },
];

export const COLLABORATION_OPTIONS = [
  { 
    value: 'solo', 
    label: 'Solo Study', 
    icon: BookOpen,
    description: 'Study independently at your own pace'
  },
  { 
    value: 'study_group', 
    label: 'Study Group', 
    icon: Users,
    description: 'Collaborate with peers in study sessions'
  },
  { 
    value: 'tutor', 
    label: 'With Tutor', 
    icon: Users,
    description: 'Get guidance from a tutor or mentor'
  },
  { 
    value: 'mixed', 
    label: 'Mixed Approach', 
    icon: Users,
    description: 'Combine different collaboration methods'
  },
];

export const DATE_TYPE_OPTIONS = [
  { value: 'exam', label: 'Exam', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'quiz', label: 'Quiz', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'presentation', label: 'Presentation', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'project', label: 'Project', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export const STEP_CONFIG = [
  {
    id: 'projectName',
    title: 'Project Name',
    description: 'Give your study project a memorable name',
    icon: BookOpen,
    canSkip: false,
  },
  {
    id: 'purpose',
    title: 'Purpose',
    description: 'What type of project is this?',
    icon: Target,
    canSkip: false,
  },
  {
    id: 'educationLevel',
    title: 'Education Level',
    description: 'What level of education is this for?',
    icon: TrendingUp,
    canSkip: false,
  },
  {
    id: 'uploadSyllabus',
    title: 'Upload Syllabus',
    description: 'Upload your course syllabus for AI analysis',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
  },
  {
    id: 'extractionResults',
    title: 'Review Analysis',
    description: 'Review and confirm the extracted information',
    icon: BookOpen,
    canSkip: false,
  },
  {
    id: 'courseContentUpload',
    title: 'Upload Course Materials',
    description: 'Upload additional course materials for analysis',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
  },
  {
    id: 'testUpload',
    title: 'Upload Tests',
    description: 'Upload previous tests and exams',
    icon: BookOpen,
    canSkip: true,
    skipText: "Skip",
  },
  {
    id: 'learningPreferences',
    title: 'Learning Preferences',
    description: 'Tell us about your learning style',
    icon: BookOpen,
    canSkip: false,
  },
  {
    id: 'goal',
    title: 'Study Goal',
    description: 'What grade or outcome are you aiming for?',
    icon: Target,
    canSkip: false,
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Will you study alone or with others?',
    icon: Users,
    canSkip: false,
  },
];

export const DEFAULTS = {
  projectName: '',
  purpose: '',
  testLevel: '',
  timeframe: '',
  goal: '',
  studyFrequency: '',
  collaboration: '',
  learningStyle: [],
  studyPreference: [],
  learningDifficulties: [],
  uploadedFiles: [],
  importantDates: [],
  courseFiles: [],
  testFiles: [],
  is_draft: true,
}; 