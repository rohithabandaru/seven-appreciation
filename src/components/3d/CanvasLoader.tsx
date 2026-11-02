'use client';

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-radial from-rose-50/20 via-transparent to-transparent">
      <div className="relative flex items-center justify-center">
        {/* Soft glowing ambient circle */}
        <div className="absolute h-20 w-20 rounded-full bg-rose-400/20 blur-xl animate-pulse" />
        
        {/* Spinning gradient ring */}
        <div className="h-12 w-12 rounded-full border-2 border-rose-200/50 border-t-rose-500 animate-spin" />
        
        {/* Centered pulsing heart */}
        <Heart className="absolute h-5 w-5 text-rose-500 fill-rose-500 animate-pulse" />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-500/80 tracking-wide">
        <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Illuminating Sanctuary...</span>
      </div>
    </div>
  );
}
