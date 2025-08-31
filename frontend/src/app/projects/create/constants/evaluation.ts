import {
  FileCheck,
  FileText,
  Presentation,
  Check,
  FlaskConical,
  Hand,
  Home,
  Users2,
} from "lucide-react";
import { EvaluationTypeOption, TestTypeOption, DateTypeOption } from "../types";

export const EVALUATION_TYPE_OPTIONS: EvaluationTypeOption[] = [
  {
    value: "exams",
    label: "Exams/Quizzes",
    description: "Written tests and assessments",
    icon: FileCheck,
  },
  {
    value: "essays",
    label: "Essays/Papers",
    description: "Written assignments and reports",
    icon: FileText,
  },
  {
    value: "presentations",
    label: "Presentations",
    description: "Oral presentations and speeches",
    icon: Presentation,
  },
  {
    value: "projects",
    label: "Projects",
    description: "Hands-on projects and assignments",
    icon: Check,
  },
  {
    value: "labs",
    label: "Labs/Experiments",
    description: "Laboratory work and experiments",
    icon: FlaskConical,
  },
  {
    value: "participation",
    label: "Participation",
    description: "Class participation and engagement",
    icon: Hand,
  },
  {
    value: "homework",
    label: "Homework",
    description: "Regular homework assignments",
    icon: Home,
  },
  {
    value: "group-work",
    label: "Group Work",
    description: "Collaborative assignments and projects",
    icon: Users2,
  },
];

export const TEST_TYPE_OPTIONS: TestTypeOption[] = [
  {
    value: "midterm",
    label: "Midterm Exams",
    description: "Mid-semester comprehensive tests",
  },
  {
    value: "final",
    label: "Final Exams",
    description: "End-of-semester comprehensive tests",
  },
  { value: "quiz", label: "Quizzes", description: "Short knowledge checks" },
  {
    value: "practice",
    label: "Practice Tests",
    description: "Sample or mock exams",
  },
  {
    value: "homework",
    label: "Homework Tests",
    description: "Graded homework assignments",
  },
  {
    value: "lab",
    label: "Lab Tests",
    description: "Laboratory practical exams",
  },
  { value: "oral", label: "Oral Exams", description: "Spoken examinations" },
  {
    value: "project",
    label: "Project Tests",
    description: "Project-based assessments",
  },
];

export const DATE_TYPE_OPTIONS: DateTypeOption[] = [
  { value: "exam", label: "Exam/Quiz", color: "bg-red-100 text-red-800" },
  {
    value: "assignment",
    label: "Assignment",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "presentation",
    label: "Presentation",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "project", label: "Project", color: "bg-green-100 text-green-800" },
  {
    value: "lab",
    label: "Lab/Experiment",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];
