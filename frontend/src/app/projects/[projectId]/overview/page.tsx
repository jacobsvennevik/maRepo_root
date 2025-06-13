'use client';

import { useParams } from 'next/navigation';
import { 
  OceanBackground,
  OceanHeader,
  FloatingStatsCards,
  LearningJourney,
  UpcomingVoyages,
  OceanActionSection
} from './components';
import { useFloatingAnimation } from './hooks/use-floating-animation';

export default function ProjectOverview() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { waveOffset, floatingCards } = useFloatingAnimation();

  return (
    <OceanBackground>
      <div className="space-y-8 p-8">
        <OceanHeader />
        
        <FloatingStatsCards 
          waveOffset={waveOffset} 
          floatingCards={floatingCards} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LearningJourney 
              waveOffset={waveOffset} 
              floatingCards={floatingCards} 
            />
          </div>
          <div className="lg:col-span-1">
            <UpcomingVoyages 
              waveOffset={waveOffset} 
              floatingCards={floatingCards} 
            />
          </div>
        </div>

        <OceanActionSection />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </OceanBackground>
  );
} 