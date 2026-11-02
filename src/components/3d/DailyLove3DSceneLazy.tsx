'use client';

import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const DailyLove3DSceneComponent = dynamic(() => import('./DailyLove3DScene'), {
  ssr: false,
  loading: () => (
    <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center text-4xl select-none animate-pulse">
      💌
    </div>
  ),
});

export default function DailyLove3DSceneLazy() {
  return (
    <ErrorBoundary
      fallback={
        <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center text-5xl select-none">
          💌
        </div>
      }
    >
      <DailyLove3DSceneComponent />
    </ErrorBoundary>
  );
}
