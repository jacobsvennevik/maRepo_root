/**
 * Shared Title Generation Utilities
 * 
 * Centralized utilities for generating titles, topics, and descriptions
 * across different wizard types. Ensures consistency and reusability
 * while following CEFR-B2 guidelines and uniqueness constraints.
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SourceItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type: 'flashcard' | 'file' | 'study_material';
  flashcard_count?: number;
  file_type?: string;
}

export interface TitleGenerationOptions {
  contentType: 'quiz' | 'flashcard' | 'diagnostic' | 'project';
  sources: SourceItem[];
  quizType?: 'formative' | 'summative' | 'diagnostic' | 'mastery';
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  template?: string;
  maxLength?: number;
  ensureUnique?: boolean;
  existingTitles?: string[];
}

export interface GeneratedMetadata {
  topic: string;
  title: string;
  description: string;
  confidence: number;
  keywords: string[];
  suggestedTags: string[];
}

// ============================================================================
// Constants and Configuration
// ============================================================================

const CONTENT_TYPE_SUFFIXES = {
  quiz: {
    formative: 'Practice Quiz',
    summative: 'Assessment',
    diagnostic: 'Diagnostic Quiz',
    mastery: 'Mastery Test',
    default: 'Quiz',
  },
  flashcard: {
    default: 'Flashcards',
    study: 'Study Cards',
    review: 'Review Set',
  },
  diagnostic: {
    default: 'Assessment',
    quick: 'Quick Check',
    comprehensive: 'Comprehensive Assessment',
  },
  project: {
    default: 'Project',
    study: 'Study Project',
    course: 'Course Project',
  },
};

const DIFFICULTY_DESCRIPTORS = {
  BEGINNER: ['Introduction to', 'Basic', 'Fundamentals of', 'Getting Started with'],
  INTERMEDIATE: ['Understanding', 'Working with', 'Exploring', 'Core'],
  ADVANCED: ['Advanced', 'Mastering', 'In-depth', 'Expert'],
  EXPERT: ['Research-level', 'Professional', 'Specialized', 'Expert-level'],
};

const CEFR_B2_WORDS = {
  action_verbs: ['assess', 'evaluate', 'analyze', 'explore', 'understand', 'demonstrate', 'review', 'practice', 'master'],
  descriptors: ['comprehensive', 'essential', 'fundamental', 'practical', 'effective', 'structured', 'systematic'],
  connectors: ['including', 'focusing on', 'covering', 'examining', 'featuring'],
};

const DOMAIN_KEYWORDS = {
  science: ['biology', 'chemistry', 'physics', 'anatomy', 'genetics', 'molecular'],
  technology: ['programming', 'software', 'algorithm', 'database', 'system', 'network'],
  mathematics: ['calculus', 'algebra', 'geometry', 'statistics', 'probability', 'equation'],
  language: ['grammar', 'vocabulary', 'syntax', 'literature', 'writing', 'reading'],
  business: ['management', 'finance', 'marketing', 'strategy', 'economics', 'accounting'],
  history: ['ancient', 'medieval', 'modern', 'war', 'civilization', 'empire'],
  arts: ['painting', 'sculpture', 'music', 'theater', 'design', 'composition'],
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract dominant concepts from source names and descriptions
 */
const extractConcepts = (sources: SourceItem[]): string[] => {
  const concepts: string[] = [];
  
  sources.forEach(source => {
    const text = `${source.name || ''} ${source.title || ''} ${source.description || ''}`.toLowerCase();
    
    // Extract domain-specific keywords
    Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword) && !concepts.includes(keyword)) {
          concepts.push(keyword);
        }
      });
    });
    
    // Extract potential topic words (2-3 word phrases)
    const words = text.split(/\s+/).filter(word => word.length > 3);
    words.forEach((word, index) => {
      if (index < words.length - 1) {
        const phrase = `${word} ${words[index + 1]}`;
        if (phrase.length > 8 && phrase.length < 25 && !concepts.includes(phrase)) {
          concepts.push(phrase);
        }
      }
    });
  });
  
  return concepts.slice(0, 10); // Limit to top 10 concepts
};

