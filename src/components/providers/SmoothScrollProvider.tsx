'use client';

import React from 'react';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Clean pass-through provider.
 * Uses native CSS smooth scroll for maximum browser stability, touch smoothness,
 * and zero bundle/runtime crashes.
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
