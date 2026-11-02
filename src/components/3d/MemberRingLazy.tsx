'use client';

import dynamic from 'next/dynamic';
import CanvasLoader from './CanvasLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const MemberRingComponent = dynamic(() => import('./MemberRing'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full flex items-center justify-center">
      <CanvasLoader />
    </div>
  ),
});

export default function MemberRingLazy(props: { onFilterMember?: (memberSlug: string) => void }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-[480px] w-full flex items-center justify-center">
          <CanvasLoader />
        </div>
      }
    >
      <MemberRingComponent {...props} />
    </ErrorBoundary>
  );
}
