'use client';

import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const LiveLounge3DSceneComponent = dynamic(() => import('./LiveLounge3DScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center animate-pulse text-rose-500">
      <div className="text-4xl mb-2">💖</div>
      <div className="text-xs font-semibold tracking-wider uppercase opacity-75">Loading Live Beacon...</div>
    </div>
  ),
});

export default function LiveLounge3DSceneLazy(props: { burstTrigger?: number }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-rose-500">
          <div className="text-5xl mb-2">💖</div>
          <div className="text-xs font-semibold tracking-wider uppercase opacity-75">Live Lounge Beacon</div>
        </div>
      }
    >
      <LiveLounge3DSceneComponent {...props} />
    </ErrorBoundary>
  );
}
