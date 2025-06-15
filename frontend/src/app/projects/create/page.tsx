'use client';

import { useRouter } from 'next/navigation';
import { PageLayout } from './components/layout';
import { ProjectTypeCards } from './components/project-type-cards';

export default function CreateProject() {
  const router = useRouter();

  const handleProjectTypeSelect = (type: 'school' | 'self-study') => {
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