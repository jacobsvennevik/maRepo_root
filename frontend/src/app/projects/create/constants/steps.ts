import { 
  Edit3, 
  Target, 
  BookOpen, 
  CalendarDays, 
  Upload, 
  FileText,
  CheckCircle,
  Users,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { SetupStep } from '../types';

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
    id: 'educationLevel',
    title: 'Education level',
    description: 'Select your school or study level (e.g. high school, university, graduate).',
    icon: GraduationCap
  },
  {
    id: 'uploadFiles',
    title: 'Upload your syllabus',
    description: 'Upload your course syllabus to automatically extract course details and setup your project.',
    icon: Upload
  },
  {
    id: 'extractionResults',
    title: 'Review extracted information',
    description: 'Review and confirm the information we extracted from your syllabus.',
    icon: CheckCircle
  },
  {
    id: 'courseContentUpload',
    title: 'Upload course content',
    description: 'Upload slides, handouts, and other course materials (max 100 pages).',
    icon: Upload
  },
  {
    id: 'courseContentReview',
    title: 'Review course content extraction',
    description: 'Preview and confirm extracted information from your course content.',
    icon: CheckCircle
  },
  {
    id: 'testUpload',
    title: 'Upload test materials',
    description: 'Upload past exams, practice tests, or study guides to help us understand what to expect.',
    icon: FileText
  },
  {
    id: 'testExtractionResults',
    title: 'Review test analysis',
    description: 'Review the AI analysis of your test materials including question types and difficulty levels.',
    icon: BarChart3
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