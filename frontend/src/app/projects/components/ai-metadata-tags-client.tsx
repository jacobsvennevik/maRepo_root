'use client';

import { useEffect, useState } from 'react';
import { ProjectV2 } from '../types';
import { TagBadgeList } from '@/components/ui/tag-badge';
// Temporarily disable feature flag check to fix import issues
const isFeatureEnabled = (flag: string) => false;

interface AIMetadataTagsClientProps {
  project: ProjectV2;
}

export default function AIMetadataTagsClient({ project }: AIMetadataTagsClientProps) {
  const [showAITags, setShowAITags] = useState(false);

  useEffect(() => {
    // Check feature flag on client side only
    setShowAITags(isFeatureEnabled("SHOW_AI_META"));
  }, []);

  if (!showAITags || !project.meta?.ai_generated_tags || project.meta.ai_generated_tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <TagBadgeList
        tags={project.meta.ai_generated_tags}
        maxTags={3}
        showMore={true}
        variant="secondary"
        size="sm"
      />
    </div>
  );
} 