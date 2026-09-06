'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sendVisit = () => {
      try {
        navigator.sendBeacon(
          '/api/analytics/visit',
          new Blob([JSON.stringify({ path: pathname })], {
            type: 'application/json',
          })
        );
      } catch {
        fetch('/api/analytics/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') sendVisit();
    };

    sendVisit();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pathname]);

  return null;
}