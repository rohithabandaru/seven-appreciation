'use client';

import React from 'react';

// Safe lazy loader for @react-three/postprocessing
// Allows the scene to run immediately while supporting the full post-processing stack once installed
export default function HeroEffects({ isMobile = false }: { isMobile?: boolean }) {
  // Disable post-processing on mobile or low-tier devices for smooth 60fps performance
  if (isMobile) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const post = require('@react-three/postprocessing');
    const { EffectComposer, Bloom, DepthOfField, Vignette } = post;

    return (
      <EffectComposer disableNormalPass multisampling={0}>
        {/* Subtle, non-washout Bloom for specular clearcoat highlights & pink glow */}
        <Bloom
          luminanceThreshold={0.72}
          luminanceSmoothing={0.45}
          intensity={0.55}
          mipmapBlur
        />

        {/* Cinematic depth of field: near & far particles blur, mid-range heart stays crisp */}
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.04}
          bokehScale={2.5}
          height={480}
        />

        {/* Light warm vignette focusing gaze toward center-right heart */}
        <Vignette eskil={false} offset={0.15} darkness={0.45} />
      </EffectComposer>
    );
  } catch {
    // If @react-three/postprocessing is not yet installed in node_modules,
    // gracefully continue without crashing
    return null;
  }
}

