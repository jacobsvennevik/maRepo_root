import { ProjectV2 } from "../types";

export const mockProjects: ProjectV2[] = [
  {
    id: "biology-101",
    title: "Biology Research",
    description: "Study of cellular structures and DNA replication",
    lastUpdated: "2 days ago",
    type: "biology",
    progress: 75,
    collaborators: 3,
  },
  {
    id: "chem-lab",
    title: "Chemistry Lab",
    description: "Chemical reactions and molecular structures",
    lastUpdated: "1 day ago",
    type: "chemistry",
    progress: 45,
    collaborators: 2,
  },
  {
    id: "physics-mechanics",
    title: "Physics Project",
    description: "Mechanics and thermodynamics",
    lastUpdated: "3 days ago",
    type: "physics",
    progress: 60,
    collaborators: 4,
  },
  {
    id: "calculus-advanced",
    title: "Advanced Calculus",
    description: "Differential equations and vector calculus",
    lastUpdated: "4 days ago",
    type: "math",
    progress: 30,
    collaborators: 1,
  },
  {
    id: "ml-basics",
    title: "Machine Learning",
    description: "Neural networks and deep learning algorithms",
    lastUpdated: "1 day ago",
    type: "computer-science",
    progress: 90,
    collaborators: 5,
  },
];
