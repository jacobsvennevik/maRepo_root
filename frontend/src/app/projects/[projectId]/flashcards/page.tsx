'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, Brain, BookOpen, Tag, AlertCircle } from 'lucide-react';

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
          <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
            <h3 className="font-medium text-emerald-800">Total Flashcards</h3>
            <p className="text-2xl font-bold text-emerald-600">{projectData.totalFlashcards}</p>
          </div>
          <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
            <h3 className="font-medium text-emerald-800">Mastered</h3>
            <p className="text-2xl font-bold text-emerald-500">{projectData.mastered}</p>
          </div>
          <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
            <h3 className="font-medium text-emerald-800">Needs Review</h3>
            <p className="text-2xl font-bold text-yellow-500">{projectData.needsReview}</p>
          </div>
          <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
            <h3 className="font-medium text-emerald-800">Source Documents</h3>
            <p className="text-2xl font-bold text-ocean-500">{projectData.sourceDocuments}</p>
          </div>
          <div className="glass-card p-4 rounded-lg hover:scale-102 transition-all duration-300 backdrop-blur-sm">
            <h3 className="font-medium text-emerald-800">Topics</h3>
            <p className="text-2xl font-bold text-indigo-500">{projectData.topicsCovered}</p>
          </div>
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
              <div key={index} className="p-4 hover:bg-emerald-50/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-emerald-900">{topic.title}</h3>
                      {topic.isAIGenerated && (
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-ocean-100 to-ocean-200 text-ocean-800 rounded-full">
                          AI Generated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-emerald-600">
                      <span>{topic.cardCount} cards</span>
                      <span>•</span>
                      <span>Last reviewed {topic.lastReviewed}</span>
                      <span>•</span>
                      <span>{topic.sourceDoc}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      topic.status === 'mastered' 
                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                        : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
                    }`}>
                      {topic.status === 'mastered' ? 'Mastered' : 'Needs Review'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-sm">
                        Review Now
                      </button>
                      <button className="px-3 py-1 text-sm border-2 border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all duration-300">
                        Generate More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 