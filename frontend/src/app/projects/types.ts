import { LucideIcon, Dna, Flask, Atom, Calculator, BookOpen, Code2, History, Globe } from 'lucide-react';

export type ProjectType = 'biology' | 'chemistry' | 'physics' | 'math' | 'history' | 'computer-science' | 'geography' | 'literature';

export interface Project {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  type: ProjectType;
  progress?: number;
  collaborators?: number;
}

export const projectIcons: Record<string, LucideIcon> = {
  'biology': Dna,
  'chemistry': Flask,
  'physics': Atom,
  'math': Calculator,
  'literature': BookOpen,
  'computer-science': Code2,
  'history': History,
  'geography': Globe,
} as const;

export const projectColors: Record<string, string> = {
  'biology': 'bg-green-50 text-green-600',
  'chemistry': 'bg-blue-50 text-blue-600',
  'physics': 'bg-purple-50 text-purple-600',
  'math': 'bg-orange-50 text-orange-600',
  'literature': 'bg-red-50 text-red-600',
  'computer-science': 'bg-indigo-50 text-indigo-600',
  'history': 'bg-amber-50 text-amber-600',
  'geography': 'bg-teal-50 text-teal-600',
} as const; 