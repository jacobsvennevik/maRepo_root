// Mock data service for test mode
// This centralizes all mock data used across the project creation steps

export interface ProcessedDocument {
  id: number;
  original_text: string;
  metadata: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface SyllabusExtractionData {
  course_title: string;
  education_level: string;
  exam_dates: Array<{
    date: string;
    description: string;
  }>;
  instructor: string;
  topics: string[];
}

// Mock syllabus extraction data - Natural Language Interaction course
export const MOCK_SYLLABUS_EXTRACTION = {
  course_title: "Natural Language Interaction ",
  education_level: "Master ",
  exam_dates: [
    {"date":"2025-02-27","description":"Short exercise A","format":"Written individual short exercise, in person without consultation (10 min at end of class) ","weight":"0.5 points "},
    {"date":"2025-03-13","description":"Short exercise B","format":"Written individual short exercise, in person without consultation (10 min at end of class) ","weight":"0.5 points "},
    {"date":"2025-04-10","description":"Short exercise C","format":"Written individual short exercise, in person without consultation (10 min at end of class) ","weight":"0.5 points "},
    {"date":"2025-05-15","description":"Short exercise D","format":"Written individual short exercise, in person without consultation (10 min at end of class) ","weight":"0.5 points "},
    {"date":"2025-03-27","description":"Test 1","format":"Written individual test, in person without consultation (1 h) ","weight":"2 points "},
    {"date":"2025-05-29","description":"Test 2","format":"Written individual test, in person without consultation (1 h) ","weight":"2 points "},
    {"date":"2025-05-30","description":"Project submission (Master’s)","format":"Project submission – program for individual computational problem solving ","weight":"4 points "},
    {"date":"2025-06-13","description":"Project submission (Doctorate)","format":"Project submission – program for individual computational problem solving ","weight":"4 points "},
    {"date":"","description":"Final exam (normal/special calls)","format":"Written individual test (Part A) in person without consultation; non‑face‑to‑face program test (Part B) ","weight":"10 points "}
  ],
  instructor: "António Branco ",
  topics: [
    "Knowledge representation based on inference",
    "Syntactic analysis and parsing",
    "Semantic representation and logical form",
    "Applications of computational modeling of natural language",
    "Language models",
    "Vector representation of knowledge and distributional semantics",
    "Word embeddings",
    "Neural networks, deep learning and Transformers",
    "Artificial Intelligence, Cognition and open challenges"
  ]
};

// Mock processed document for syllabus upload
export const MOCK_SYLLABUS_PROCESSED_DOCUMENT: ProcessedDocument = {
  id: 123,
  original_text: "Natural Language Interaction course syllabus covering fundamental concepts in NLP, deep learning, and cognitive AI applications.",
  metadata: MOCK_SYLLABUS_EXTRACTION,
  status: 'completed'
};

// Comprehensive course content extraction data for NLP materials
export const MOCK_COURSE_CONTENT_EXTRACTION = {
  "course_type": "STEM",
  "assessment_types": {
    "has_final_exam": true,
    "has_regular_quizzes": true,
    "has_essays": false,
    "has_projects": true,
    "has_lab_work": false,
    "has_group_work": false,
    "primary_assessment_method": "Tests and Projects"
  },
  "overview": "The materials progress from classical distributional semantics toward modern transformer‑based language models. Each topic builds conceptually: vector embeddings and simple aggregation give way to CNNs, RNNs and attention; training and optimisation principles underpin language‑modelling objectives, which culminate in large‑scale pre‑training, transfer learning and contemporary transformer families.",
  "topics": [
    {
      "topic_name": "Vector Representations & Compositionality",
      "summary": "Shows how word‑level vectors combine—via sum, average or max—to yield sentence meanings while respecting the principle that an expression's meaning depends on its parts and their combination.",
      "learning_objectives": [
        "Explain the purpose of word embeddings",
        "Compare Bag‑of‑Words with compositional methods",
        "Demonstrate k‑gram based aggregation",
        "Evaluate strengths and limits of simple pooling"
      ],
      "concepts": [
        {
          "name": "Word embedding",
          "definition": "Meaning of the word represented by a vector… vector condenses information about the respective distribution, i.e., co‑occurrence.",
          "examples": ["v = [v11 … v1m] (word vector)", "Closer vectors ⇒ higher similarity", "Components reflect distributional statistics"],
          "related_concepts": ["Bag‑of‑Words", "Sentence vector", "Attention"],
          "importance": "Embeddings allow neural networks to operate on textual data by turning discrete words into continuous, comparable representations.",
          "assessment": {
            "recall_q": "What does a word embedding represent?",
            "application_q": "Given two word vectors with high cosine similarity, what can you infer about the words' semantic relationship?",
            "difficulty": "easy"
          }
        },
        {
          "name": "Bag‑of‑Words (BOW)",
          "definition": "Zero degree of compositionality: concatenation or sum of word vectors regardless of order.",
          "examples": ["v = v1 + v2 + …", "Sentence length reduced to fixed‑size vector", "Order information lost"],
          "related_concepts": ["Word embedding", "Pooling"],
          "importance": "BOW provides a simple baseline for representing arbitrary‑length text with a fixed vector, enabling many early NLP models.",
          "assessment": {
            "recall_q": "Which property of language is ignored by Bag‑of‑Words representations?",
            "application_q": "Why might BOW perform poorly on sentiment sentences like 'Not good' versus 'Good'?",
            "difficulty": "medium"
          }
        },
        {
          "name": "Principle of compositionality",
          "definition": "The meaning of an expression is a function of the meaning of its sub‑expressions and the way in which they are combined.",
          "examples": ["all(X,woman(X),one(Y,man(Y),love(X,Y)))", "Vector sum vs hierarchical composition"],
          "related_concepts": ["Sentence vector", "Neural compositional models"],
          "importance": "Guides how word‑level semantics should integrate into phrase and sentence‑level meaning for faithful representation.",
          "assessment": {
            "recall_q": "State the principle of compositionality.",
            "application_q": "How does the principle motivate moving from BOW to neural compositional models?",
            "difficulty": "medium"
          }
        },
        {
          "name": "k‑gram",
          "definition": "The network receives successive segments of k words (bi‑gram, tri‑gram)… each k‑gram generates a vector.",
          "examples": ["Window size = 3 words", "Stride by 1 word", "Used in CNN feature extraction"],
          "related_concepts": ["Convolution", "CNN"],
          "importance": "k‑grams capture local context, enabling convolutional layers to learn phrase‑level patterns.",
          "assessment": {
            "recall_q": "What is a k‑gram in text processing?",
            "application_q": "Why might tri‑grams be preferred over uni‑grams for sentiment classification?",
            "difficulty": "easy"
          }
        }
      ]
    },
    {
      "topic_name": "Convolutional Neural Networks for Text",
      "summary": "Introduces convolution, pooling and hierarchical CNNs that extract local textual features while coping with variable sentence lengths.",
      "learning_objectives": [
        "Describe the convolution operation on text",
        "Distinguish max, average and sum pooling",
        "Explain hierarchical convolution and skip connections",
        "Assess CNN strengths and shortcomings for NLP"
      ],
      "concepts": [
        {
          "name": "Convolution operation",
          "definition": "The same network receives successive segments of k words… stride the window by 1 word or more.",
          "examples": ["2‑gram window slides across sentence", "Shared weights detect features", "Analogous to visual cortex filters"],
          "related_concepts": ["k‑gram", "Pooling"],
          "importance": "Convolution captures position‑invariant local patterns, crucial for tasks like text classification.",
          "assessment": {
            "recall_q": "What is the purpose of weight sharing in a convolutional layer?",
            "application_q": "How does stride length affect the granularity of captured linguistic features?",
            "difficulty": "medium"
          }
        },
        {
          "name": "Pooling",
          "definition": "Aggregation ('pooling') — max or average of each dimension of the vectors length.",
          "examples": ["Max(v11, v21, …)", "Average(v1, v2, …)", "Reduces dimensionality"],
          "related_concepts": ["Convolution", "Sentence vector aggregation"],
          "importance": "Pooling condenses variable‑length convolution outputs into fixed‑size vectors, controlling model complexity.",
          "assessment": {
            "recall_q": "Give one reason pooling layers follow convolution layers in CNNs.",
            "application_q": "Why might average pooling obscure rare but decisive words in sentiment analysis?",
            "difficulty": "easy"
          }
        }
      ]
    },
    {
      "topic_name": "Transformer Architecture & Families",
      "summary": "Explains encoder, decoder and encoder‑decoder designs, positional embeddings, multi‑head attention and the evolution into large‑scale models like BERT, GPT and T5.",
      "learning_objectives": [
        "Outline the original transformer encoder‑decoder stack",
        "Describe positional embeddings and their role",
        "Compare encoder‑only, decoder‑only and encoder‑decoder families",
        "Discuss scaling laws and prompting paradigms"
      ],
      "concepts": [
        {
          "name": "Transformer",
          "definition": "Vaswani et al., 2017 — based on fully connected self‑attention and feed‑forward layers, processed in parallel.",
          "examples": ["Multi‑head attention layer", "Residual + layer norm", "Position‑wise feed‑forward"],
          "related_concepts": ["Positional embeddings", "Multi‑head attention", "Encoder", "Decoder"],
          "importance": "Transformers dominate modern NLP due to parallelism and ability to model long‑range dependencies.",
          "assessment": {
            "recall_q": "Which 2017 paper introduced the transformer?",
            "application_q": "Why does transformer parallelism suit GPU hardware?",
            "difficulty": "easy"
          }
        },
        {
          "name": "Multi‑head attention",
          "definition": "Each head learns differently… enriched with attention sub‑layers, concatenates its exit to its next fully connected layer.",
          "examples": ["8 heads in BERT‑base", "96 heads in GPT‑3", "Capture diverse relations"],
          "related_concepts": ["Attention", "Transformer"],
          "importance": "Multiple heads allow the model to attend to information from different representation subspaces concurrently.",
          "assessment": {
            "recall_q": "What is the main advantage of using multiple attention heads?",
            "application_q": "How might head pruning affect performance and efficiency?",
            "difficulty": "medium"
          }
        }
      ]
    }
  ]
};

// Mock processed document for course content upload
export const MOCK_COURSE_CONTENT_PROCESSED_DOCUMENT: ProcessedDocument = {
  id: 456,
  original_text: "Comprehensive NLP course materials covering vector representations, CNNs, RNNs, attention mechanisms, transformers, and modern language modeling approaches.",
  metadata: MOCK_COURSE_CONTENT_EXTRACTION,
  status: 'completed'
};

// Additional mock syllabi for variety
export const MOCK_SYLLABI_COLLECTION = {
  "natural_language_interaction": MOCK_SYLLABUS_EXTRACTION,
  "computer_science_101": {
    course_title: "Computer Science 101",
    education_level: "Bachelor",
    exam_dates: [
      { date: "2024-10-15", description: "Midterm Exam" },
      { date: "2024-12-15", description: "Final Exam" }
    ],
    instructor: "Dr. Jane Smith",
    topics: [
      "Python Programming",
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Database Basics"
    ]
  },
  "advanced_physics": {
    course_title: "Advanced Physics",
    education_level: "Master",
    exam_dates: [
      { date: "2024-11-20", description: "Quantum Mechanics Exam" },
      { date: "2024-12-10", description: "Final Examination" }
    ],
    instructor: "Prof. Albert Einstein",
    topics: [
      "Quantum Mechanics",
      "Thermodynamics", 
      "Electromagnetic Theory",
      "Relativity Theory",
      "Particle Physics"
    ]
  }
};

// Function to get random mock syllabus data
export function getRandomMockSyllabus(): SyllabusExtractionData {
  const syllabi = Object.values(MOCK_SYLLABI_COLLECTION);
  const randomIndex = Math.floor(Math.random() * syllabi.length);
  return syllabi[randomIndex];
}

// Function to create a mock processed document from syllabus data
export function createMockProcessedDocument(syllabusData: SyllabusExtractionData, id: number = 123): ProcessedDocument {
  return {
    id,
    original_text: `Course syllabus for ${syllabusData.course_title} taught by ${syllabusData.instructor}. This ${syllabusData.education_level} level course covers various topics in the field.`,
    metadata: syllabusData,
    status: 'completed'
  };
}

// Function to convert course content mock data to ExtractedData format for extraction results step
export function convertCourseContentToExtractedData(): any {
  // Extract all topics from the comprehensive course content data
  const allTopics = MOCK_COURSE_CONTENT_EXTRACTION.topics.flatMap(topic => 
    topic.concepts.map((concept, index) => ({
      id: `concept-${topic.topic_name.replace(/\s+/g, '-').toLowerCase()}-${index}`,
      label: concept.name,
      confidence: concept.assessment.difficulty === 'easy' ? 90 + Math.floor(Math.random() * 10) :
                  concept.assessment.difficulty === 'medium' ? 80 + Math.floor(Math.random() * 15) :
                  75 + Math.floor(Math.random() * 15)
    }))
  );

  // Create mock important dates based on course content
  const mockDates = [
    { id: 'date-1', date: '2025-03-15', description: 'Vector Embeddings Assignment Due', type: 'assignment' },
    { id: 'date-2', date: '2025-04-01', description: 'CNN Implementation Project', type: 'assignment' },
    { id: 'date-3', date: '2025-04-20', description: 'Midterm Exam - Attention Mechanisms', type: 'exam' },
    { id: 'date-4', date: '2025-05-10', description: 'Transformer Architecture Quiz', type: 'quiz' },
    { id: 'date-5', date: '2025-05-25', description: 'Final Project - Language Model', type: 'assignment', weight: 30 },
    { id: 'date-6', date: '2025-06-15', description: 'Final Exam - Comprehensive NLP', type: 'exam', weight: 40 }
  ];

  // Create assessment types based on the concepts
  const testTypes = [
    { id: 'test-1', type: 'Concept Recall Questions', confidence: 95 },
    { id: 'test-2', type: 'Application Problems', confidence: 88 },
    { id: 'test-3', type: 'Implementation Exercises', confidence: 92 },
    { id: 'test-4', type: 'Theoretical Analysis', confidence: 85 }
  ];

  // Create grading breakdown
  const grading = [
    { category: 'Assignments & Projects', weight: 40 },
    { category: 'Midterm Exam', weight: 25 },
    { category: 'Final Exam', weight: 30 },
    { category: 'Participation & Quizzes', weight: 5 }
  ];

  return {
    courseName: "Advanced Natural Language Processing",
    instructor: "Dr. Sarah Chen",
    semester: "Spring 2025",
    courseType: MOCK_COURSE_CONTENT_EXTRACTION.course_type,
    assessmentTypes: MOCK_COURSE_CONTENT_EXTRACTION.assessment_types,
    topics: allTopics,
    dates: mockDates,
    testTypes: testTypes,
    grading: grading,
    courseDescription: MOCK_COURSE_CONTENT_EXTRACTION.overview,
    learningOutcomes: [
      "Master vector representations and compositionality principles",
      "Implement and analyze CNN architectures for text processing",
      "Design and deploy transformer-based language models",
      "Apply modern NLP techniques to real-world problems"
    ],
    materials: [
      "Course slides and lecture notes",
      "Programming assignments in Python/PyTorch",
      "Research papers on recent NLP advances"
    ]
  };
}

// Check if test mode is enabled
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEST_MODE === 'true';
}

// Simulate processing delay for more realistic testing
export function simulateProcessingDelay(minMs: number = 1000, maxMs: number = 3000): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
} 