/**
 * Determine the primary domain/subject from sources
 */
const determineDomain = (sources: SourceItem[]): string => {
  const domainScores: Record<string, number> = {};
  
  sources.forEach(source => {
    const text = `${source.name || ''} ${source.title || ''} ${source.description || ''}`.toLowerCase();
    
    Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      domainScores[domain] = (domainScores[domain] || 0) + score;
    });
  });
  
  const topDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topDomain ? topDomain[0] : 'general';
};

/**
 * Extract topic from source names using intelligent parsing
 */
const extractTopic = (sources: SourceItem[]): string => {
  if (sources.length === 0) return 'General Knowledge';
  
  // Strategy 1: Use first source name/title, cleaned up
  const firstSource = sources[0];
  let topic = firstSource.title || firstSource.name || 'Unknown Topic';
  
  // Remove file extensions
  topic = topic.replace(/\.[^.]+$/, '');
  
  // Remove common prefixes/suffixes
  topic = topic.replace(/^(Chapter|Lesson|Unit|Week|Day)\s+\d+:?\s*/i, '');
  topic = topic.replace(/\s*(Notes|Summary|Overview|Introduction)$/i, '');
  
  // Handle multiple sources - try to find common theme
  if (sources.length > 1) {
    const concepts = extractConcepts(sources);
    if (concepts.length > 0) {
      // Use the most common concept as topic
      topic = concepts[0].split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }
  
  // Ensure proper case
  topic = topic.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  // Limit length
  if (topic.length > 40) {
    topic = topic.substring(0, 37) + '...';
  }
  
  return topic || 'General Knowledge';
};

/**
 * Generate title using template and smart substitution
 */
const generateTitle = (options: TitleGenerationOptions): string => {
  const { contentType, sources, quizType, difficulty, template, maxLength = 60 } = options;
  
  const topic = extractTopic(sources);
  
  // Get appropriate suffix
  let suffix = CONTENT_TYPE_SUFFIXES[contentType].default;
  if (contentType === 'quiz' && quizType) {
    suffix = CONTENT_TYPE_SUFFIXES.quiz[quizType] || suffix;
  }
  
  // Add difficulty descriptor if provided
  let difficultyPrefix = '';
  if (difficulty && DIFFICULTY_DESCRIPTORS[difficulty]) {
    const descriptors = DIFFICULTY_DESCRIPTORS[difficulty];
    difficultyPrefix = descriptors[Math.floor(Math.random() * descriptors.length)] + ' ';
  }
  
  // Generate title
  let title: string;
  if (template) {
    title = template
      .replace('{topic}', topic)
      .replace('{type}', suffix)
      .replace('{difficulty}', difficultyPrefix.trim());
  } else {
    // Default template: "{difficulty} {topic} — {type}"
    title = `${difficultyPrefix}${topic} — ${suffix}`;
  }
  
  // Clean up double spaces and trim
  title = title.replace(/\s+/g, ' ').trim();
  
  // Ensure length constraint
  if (title.length > maxLength) {
    const targetLength = maxLength - 3; // Account for "..."
    title = title.substring(0, targetLength).trim() + '...';
  }
  
  return title;
};

/**
 * Generate description using CEFR-B2 compliant language
 */
const generateDescription = (options: TitleGenerationOptions): string => {
  const { contentType, sources, quizType, difficulty } = options;
  
  const topic = extractTopic(sources).toLowerCase();
  const concepts = extractConcepts(sources);
  const domain = determineDomain(sources);
  
  // Select appropriate action verb
  const actionVerbs = CEFR_B2_WORDS.action_verbs;
  let actionVerb = 'explore';
  
  if (contentType === 'quiz') {
    actionVerb = quizType === 'diagnostic' ? 'assess' : 
                 quizType === 'summative' ? 'evaluate' : 
                 'practice';
  } else if (contentType === 'flashcard') {
    actionVerb = 'review';
  }
  
  // Build description components
  const baseDescription = `${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} your understanding of ${topic}`;
  
  let additionalContext = '';
  if (concepts.length > 0) {
    const topConcepts = concepts.slice(0, 3);
    additionalContext = ` including ${topConcepts.join(', ')}`;
  }
  
  let purposeClause = '';
  if (contentType === 'quiz') {
    purposeClause = quizType === 'formative' ? 
      '. This practice quiz helps reinforce your learning.' :
      quizType === 'summative' ? 
      '. This assessment evaluates your mastery of key concepts.' :
      '. This diagnostic helps identify areas for improvement.';
  } else if (contentType === 'flashcard') {
    purposeClause = '. Use these cards for effective spaced repetition study.';
  }
  
  const description = `${baseDescription}${additionalContext}${purposeClause}`;
  
  // Ensure length constraints (max 200 characters)
  if (description.length > 200) {
    return description.substring(0, 197) + '...';
  }
  
  return description;
};

/**
 * Ensure title uniqueness by adding disambiguators
 */
const ensureUniqueness = (title: string, existingTitles: string[]): string => {
  if (!existingTitles.includes(title)) {
    return title;
  }
  
  // Try adding version numbers
  for (let i = 2; i <= 10; i++) {
    const versionedTitle = `${title} (v${i})`;
    if (!existingTitles.includes(versionedTitle)) {
      return versionedTitle;
    }
  }
  
  // Fallback to timestamp
  const timestamp = new Date().toISOString().slice(5, 10); // MM-DD format
  return `${title} (${timestamp})`;
};

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Generate comprehensive metadata for content
 */
export const generateMetadata = (options: TitleGenerationOptions): GeneratedMetadata => {
  const topic = extractTopic(options.sources);
  let title = generateTitle(options);
  const description = generateDescription(options);
  const keywords = extractConcepts(options.sources);
  
  // Ensure uniqueness if required
  if (options.ensureUnique && options.existingTitles) {
    title = ensureUniqueness(title, options.existingTitles);
  }
  
  // Calculate confidence based on source quality
  let confidence = 0.7; // Base confidence
  
  if (options.sources.length > 0) {
    confidence += 0.1; // Has sources
  }
  if (options.sources.length > 2) {
    confidence += 0.1; // Multiple sources
  }
  if (keywords.length > 2) {
    confidence += 0.1; // Rich content
  }
  
  confidence = Math.min(confidence, 1.0);
  
  // Generate suggested tags based on domain and difficulty
  const suggestedTags = [
    determineDomain(options.sources),
    options.difficulty?.toLowerCase() || 'intermediate',
    options.contentType,
  ].filter(Boolean);
  
  return {
    topic,
    title,
    description,
    confidence,
    keywords: keywords.slice(0, 5),
    suggestedTags,
  };
};

/**
 * Quick title generation for simple use cases
 */
export const generateQuickTitle = (
  contentType: 'quiz' | 'flashcard' | 'diagnostic' | 'project',
  sourceName: string,
  quizType?: string
): string => {
  const mockSource: SourceItem = {
    id: '1',
    name: sourceName,
    type: 'file',
  };
  
  return generateTitle({
    contentType,
    sources: [mockSource],
    quizType: quizType as any,
  });
};

/**
 * Validate generated title against quality criteria
 */
export const validateTitle = (title: string): { isValid: boolean; issues: string[]; score: number } => {
  const issues: string[] = [];
  let score = 100;
  
  // Length checks
  if (title.length < 5) {
    issues.push('Title too short (minimum 5 characters)');
    score -= 30;
  }
  if (title.length > 60) {
    issues.push('Title too long (maximum 60 characters)');
    score -= 20;
  }
  
  // Format checks
  if (!/^[A-Z]/.test(title)) {
    issues.push('Should start with capital letter');
    score -= 10;
  }
  
  if (/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/.test(title)) {
    issues.push('Contains special characters');
    score -= 15;
  }
  
  // Content quality checks
  if (title.split(' ').length < 2) {
    issues.push('Should contain multiple words');
    score -= 10;
  }
  
  if (title.toLowerCase() === title) {
    issues.push('Should use proper capitalization');
    score -= 10;
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    score: Math.max(0, score),
  };
};

export default {
  generateMetadata,
  generateQuickTitle,
  validateTitle,
  extractTopic,
  extractConcepts,
  determineDomain,
};

