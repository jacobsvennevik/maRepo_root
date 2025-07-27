'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from './components/layout';
import { ProjectTypeCards } from './components/project-type-cards';
import { performComprehensiveCleanup } from './utils/cleanup-utils';

export default function CreateProject() {
  const router = useRouter();

  const handleProjectTypeSelect = async (type: 'school' | 'self-study') => {
    // Perform cleanup before starting new project
    try {
      await performComprehensiveCleanup();
    } catch (error) {
      console.warn('Cleanup failed, continuing with project creation:', error);
    }
    
    if (type === 'self-study') {
      router.push('/projects/create-self-study');
    } else {
      router.push('/projects/create-school');
    }
  };

  return (
    <PageLayout
      title="Create New Project"
      subtitle="Choose the type of project you want to create."
    >
      <ProjectTypeCards onProjectTypeSelect={handleProjectTypeSelect} />
    </PageLayout>
  );
} 