'use client';

import { useState, useEffect } from 'react';

export type DeviceTier = 'high' | 'medium' | 'low';

export interface DeviceCapabilities {
  tier: DeviceTier;
  isLowEnd: boolean;
  isMobile: boolean;
  maxDpr: number;
  particleCount: number;
  enableComplexShaders: boolean;
}

const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  tier: 'high',
  isLowEnd: false,
  isMobile: false,
  maxDpr: 1.5,
  particleCount: 120,
  enableComplexShaders: true,
};

/**
 * Hook to detect device capability tier to keep 3D frame rates locked at 60fps
 * and avoid battery or CPU drain on mobile and low-spec machines.
 */
export function useDeviceTier(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect mobile by user agent or screen size
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    // Estimate hardware capability
    const nav = navigator as unknown as {
      hardwareConcurrency?: number;
      deviceMemory?: number;
    };

    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;

    let tier: DeviceTier = 'high';
    if (cores <= 2 || memory <= 2) {
      tier = 'low';
    } else if (cores <= 4 || memory <= 4 || isMobile) {
      tier = 'medium';
    }

    const isLowEnd = tier === 'low';
    const maxDpr = isLowEnd ? 1.0 : isMobile ? 1.25 : 1.5;
    const particleCount = isLowEnd ? 35 : isMobile ? 60 : 120;
    const enableComplexShaders = !isLowEnd;

    setCapabilities({
      tier,
      isLowEnd,
      isMobile,
      maxDpr,
      particleCount,
      enableComplexShaders,
    });
  }, []);

  return capabilities;
}

export default useDeviceTier;
