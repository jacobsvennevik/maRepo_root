export interface Test {
  id: string;
  title: string;
  subject: string;
  type: string;
  questions: number;
  timeEstimate: number;
  lastScore?: number;
  status: 'completed' | 'upcoming' | 'needs-review';
  createdAt: string;
  icon: string;
}

export const mockTests: Test[] = [
  {
    id: '1',
    title: 'Biology Midterm Review',
    subject: 'Biology',
    type: 'Multiple Choice',
    questions: 50,
    timeEstimate: 60,
    lastScore: 85,
    status: 'completed',
    createdAt: '2024-01-15',
    icon: '🧬'
  },
  {
    id: '2',
    title: 'Chemistry Quiz #3',
    subject: 'Chemistry',
    type: 'Matching Pairs',
    questions: 20,
    timeEstimate: 30,
    lastScore: null,
    status: 'upcoming',
    createdAt: '2024-01-20',
    icon: '⚗️'
  },
  {
    id: '3',
    title: 'Physics Practice Test',
    subject: 'Physics',
    type: 'Short Answer',
    questions: 40,
    timeEstimate: 45,
    lastScore: 72,
    status: 'needs-review',
    createdAt: '2024-01-18',
    icon: '⚡'
  },
  {
    id: '4',
    title: 'Math Problem Solving',
    subject: 'Mathematics',
    type: 'Interactive Diagram',
    questions: 25,
    timeEstimate: 35,
    lastScore: 95,
    status: 'completed',
    createdAt: '2024-01-22',
    icon: '📐'
  }
]; 