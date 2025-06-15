import { 
  Edit3, 
  Target, 
  BookOpen, 
  FileText, 
  Check, 
  CalendarDays, 
  Upload, 
  Users,
  FileCheck,
  Presentation,
  FlaskConical,
  Hand,
  Home,
  Users2
} from 'lucide-react';
import { 
  SetupStep, 
  PurposeOption, 
  EducationLevelOption, 
  GradeLevelOption, 
  TimelineOption, 
  FrequencyOption, 
  CollaborationOption, 
  EvaluationTypeOption, 
  TestTypeOption,
  DateTypeOption 
} from '../types';

export const SETUP_STEPS: SetupStep[] = [
  {
    id: 'projectName',
    title: 'What\'s your project called?',
    description: 'Give your project a memorable name that reflects what you\'re working on.',
    icon: Edit3
  },
  {
    id: 'purpose',
    title: 'What\'s your purpose?',
    description: 'This helps us recommend the right materials and learning approach.',
    icon: Target
  },
  {
    id: 'courseDetails',
    title: 'Course Details',
    description: 'Tell us about your education, course, and how you\'ll be evaluated.',
    icon: BookOpen
  },
  {
    id: 'testTimeline',
    title: 'Tests & Timeline',
    description: 'Upload previous tests and add important dates.',
    icon: CalendarDays
  },
  {
    id: 'uploadFiles',
    title: 'Upload your study materials',
    description: 'Upload all the documents and files you have for this project.',
    icon: Upload
  },
  {
    id: 'timeframe',
    title: 'What\'s your timeline?',
    description: 'How long do you plan to work on this project?',
    icon: CalendarDays
  },
  {
    id: 'goal',
    title: 'What\'s your main goal?',
    description: 'Tell us what you want to achieve with this project.',
    icon: Target
  },
  {
    id: 'studyFrequency',
    title: 'How often will you study?',
    description: 'This helps us create a realistic learning schedule.',
    icon: CalendarDays
  },
  {
    id: 'collaboration',
    title: 'Will you be working with others?',
    description: 'Choose your collaboration preferences.',
    icon: Users
  }
];

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { value: 'school-course', label: 'School Course', description: 'For academic coursework or classes' },
  { value: 'self-study', label: 'Self Study', description: 'Personal learning and skill development' },
  { value: 'tutoring', label: 'Tutoring', description: 'Teaching or helping others learn' },
  { value: 'research', label: 'Research Project', description: 'Academic or professional research' },
  { value: 'other', label: 'Other', description: 'Something else - I\'ll describe it myself' }
];

export const TEST_LEVEL_OPTIONS: EducationLevelOption[] = [
  { value: 'high-school', label: 'High School', description: 'Secondary education level' },
  { value: 'college', label: 'College/University', description: 'Higher education level' },
  { value: 'graduate', label: 'Graduate School', description: 'Advanced degree studies' },
  { value: 'professional', label: 'Professional Development', description: 'Career or skill development' },
  { value: 'self-taught', label: 'Self-Taught', description: 'Independent learning' }
];

export const GRADE_LEVEL_OPTIONS: GradeLevelOption[] = [
  { value: 'grade-9', label: 'Grade 9 (Freshman)' },
  { value: 'grade-10', label: 'Grade 10 (Sophomore)' },
  { value: 'grade-11', label: 'Grade 11 (Junior)' },
  { value: 'grade-12', label: 'Grade 12 (Senior)' }
];

export const TIMEFRAME_OPTIONS: TimelineOption[] = [
  { value: '1-week', label: '1 Week', description: 'Quick project or deadline' },
  { value: '2-weeks', label: '2 Weeks', description: 'Short-term learning goal' },
  { value: '1-month', label: '1 Month', description: 'Medium-term project' },
  { value: '3-months', label: '3 Months', description: 'Extended learning period' },
  { value: '6-months', label: '6 Months', description: 'Long-term study plan' },
  { value: '1-year', label: '1 Year', description: 'Comprehensive learning journey' }
];

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'daily', label: 'Daily', description: 'Every day for consistent progress' },
  { value: '2-3-times-week', label: '2-3 times per week', description: 'Regular but flexible schedule' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week sessions' },
  { value: 'bi-weekly', label: 'Bi-weekly', description: 'Every other week' },
  { value: 'monthly', label: 'Monthly', description: 'Occasional deep-dive sessions' }
];

export const COLLABORATION_OPTIONS: CollaborationOption[] = [
  { value: 'solo', label: 'Solo Learning', description: 'I prefer to work independently' },
  { value: 'small-group', label: 'Small Group (2-5 people)', description: 'Collaborate with a few others' },
  { value: 'large-group', label: 'Large Group (6+ people)', description: 'Work with a larger team' },
  { value: 'mentor', label: 'With a Mentor', description: 'One-on-one guidance' },
  { value: 'flexible', label: 'Flexible', description: 'Mix of solo and collaborative work' }
];

export const EVALUATION_TYPE_OPTIONS: EvaluationTypeOption[] = [
  { value: 'exams', label: 'Exams/Quizzes', description: 'Written tests and assessments', icon: FileCheck },
  { value: 'essays', label: 'Essays/Papers', description: 'Written assignments and reports', icon: FileText },
  { value: 'presentations', label: 'Presentations', description: 'Oral presentations and speeches', icon: Presentation },
  { value: 'projects', label: 'Projects', description: 'Hands-on projects and assignments', icon: Check },
  { value: 'labs', label: 'Labs/Experiments', description: 'Laboratory work and experiments', icon: FlaskConical },
  { value: 'participation', label: 'Participation', description: 'Class participation and engagement', icon: Hand },
  { value: 'homework', label: 'Homework', description: 'Regular homework assignments', icon: Home },
  { value: 'group-work', label: 'Group Work', description: 'Collaborative assignments and projects', icon: Users2 }
];

export const TEST_TYPE_OPTIONS: TestTypeOption[] = [
  { value: 'midterm', label: 'Midterm Exams', description: 'Mid-semester comprehensive tests' },
  { value: 'final', label: 'Final Exams', description: 'End-of-semester comprehensive tests' },
  { value: 'quiz', label: 'Quizzes', description: 'Short knowledge checks' },
  { value: 'practice', label: 'Practice Tests', description: 'Sample or mock exams' },
  { value: 'homework', label: 'Homework Tests', description: 'Graded homework assignments' },
  { value: 'lab', label: 'Lab Tests', description: 'Laboratory practical exams' },
  { value: 'oral', label: 'Oral Exams', description: 'Spoken examinations' },
  { value: 'project', label: 'Project Tests', description: 'Project-based assessments' }
];

export const DATE_TYPE_OPTIONS: DateTypeOption[] = [
  { value: 'exam', label: 'Exam/Quiz', color: 'bg-red-100 text-red-800' },
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-100 text-blue-800' },
  { value: 'presentation', label: 'Presentation', color: 'bg-purple-100 text-purple-800' },
  { value: 'project', label: 'Project', color: 'bg-green-100 text-green-800' },
  { value: 'lab', label: 'Lab/Experiment', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]; 