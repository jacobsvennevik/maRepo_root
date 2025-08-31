export const getSubjectIcon = (subject: string): string => {
  switch (subject.toLowerCase()) {
    case "biology":
      return "🧬";
    case "chemistry":
      return "🧪";
    case "physics":
      return "⚛️";
    case "history":
      return "📜";
    case "math":
      return "📐";
    default:
      return "📚";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "recent":
      return "bg-green-100 text-green-800 border-green-200";
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export interface MindMap {
  id: string;
  title: string;
  subject: string;
  nodeCount: number;
  lastEdited: string;
  created: string;
  status: "recent" | "active" | "archived";
  color: string;
  bgColor: string;
  borderColor: string;
  progress: number;
  isAIGenerated: boolean;
  description?: string;
}

export const mockMindMaps: MindMap[] = [
  {
    id: "1",
    title: "Biology: Cell Structure",
    subject: "Biology",
    nodeCount: 24,
    lastEdited: "2 hours ago",
    created: "3 days ago",
    status: "recent",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50/80 backdrop-blur-sm",
    borderColor: "border-blue-200/50",
    progress: 85,
    isAIGenerated: true,
    description:
      "Comprehensive overview of cellular components and their functions",
  },
  {
    id: "2",
    title: "Chemistry: Periodic Table",
    subject: "Chemistry",
    nodeCount: 32,
    lastEdited: "1 day ago",
    created: "1 week ago",
    status: "active",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50/80 backdrop-blur-sm",
    borderColor: "border-purple-200/50",
    progress: 60,
    isAIGenerated: false,
    description: "Interactive exploration of elements and their properties",
  },
  {
    id: "3",
    title: "Physics: Quantum Mechanics",
    subject: "Physics",
    nodeCount: 18,
    lastEdited: "3 days ago",
    created: "2 weeks ago",
    status: "active",
    color: "from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-50/80 backdrop-blur-sm",
    borderColor: "border-emerald-200/50",
    progress: 45,
    isAIGenerated: true,
    description:
      "Fundamental principles of quantum physics and wave-particle duality",
  },
  {
    id: "4",
    title: "History: World War II",
    subject: "History",
    nodeCount: 28,
    lastEdited: "5 days ago",
    created: "3 weeks ago",
    status: "archived",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50/80 backdrop-blur-sm",
    borderColor: "border-orange-200/50",
    progress: 90,
    isAIGenerated: false,
    description:
      "Chronological timeline of major events and their global impact",
  },
];
