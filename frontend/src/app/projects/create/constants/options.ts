import {
  PurposeOption,
  EducationLevelOption,
  GradeLevelOption,
  TimelineOption,
  FrequencyOption,
  CollaborationOption,
} from "../types";

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    value: "school",
    label: "School Course",
    description: "For academic coursework or classes",
  },
  {
    value: "self-study",
    label: "Self Study",
    description: "Personal learning and skill development",
  },
  {
    value: "tutoring",
    label: "Tutoring",
    description: "Teaching or helping others learn",
  },
  {
    value: "research",
    label: "Research Project",
    description: "Academic or professional research",
  },
  {
    value: "custom",
    label: "Other",
    description: "Something else - I'll describe it myself",
  },
];

export const SCHOOL_PURPOSE_OPTIONS: PurposeOption[] = [
  {
    value: "good-grades",
    label: "Get Good Grades",
    description: "Improve my academic performance",
  },
  {
    value: "exam-prep",
    label: "Exam Preparation",
    description: "Prepare for an upcoming test or exam",
  },
  {
    value: "homework-help",
    label: "Homework Help",
    description: "Get help with assignments",
  },
  {
    value: "deeper-understanding",
    label: "Deeper Understanding",
    description: "Gain a more thorough grasp of a subject",
  },
  {
    value: "custom",
    label: "Other",
    description: "Something else - I'll describe it myself",
  },
];

export const TEST_LEVEL_OPTIONS: EducationLevelOption[] = [
  {
    value: "high-school",
    label: "High School",
    description: "Secondary education level",
  },
  {
    value: "college",
    label: "College/University",
    description: "Higher education level",
  },
  {
    value: "graduate",
    label: "Graduate School",
    description: "Advanced degree studies",
  },
  {
    value: "professional",
    label: "Professional Development",
    description: "Career or skill development",
  },
  {
    value: "self-taught",
    label: "Self-Taught",
    description: "Independent learning",
  },
];

export const GRADE_LEVEL_OPTIONS: GradeLevelOption[] = [
  { value: "grade-9", label: "Grade 9 (Freshman)" },
  { value: "grade-10", label: "Grade 10 (Sophomore)" },
  { value: "grade-11", label: "Grade 11 (Junior)" },
  { value: "grade-12", label: "Grade 12 (Senior)" },
];

export const TIMEFRAME_OPTIONS: TimelineOption[] = [
  {
    value: "1-week",
    label: "1 Week",
    description: "Quick project or deadline",
  },
  {
    value: "2-weeks",
    label: "2 Weeks",
    description: "Short-term learning goal",
  },
  { value: "1-month", label: "1 Month", description: "Medium-term project" },
  {
    value: "3-months",
    label: "3 Months",
    description: "Extended learning period",
  },
  { value: "6-months", label: "6 Months", description: "Long-term study plan" },
  {
    value: "1-year",
    label: "1 Year",
    description: "Comprehensive learning journey",
  },
];

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: "daily",
    label: "Daily",
    description: "Every day for consistent progress",
  },
  {
    value: "2-3-times-week",
    label: "2-3 times per week",
    description: "Regular but flexible schedule",
  },
  { value: "weekly", label: "Weekly", description: "Once a week sessions" },
  { value: "bi-weekly", label: "Bi-weekly", description: "Every other week" },
  {
    value: "monthly",
    label: "Monthly",
    description: "Occasional deep-dive sessions",
  },
];

export const COLLABORATION_OPTIONS: CollaborationOption[] = [
  {
    value: "solo",
    label: "Solo Learning",
    description: "I prefer to work independently",
  },
  {
    value: "small-group",
    label: "Small Group (2-5 people)",
    description: "Collaborate with a few others",
  },
  {
    value: "large-group",
    label: "Large Group (6+ people)",
    description: "Work with a larger team",
  },
  {
    value: "mentor",
    label: "With a Mentor",
    description: "One-on-one guidance",
  },
  {
    value: "flexible",
    label: "Flexible",
    description: "Mix of solo and collaborative work",
  },
];
