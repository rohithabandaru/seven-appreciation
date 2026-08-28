'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export default function BuyMeCoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/Rohitha.Bandaru"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors"
      aria-label="Support the creator"
    >
      <Heart className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
      <span>Support Creator</span>
    </a>
  );
}
