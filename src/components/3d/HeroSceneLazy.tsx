'use client';

import dynamic from 'next/dynamic';
import CanvasLoader from './CanvasLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const HeroSceneComponent = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <CanvasLoader />,
});

export default function HeroSceneLazy(props: { burstTrigger?: number }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-400/20 via-pink-300/15 to-purple-400/20 blur-3xl" />
        </div>
      }
    >
      <HeroSceneComponent {...props} />
    </ErrorBoundary>
  );
}
