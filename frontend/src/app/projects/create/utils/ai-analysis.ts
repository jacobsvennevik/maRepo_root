// Simulated AI analysis for uploaded files
// In a real implementation, this would call an AI service

export interface DetectedTopic {
  id: string;
  label: string;
  confidence: number;
}

export interface DetectedDate {
  id: string;
  date: string;
  description: string;
  type: string;
}

export interface DetectedTestType {
  id: string;
  type: string;
  confidence: number;
}

export interface AIAnalysisResult {
  topics: DetectedTopic[];
  dates: DetectedDate[];
  testTypes: DetectedTestType[];
}

// Sample data for different file types
const sampleTopics = [
  { label: "Calculus", confidence: 95 },
  { label: "Linear Algebra", confidence: 88 },
  { label: "Statistics", confidence: 92 },
  { label: "Physics", confidence: 87 },
  { label: "Chemistry", confidence: 85 },
  { label: "Biology", confidence: 90 },
  { label: "Literature", confidence: 93 },
  { label: "History", confidence: 89 },
  { label: "Economics", confidence: 86 },
  { label: "Computer Science", confidence: 94 },
  { label: "Psychology", confidence: 91 },
  { label: "Philosophy", confidence: 84 },
];

const sampleDates = [
  { date: "2024-12-15", description: "Final Exam", type: "exam" },
  { date: "2024-11-20", description: "Midterm", type: "exam" },
  { date: "2024-10-15", description: "Project Due", type: "assignment" },
  { date: "2024-09-30", description: "Quiz", type: "quiz" },
  { date: "2024-12-10", description: "Presentation", type: "presentation" },
  { date: "2024-11-05", description: "Lab Report", type: "assignment" },
];

const sampleTestTypes = [
  { type: "Multiple Choice", confidence: 96 },
  { type: "Essay", confidence: 89 },
  { type: "Problem Solving", confidence: 92 },
  { type: "Lab Practical", confidence: 87 },
  { type: "Oral Exam", confidence: 85 },
  { type: "Take-Home", confidence: 90 },
];

