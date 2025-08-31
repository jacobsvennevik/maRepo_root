'use client';

import dynamic from 'next/dynamic';
import { ProjectV2 } from '../types';

// Dynamically import the component to prevent SSR hydration issues
const AIMetadataTagsClient = dynamic(() => import('@/app/projects/components/ai-metadata-tags-client'), {
  ssr: false,
  loading: () => null
});

interface AIMetadataTagsProps {
  project: ProjectV2;
}

export function AIMetadataTags({ project }: AIMetadataTagsProps) {
  return <AIMetadataTagsClient project={project} />;
} 