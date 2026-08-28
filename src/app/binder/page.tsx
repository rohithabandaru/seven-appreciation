'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import Photocard3D from '@/components/binder/Photocard3D';
import PackOpeningModal from '@/components/binder/PackOpeningModal';
import { PHOTOCARDS_DATA, Photocard } from '@/lib/data/photocardsData';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Gift,
  BookOpen,
  Trophy,
  Layers,
} from 'lucide-react';

const RARITIES = ['All', 'Common', 'Rare', 'Holo', 'Secret', 'Wishlist'] as const;

export default function BinderPage() {
  const { data: session } = useSession();
  const [unlockedCardIds, setUnlockedCardIds] = useState<Set<string>>(new Set());
  const [wishlistCardIds, setWishlistCardIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedWishlist = localStorage.getItem('seven_wishlist_photocards');
        if (storedWishlist) {
          return new Set(JSON.parse(storedWishlist));
        }
      } catch {
        // ignore malformed stored wishlist
      }
    }
    return new Set();
  });
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const handleWishlistToggle = (cardId: string) => {
    setWishlistCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
        setToast({ type: 'warning', title: 'Removed from Wishlist', message: 'Card removed from your personal wishlist.' });
      } else {
        next.add(cardId);
        setToast({ type: 'success', title: 'Added to Wishlist!', message: 'Card saved to your personal wishlist ❤️' });
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('seven_wishlist_photocards', JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const seedStarterCards = () => {
    const starterIds = ['pc-hs-1', 'pc-jw-1', 'pc-nk-1'];
    setUnlockedCardIds(new Set(starterIds));
    if (typeof window !== 'undefined') {
      localStorage.setItem('seven_unlocked_photocards', JSON.stringify(starterIds));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (session?.user?.id) {
        fetch('/api/photocards')
          .then((res) => res.json())
          .then((data: { cardIds: string[] }) => {
            const serverIds = data.cardIds ?? [];
            setUnlockedCardIds(new Set(serverIds));

            const localStored = localStorage.getItem('seven_unlocked_photocards');
            if (localStored) {
              try {
                const localIds: string[] = JSON.parse(localStored);
                const extras = localIds.filter((id) => !serverIds.includes(id));
                if (extras.length > 0) {
                  fetch('/api/photocards/merge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cardIds: extras }),
                  })
                    .then((mergeRes) => {
                      if (mergeRes.ok) {
                        return mergeRes.json();
                      }
                      throw new Error('Merge failed');
                    })
                    .then((mergedData: { cardIds?: string[] }) => {
                      if (mergedData.cardIds) {
                        setUnlockedCardIds(new Set(mergedData.cardIds));
                      }
                      localStorage.removeItem('seven_unlocked_photocards');
                    })
                    .catch(() => {
                      // Preserve local cards in localStorage if merge fails so retry happens on next session
                    });
                } else {
                  localStorage.removeItem('seven_unlocked_photocards');
                }
              } catch {
                // ignore malformed localStorage
              }
            }
          })
          .catch(() => seedStarterCards());
      } else {
        const stored = localStorage.getItem('seven_unlocked_photocards');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUnlockedCardIds(new Set(parsed));
          } catch {
            seedStarterCards();
          }
        } else {
          seedStarterCards();
        }
      }
    }
  }, [session?.user?.id]);

  const handleCardsUnlocked = (newCards: Photocard[]) => {
    setUnlockedCardIds((prev) => {
      const next = new Set(prev);
      newCards.forEach((c) => next.add(c.id));
      const arrayToSave = Array.from(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seven_unlocked_photocards', JSON.stringify(arrayToSave));
      }
      if (session?.user?.id) {
        fetch('/api/photocards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardIds: arrayToSave }),
        });
      }
      return next;
    });

    setToast({
      type: 'success',
      title: 'New Cards Added to Binder!',
      message: `Unlocked ${newCards.map(c => c.memberName).join(' & ')} cards.`
    });
  };

  // Filter cards
  const filteredCards = PHOTOCARDS_DATA.filter((card) => {
    const memberMatch = selectedMember === 'all' || card.memberSlug === selectedMember;
    const rarityMatch =
      selectedRarity === 'All'
        ? true
        : selectedRarity === 'Wishlist'
          ? wishlistCardIds.has(card.id)
          : card.rarity === selectedRarity;
    return memberMatch && rarityMatch;
  });

  const totalCards = PHOTOCARDS_DATA.length;
  const unlockedCount = PHOTOCARDS_DATA.filter(c => unlockedCardIds.has(c.id)).length;
  const completionPercentage = Math.round((unlockedCount / totalCards) * 100);

  return (
    <div className="min-h-screen flex flex-col  font-sans">
      <Navbar />

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PackOpeningModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onCardsUnlocked={handleCardsUnlocked}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50/80 via-amber-50/50 to-[#FFFDF9] py-14 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6 text-center">
            
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100/90 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700 shadow-2xs">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Digital Photocard Collection & Binder</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight">
              ENHYPEN{' '}
              <span className="bg-gradient-to-r from-rose-500 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                Collector Binder
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Open daily booster packs to pull rare, holographic, and secret cards of all 7 members. Flip each card to read verified handwritten messages and signatures!
            </p>

            {/* Daily Pack Open CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsPackModalOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-rose-300/40 hover:opacity-95 transition-all hover:scale-105"
              >
                <Gift className="h-5 w-5 animate-bounce" />
                <span>Open Today&apos;s Booster Pack (Free)</span>
              </button>
            </div>

            {/* Binder Stats Progress Bar */}
            <div className="mx-auto max-w-xl rounded-3xl bg-white/90 border border-rose-100 p-5 shadow-sm space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-700 flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Binder Completion Progress
                </span>
                <span className="text-rose-600 font-mono">
                  {unlockedCount} / {totalCards} Cards ({completionPercentage}%)
                </span>
              </div>

              {/* Progress track */}
              <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Collect all 7 members & secret cards</span>
                <span>✨ 3D Holographic Parallax</span>
              </div>
            </div>

          </div>
        </section>

        {/* BINDER CONTROLS & FILTER BAR */}
        <section className="sticky top-16 z-30 border-b border-rose-100 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            
            {/* Member Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedMember('all')}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all border ${
                  selectedMember === 'all'
                    ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50/50'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>All Members</span>
              </button>

              {MEMBERS_DATA.map((member) => (
                <button
                  key={member.slug}
                  onClick={() => setSelectedMember(member.slug)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all border ${
                    selectedMember === member.slug
                      ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50/50'
                  }`}
                >
                  <span>{member.displayName}</span>
                </button>
              ))}
            </div>

            {/* Rarity & Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">Rarity:</span>
                {RARITIES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRarity(r)}
                    className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all border ${
                      selectedRarity === r
                        ? 'border-amber-400 bg-amber-100 text-amber-800'
                        : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPackModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>Open Pack</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 9-POCKET BINDER GRID VIEW */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="rounded-3xl border-4 border-zinc-800/20 bg-zinc-900/5 p-6 sm:p-10 shadow-2xl backdrop-blur-xs">
            
            {/* Binder Header Tab */}
            <div className="flex items-center justify-between border-b border-zinc-300/60 pb-4 mb-8">
              <div className="flex items-center gap-2 text-zinc-800 font-extrabold text-sm sm:text-base">
                <BookOpen className="h-5 w-5 text-rose-600" />
                <span>Official 9-Pocket Sleeve Album</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                Showing {filteredCards.length} Cards
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
              {filteredCards.map((card) => {
                const isUnlocked = unlockedCardIds.has(card.id);
                return (
                  <div key={card.id} className="flex flex-col items-center space-y-2">
                    <Photocard3D
                      card={card}
                      isUnlocked={isUnlocked}
                      size="md"
                      isWishlisted={wishlistCardIds.has(card.id)}
                      onWishlistToggle={() => handleWishlistToggle(card.id)}
                    />
                    {isUnlocked && (
                      <div className="text-center mt-1">
                        <span className="text-xs font-bold text-zinc-800 block truncate max-w-[180px]">
                          {card.cardName}
                        </span>
                        <span className="text-[10px] text-zinc-400">{card.era}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
