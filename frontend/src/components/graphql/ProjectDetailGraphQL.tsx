/**
 * GraphQL query component for flexible data fetching.
 */
"use client";

import { useState, useEffect } from 'react';
import { graphqlService, GET_PROJECT_DETAIL, GET_STUDY_STATS } from '@/services/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { StudyStatsDisplay } from '@/components/shared/study-stats-display';
import { UI_CONSTANTS } from '@/constants/design-tokens';

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetailGraphQL({ projectId }: ProjectDetailProps) {
  const [projectData, setProjectData] = useState<any>(null);
  const [studyStats, setStudyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project detail and study stats in parallel
        const [projectResult, statsResult] = await Promise.all([
          graphqlService.query(GET_PROJECT_DETAIL, { id: projectId }),
          graphqlService.query(GET_STUDY_STATS)
        ]);

        setProjectData(projectResult.projectDetail);
        setStudyStats(statsResult.studyStats);
      } catch (err) {
        console.error('GraphQL query error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache and refetch
      graphqlService.clearCache();
      
      const [projectResult, statsResult] = await Promise.all([
        graphqlService.query(GET_PROJECT_DETAIL, { id: projectId }),
        graphqlService.query(GET_STUDY_STATS)
      ]);

      setProjectData(projectResult.projectDetail);
      setStudyStats(statsResult.studyStats);
    } catch (err) {
      console.error('GraphQL refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!projectData) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Project not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{projectData.project.name}</CardTitle>
              <p className="text-gray-600 mt-2">{projectData.project.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{projectData.project.type}</Badge>
              <Button onClick={refreshData} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Study Statistics */}
      {studyStats && (
        <StudyStatsDisplay 
          stats={{
            total_cards: studyStats.totalCards,
            reviewed_today: studyStats.reviewedToday,
            due_cards: studyStats.dueCards,
            study_streak: studyStats.studyStreak,
            completion_rate: studyStats.completionRate,
            cards_by_difficulty: studyStats.cardsByDifficulty
          }}
          showProgressBar={true}
        />
      )}

      {/* Files */}
      {projectData.files && projectData.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({projectData.files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectData.files.map((file: any) => (
                <div key={file.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{file.filename}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flashcard Sets */}
      {projectData.flashcardSets && projectData.flashcardSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Flashcard Sets ({projectData.flashcardSets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectData.flashcardSets.map((set: any) => (
                <div key={set.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{set.title}</h4>
                    <Badge variant="outline">{set.flashcards.length} cards</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{set.description}</p>
                  
                  {/* Sample flashcards */}
                  <div className="space-y-2">
                    {set.flashcards.slice(0, UI_CONSTANTS.MAX_CARDS_PREVIEW).map((card: any) => (
                      <div key={card.id} className="bg-gray-50 p-2 rounded text-sm">
                        <p><strong>Q:</strong> {card.question}</p>
                        <p><strong>A:</strong> {card.answer}</p>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            Difficulty {card.difficulty}
                          </Badge>
                          {card.nextReview && (
                            <span className="text-xs text-gray-500">
                              Next: {new Date(card.nextReview).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {set.flashcards.length > UI_CONSTANTS.MAX_CARDS_PREVIEW && (
                      <p className="text-xs text-gray-500">
                        ... and {set.flashcards.length - UI_CONSTANTS.MAX_CARDS_PREVIEW} more cards
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reflections */}
      {projectData.recentReflections && projectData.recentReflections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reflections ({projectData.recentReflections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectData.recentReflections.map((reflection: any) => (
                <div key={reflection.id} className="border rounded-lg p-3">
                  <h5 className="font-medium">{reflection.title}</h5>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {reflection.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(reflection.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
