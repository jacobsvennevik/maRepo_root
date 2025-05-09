'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, Brain, BookOpen, Tag, AlertCircle } from 'lucide-react';
import { FlashcardStatCard } from './components/FlashcardStatCard';
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
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg shadow-lg p-6 text-white backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-4">{projectData.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen size={20} className="text-emerald-100" />
              <span className="text-emerald-50">{projectData.sourceDocuments} Source Documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag size={20} className="text-emerald-100" />
              <span className="text-emerald-50">{projectData.topicsCovered} Topics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain size={20} className="text-emerald-100" />
              <span className="text-emerald-50">{projectData.totalFlashcards} Flashcards</span>
            </div>
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div className="glass-card rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium mb-4 text-emerald-800">AI Flashcard Generation</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-sm">
              <Plus size={20} className="mr-2" />
              Generate All Flashcards
            </button>
            <button className="flex-1 flex items-center justify-center px-4 py-2 bg-white/80 border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300 backdrop-blur-sm">
              <Tag size={20} className="mr-2" />
              Generate by Topic
            </button>
          </div>
        </div>

        {/* Flashcard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FlashcardStatCard label="Total Flashcards" value={projectData.totalFlashcards} colorClass="text-emerald-600" />
          <FlashcardStatCard label="Mastered" value={projectData.mastered} colorClass="text-emerald-500" />
          <FlashcardStatCard label="Needs Review" value={projectData.needsReview} colorClass="text-yellow-500" />
          <FlashcardStatCard label="Source Documents" value={projectData.sourceDocuments} colorClass="text-ocean-500" />
          <FlashcardStatCard label="Topics" value={projectData.topicsCovered} colorClass="text-indigo-500" />
        </div>

        {/* Review Prompt */}
        {projectData.pendingReviews > 0 && (
          <div className="bg-gradient-to-r from-yellow-50/90 to-amber-50/90 border border-yellow-200 rounded-lg p-4 animate-fade-in backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle size={20} className="text-yellow-600" />
                <p className="text-yellow-800">
                  🧠 You have {projectData.pendingReviews} topic sets to review today to retain memory.
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-sm">
                Start Reviewing
              </button>
            </div>
          </div>
        )}

        {/* Topic-Based Flashcard Cards */}
        <div className="glass-card rounded-lg backdrop-blur-sm">
          <div className="p-4 border-b border-emerald-100">
            <h2 className="text-lg font-medium text-emerald-800">Your Flashcards</h2>
          </div>
          <div className="divide-y divide-emerald-100">
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