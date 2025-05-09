'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, Brain, BookOpen, Tag, AlertCircle } from 'lucide-react';
import { ProjectBanner } from './components/ProjectBanner';
import { FlashcardAISuggestions } from './components/FlashcardAISuggestions';
import { FlashcardReviewPrompt } from './components/FlashcardReviewPrompt';
import { FlashcardTopicCard } from './components/FlashcardTopicCard';

export default function ProjectFlashcards() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Mock data - replace with actual data fetching
  const projectData = {
    title: "Biology 101",
    totalFlashcards: 24,
    mastered: 12,
    needsReview: 8,
    sourceDocuments: 3,
    topicsCovered: 5,
    pendingReviews: 3,
    topics: [
      {
        title: "Cell Structure",
        cardCount: 8,
        lastReviewed: "2 days ago",
        status: "mastered",
        sourceDoc: "Chapter 1",
        isAIGenerated: true
      },
      {
        title: "Periodic Table",
        cardCount: 6,
        lastReviewed: "5 days ago",
        status: "needs_review",
        sourceDoc: "Chapter 2",
        isAIGenerated: false
      }
    ]
  };

  return (
    <div className="relative">
      <div className="relative space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/projects" className="hover:text-emerald-600">Projects</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-medium text-gray-900">Flashcards</span>
        </div>

        {/* Project Context Banner */}
        <ProjectBanner
          title={projectData.title}
          sourceDocuments={projectData.sourceDocuments}
          topicsCovered={projectData.topicsCovered}
          totalFlashcards={projectData.totalFlashcards}
        />

        {/* AI Suggestions Panel */}
        <FlashcardAISuggestions />

        {/* Flashcard Stats */}
        {/* Removed stats row as per user request */}

        {/* Review Prompt */}
        <FlashcardReviewPrompt pendingReviews={projectData.pendingReviews} />

        {/* Topic-Based Flashcard Cards */}
        <div className="glass-card rounded-lg backdrop-blur-sm">
          <div className="p-2 border-b border-emerald-100">
            <h2 className="text-base font-semibold text-emerald-800">Your Flashcards</h2>
          </div>
          <div className="divide-y divide-emerald-100 text-sm">
            {projectData.topics.map((topic, index) => (
              <FlashcardTopicCard
                key={index}
                title={topic.title}
                cardCount={topic.cardCount}
                lastReviewed={topic.lastReviewed}
                status={topic.status as 'mastered' | 'needs_review'}
                sourceDoc={topic.sourceDoc}
                isAIGenerated={topic.isAIGenerated}
                onReview={() => {}}
                onGenerateMore={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 