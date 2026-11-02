'use client';

import dynamic from 'next/dynamic';
import CanvasLoader from './CanvasLoader';

const HeroSceneLazy = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <CanvasLoader />,
});

export default HeroSceneLazy;
