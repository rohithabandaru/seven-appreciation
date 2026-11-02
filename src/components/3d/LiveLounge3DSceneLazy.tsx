'use client';

import dynamic from 'next/dynamic';
import CanvasLoader from './CanvasLoader';

const LiveLounge3DScene = dynamic(() => import('./LiveLounge3DScene'), {
  ssr: false,
  loading: () => <CanvasLoader />,
});

export default LiveLounge3DScene;

