import { 
  Edit3, 
  Target, 
  BookOpen, 
  FileText, 
  Check, 
  CalendarDays, 
  Upload, 
  Users,
  Code,
  Palette,
  Calculator,
  Globe,
  Music,
  Camera,
  Heart,
  Brain,
  Zap,
  Lightbulb,
  Search,
  Plus,
  Youtube,
  Github,
  ExternalLink
} from 'lucide-react';
import { 
  SetupStep, 
  PurposeOption, 
  TimelineOption, 
  FrequencyOption, 
  CollaborationOption,
  FocusAreaOption
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
    id: 'focusAreas',
    title: 'What are your focus areas?',
    description: 'Select the main topics or skills you want to focus on.',
    icon: BookOpen
  },
  {
    id: 'learningMaterials',
    title: 'Learning Materials',
    description: 'Upload files and add links to your learning resources.',
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
    id: 'learningGoal',
    title: 'What\'s your learning goal?',
    description: 'Tell us what you want to achieve with this project.',
    icon: Target
  },
  {
    id: 'collaboration',
    title: 'Will you be working with others?',
    description: 'Choose your collaboration preferences.',
    icon: Users
  }
];

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { value: 'self-study', label: 'Self Study', description: 'Personal learning and skill development' },
  { value: 'career-change', label: 'Career Change', description: 'Learning new skills for a career transition' },
  { value: 'hobby', label: 'Hobby/Interest', description: 'Learning for personal enjoyment' },
  { value: 'certification', label: 'Certification', description: 'Preparing for a professional certification' },
  { value: 'custom', label: 'Other', description: 'Something else - I\'ll describe it myself' }
];

export const FOCUS_AREA_OPTIONS: FocusAreaOption[] = [
  // Technology
  { value: 'programming', label: 'Programming', description: 'Software development and coding', icon: Code, category: 'Technology' },
  { value: 'web-development', label: 'Web Development', description: 'Building websites and web applications', icon: Globe, category: 'Technology' },
  { value: 'data-science', label: 'Data Science', description: 'Data analysis and machine learning', icon: Calculator, category: 'Technology' },
  { value: 'ai-ml', label: 'AI & Machine Learning', description: 'Artificial intelligence and ML', icon: Brain, category: 'Technology' },
  
  // Creative Arts
  { value: 'design', label: 'Design', description: 'Graphic design and visual arts', icon: Palette, category: 'Creative Arts' },
  { value: 'photography', label: 'Photography', description: 'Digital and film photography', icon: Camera, category: 'Creative Arts' },
  { value: 'music', label: 'Music', description: 'Musical instruments and theory', icon: Music, category: 'Creative Arts' },
  
  // Business
  { value: 'marketing', label: 'Marketing', description: 'Digital and traditional marketing', icon: Zap, category: 'Business' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', description: 'Starting and running a business', icon: Lightbulb, category: 'Business' },
  
  // Language
  { value: 'languages', label: 'Languages', description: 'Learning new languages', icon: Globe, category: 'Language' },
  
  // Health & Wellness
  { value: 'fitness', label: 'Fitness', description: 'Physical health and exercise', icon: Heart, category: 'Health & Wellness' },
  { value: 'nutrition', label: 'Nutrition', description: 'Healthy eating and diet', icon: Heart, category: 'Health & Wellness' },
  
  // Custom
  { value: 'custom', label: 'Custom Focus Area', description: 'Add your own focus area', icon: Plus, category: 'Custom' }
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

export const LINK_TYPES = [
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { value: 'github', label: 'GitHub', icon: Github, color: 'text-gray-800' },
  { value: 'blog', label: 'Blog/Article', icon: ExternalLink, color: 'text-blue-600' },
  { value: 'other', label: 'Other Link', icon: ExternalLink, color: 'text-gray-600' }
];

export const FOCUS_AREA_CATEGORIES = [
  'Technology',
  'Creative Arts', 
  'Business',
  'Language',
  'Health & Wellness',
  'Custom'
]; 