export async function analyzeUploadedFiles(files: File[]): Promise<AIAnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  const result: AIAnalysisResult = {
    topics: [],
    dates: [],
    testTypes: []
  };

  // Analyze each file
  files.forEach((file, fileIndex) => {
    const fileName = file.name.toLowerCase();
    
    // Extract topics based on file content/name
    if (fileName.includes('math') || fileName.includes('calculus') || fileName.includes('algebra')) {
      result.topics.push({
        id: `topic-${fileIndex}-1`,
        label: "Calculus",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
      result.topics.push({
        id: `topic-${fileIndex}-2`,
        label: "Linear Algebra",
        confidence: 80 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('physics') || fileName.includes('mechanics')) {
      result.topics.push({
        id: `topic-${fileIndex}-3`,
        label: "Physics",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('chemistry') || fileName.includes('organic')) {
      result.topics.push({
        id: `topic-${fileIndex}-4`,
        label: "Chemistry",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('biology') || fileName.includes('cell') || fileName.includes('genetics')) {
      result.topics.push({
        id: `topic-${fileIndex}-5`,
        label: "Biology",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('literature') || fileName.includes('english') || fileName.includes('poetry')) {
      result.topics.push({
        id: `topic-${fileIndex}-6`,
        label: "Literature",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('history') || fileName.includes('ancient') || fileName.includes('modern')) {
      result.topics.push({
        id: `topic-${fileIndex}-7`,
        label: "History",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('economics') || fileName.includes('micro') || fileName.includes('macro')) {
      result.topics.push({
        id: `topic-${fileIndex}-8`,
        label: "Economics",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('computer') || fileName.includes('programming') || fileName.includes('code')) {
      result.topics.push({
        id: `topic-${fileIndex}-9`,
        label: "Computer Science",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('psychology') || fileName.includes('behavior') || fileName.includes('cognitive')) {
      result.topics.push({
        id: `topic-${fileIndex}-10`,
        label: "Psychology",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }
    
    if (fileName.includes('philosophy') || fileName.includes('ethics') || fileName.includes('logic')) {
      result.topics.push({
        id: `topic-${fileIndex}-11`,
        label: "Philosophy",
        confidence: 85 + Math.floor(Math.random() * 15)
      });
    }

    // Extract dates based on file content/name
    if (fileName.includes('final') || fileName.includes('exam')) {
      result.dates.push({
        id: `date-${fileIndex}-1`,
        date: "2024-12-15",
        description: "Final Exam",
        type: "exam"
      });
    }
    
    if (fileName.includes('midterm') || fileName.includes('mid')) {
      result.dates.push({
        id: `date-${fileIndex}-2`,
        date: "2024-11-20",
        description: "Midterm",
        type: "exam"
      });
    }
    
    if (fileName.includes('project') || fileName.includes('assignment')) {
      result.dates.push({
        id: `date-${fileIndex}-3`,
        date: "2024-10-15",
        description: "Project Due",
        type: "assignment"
      });
    }
    
    if (fileName.includes('quiz') || fileName.includes('test')) {
      result.dates.push({
        id: `date-${fileIndex}-4`,
        date: "2024-09-30",
        description: "Quiz",
        type: "quiz"
      });
    }
    
    if (fileName.includes('presentation') || fileName.includes('present')) {
      result.dates.push({
        id: `date-${fileIndex}-5`,
        date: "2024-12-10",
        description: "Presentation",
        type: "presentation"
      });
    }
    
    if (fileName.includes('lab') || fileName.includes('practical')) {
      result.dates.push({
        id: `date-${fileIndex}-6`,
        date: "2024-11-05",
        description: "Lab Report",
        type: "assignment"
      });
    }

    // Extract test types based on file content/name
    if (fileName.includes('multiple') || fileName.includes('choice') || fileName.includes('mcq')) {
      result.testTypes.push({
        id: `test-${fileIndex}-1`,
        type: "Multiple Choice",
        confidence: 90 + Math.floor(Math.random() * 10)
      });
    }
    
    if (fileName.includes('essay') || fileName.includes('writing') || fileName.includes('paper')) {
      result.testTypes.push({
        id: `test-${fileIndex}-2`,
        type: "Essay",
        confidence: 85 + Math.floor(Math.random() * 10)
      });
    }
    
    if (fileName.includes('problem') || fileName.includes('solve') || fileName.includes('calculation')) {
      result.testTypes.push({
        id: `test-${fileIndex}-3`,
        type: "Problem Solving",
        confidence: 88 + Math.floor(Math.random() * 10)
      });
    }
    
    if (fileName.includes('lab') || fileName.includes('practical') || fileName.includes('experiment')) {
      result.testTypes.push({
        id: `test-${fileIndex}-4`,
        type: "Lab Practical",
        confidence: 85 + Math.floor(Math.random() * 10)
      });
    }
    
    if (fileName.includes('oral') || fileName.includes('speaking') || fileName.includes('interview')) {
      result.testTypes.push({
        id: `test-${fileIndex}-5`,
        type: "Oral Exam",
        confidence: 80 + Math.floor(Math.random() * 10)
      });
    }
    
    if (fileName.includes('take') || fileName.includes('home') || fileName.includes('open')) {
      result.testTypes.push({
        id: `test-${fileIndex}-6`,
        type: "Take-Home",
        confidence: 85 + Math.floor(Math.random() * 10)
      });
    }
  });

  // Remove duplicates and limit results
  result.topics = result.topics
    .filter((topic, index, self) => 
      index === self.findIndex(t => t.label === topic.label)
    )
    .slice(0, 5);

  result.dates = result.dates
    .filter((date, index, self) => 
      index === self.findIndex(d => d.description === date.description)
    )
    .slice(0, 4);

  result.testTypes = result.testTypes
    .filter((type, index, self) => 
      index === self.findIndex(t => t.type === type.type)
    )
    .slice(0, 3);

  return result;
} 