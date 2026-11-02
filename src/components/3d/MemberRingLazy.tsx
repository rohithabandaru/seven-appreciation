'use client';

import dynamic from 'next/dynamic';
import CanvasLoader from './CanvasLoader';

const MemberRingLazy = dynamic(() => import('./MemberRing'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full flex items-center justify-center">
      <CanvasLoader />
    </div>
  ),
});

export default MemberRingLazy;
