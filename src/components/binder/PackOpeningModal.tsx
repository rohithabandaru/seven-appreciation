'use client';

import React, { useState } from 'react';
import { Photocard } from '@/lib/data/photocardsData';
import Photocard3D from './Photocard3D';
import { Sparkles, Gift, X, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardsUnlocked: (newCards: Photocard[]) => void;
}

interface PullResult {
  cards: Photocard[];
  alreadyOwned: string[];
  remainingPacks: number;
}

export default function PackOpeningModal({ isOpen, onClose, onCardsUnlocked }: PackOpeningModalProps) {
  const [packState, setPackState] = useState<'ready' | 'opening' | 'revealed' | 'error'>('ready');
  const [pulledCards, setPulledCards] = useState<Photocard[]>([]);
  const [alreadyOwned, setAlreadyOwned] = useState<string[]>([]);
  const [remainingPacks, setRemainingPacks] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleOpenPack = async () => {
    setPackState('opening');
    setErrorMessage('');

    try {
      const res = await fetch('/api/photocards/pack', { method: 'POST' });
      const data: Partial<PullResult> & { error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || 'Could not open a pack right now. Please try again.');
        setRemainingPacks(typeof data.remainingPacks === 'number' ? data.remainingPacks : 0);
        setPackState('error');
        return;
      }

      const cards = data.cards ?? [];
      setPulledCards(cards);
      setAlreadyOwned(data.alreadyOwned ?? []);
      setRemainingPacks(typeof data.remainingPacks === 'number' ? data.remainingPacks : 0);
      setPackState('revealed');
      if (cards.length > 0) {
        onCardsUnlocked(cards);
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setPackState('error');
    }
  };

  const handleResetAndClose = () => {
    setPackState('ready');
    setPulledCards([]);
    setAlreadyOwned([]);
    setErrorMessage('');
    onClose();
  };

  const hasMorePacks = remainingPacks > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col items-center justify-center text-center">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* READY STAGE: UNOPENED BOOSTER PACK */}
        {packState === 'ready' && (
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/30 border border-rose-400/50 px-4 py-1.5 text-xs font-bold text-rose-300 backdrop-blur-md">
              <Gift className="h-4 w-4" />
              <span>Daily Free Booster Pack</span>
            </div>

            {/* Glowing 3D Booster Pack */}
            <div
              onClick={handleOpenPack}
              className="relative w-64 h-96 rounded-3xl cursor-pointer group transition-all duration-300 hover:scale-105 select-none"
            >
              {/* Foil Pack Body */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-600 to-purple-800 p-1 shadow-2xl shadow-rose-500/50 flex flex-col justify-between overflow-hidden border-2 border-amber-300">
                {/* Metallic shine bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
                
                {/* Pack Top Serration */}
                <div className="bg-black/30 p-3 flex items-center justify-between text-[10px] font-mono text-amber-200 font-bold border-b border-amber-300/30">
                  <span>★ ENHYPEN EDITION ★</span>
                  <span>2 CARDS</span>
                </div>

                {/* Center Pack Logo */}
                <div className="my-auto text-center space-y-2 p-4">
                  <div className="inline-block rounded-2xl bg-white/20 backdrop-blur-md px-4 py-2 border border-white/40 shadow-inner">
                    <span className="text-xl font-black text-white tracking-wider block">SEVEN STARS</span>
                    <span className="text-[10px] tracking-widest text-amber-200 font-bold uppercase">Official Photocard Series</span>
                  </div>
                  <p className="text-xs text-rose-100 font-medium italic">
                    Unlock exclusive Rare & Holographic member moments!
                  </p>
                </div>

                {/* Pack Bottom Call to Action */}
                <div className="bg-black/40 p-4 rounded-b-2xl border-t border-amber-300/30 flex items-center justify-center gap-2 text-white font-bold text-xs group-hover:bg-rose-500 transition-colors">
                  <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
                  <span>TAP TO TEAR PACK</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400">
              Each pack contains 2 random cards — up to 3 packs per day. Collect all 38 cards to complete your binder!
            </p>
          </div>
        )}

        {/* OPENING STAGE: ANIMATED TEAR */}
        {packState === 'opening' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-purple-600 animate-spin blur-xl opacity-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-wide animate-pulse">
              TEARING BOOSTER PACK...
            </h3>
            <p className="text-xs text-rose-300">Summoning member photocards...</p>
          </div>
        )}

        {/* ERROR STAGE */}
        {packState === 'error' && (
          <div className="flex flex-col items-center space-y-6 py-10 animate-in zoom-in-95 duration-300">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/30 border border-rose-400/50 px-4 py-1.5 text-xs font-bold text-rose-300 backdrop-blur-md">
              <AlertTriangle className="h-4 w-4" />
              <span>Pack Not Opened</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-wide">
              {remainingPacks === 0 ? 'No Packs Left Today' : 'Something Went Wrong'}
            </h3>
            <p className="max-w-md text-xs text-zinc-300 leading-relaxed">{errorMessage}</p>
            <div className="flex items-center gap-4 pt-2">
              {hasMorePacks && (
                <button
                  onClick={handleOpenPack}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-xs font-bold text-white transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Try Again</span>
                </button>
              )}
              <button
                onClick={handleResetAndClose}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:opacity-95 transition-all"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        )}

        {/* REVEALED STAGE: SHOW CARDS */}
        {packState === 'revealed' && (
          <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-500 w-full">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded-full px-3 py-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Cards Added to Your Binder!</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                You Pulled {pulledCards.length} New Photocards!
              </h3>
              <p className="text-xs text-zinc-400">Hover or drag to inspect the 3D holographic shine & signatures.</p>
            </div>

            {alreadyOwned.length > 0 && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 px-4 py-1.5 text-[11px] font-bold text-amber-300">
                Duplicate pull{alreadyOwned.length > 1 ? 's' : ''}: {alreadyOwned.join(', ')} — already in your collection
              </p>
            )}

            {/* Pulled Cards Grid */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 my-4">
              {pulledCards.map((card, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-3">
                  <Photocard3D card={card} size="lg" isUnlocked={true} />
                  <div className="text-center">
                    <span className="text-sm font-bold text-white block">{card.memberName}</span>
                    <span className="text-xs text-rose-300 font-medium">{card.cardName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleOpenPack}
                disabled={!hasMorePacks}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-colors border ${
                  hasMorePacks
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{hasMorePacks ? `Open Another Pack (${remainingPacks} left today)` : 'No Packs Left Today'}</span>
              </button>

              <button
                onClick={handleResetAndClose}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:opacity-95 transition-all hover:scale-102"
              >
                <span>View in My Binder</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}