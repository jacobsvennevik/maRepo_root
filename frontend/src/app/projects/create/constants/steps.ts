import { 
  Edit3, 
  Target, 
  BookOpen, 
  CalendarDays, 
  Upload, 
  Users
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
    description: 'Upload all the documents and files you have for this project, including any other materials.',
    icon: Upload
  },
  {
    id: 'timeframe',
    title: 'What\'s your timeline?',
    description: 'How long do you plan to work on this project?',
    icon: CalendarDays
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