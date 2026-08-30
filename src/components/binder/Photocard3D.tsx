'use client';

import React, { useState, useRef } from 'react';
import { Photocard } from '@/lib/data/photocardsData';
import Image from 'next/image';
import { Sparkles, Star, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

interface Photocard3DProps {
  card: Photocard;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onClick?: () => void;
}

export default function Photocard3D({
  card,
  isUnlocked = true,
  size = 'md',
  isWishlisted = false,
  onWishlistToggle,
  onClick
}: Photocard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -15;
    const rY = ((x - centerX) / centerX) * 15;

    setRotateX(rX);
    setRotateY(rY);
    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  const sizeClasses = {
    sm: 'w-40 h-60 text-xs',
    md: 'w-56 h-80 text-sm',
    lg: 'w-72 h-104 text-base'
  };

  const rarityBadgeColors: Record<string, string> = {
    Common: 'bg-zinc-600 text-white border-zinc-500',
    Rare: 'bg-blue-600 text-white border-blue-400 shadow-blue-500/50',
    Holo: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white border-white/50 shadow-pink-500/50 animate-pulse',
    Secret: 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 text-white border-amber-300 shadow-amber-500/80 animate-pulse'
  };

  if (!isUnlocked) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-3xl border-2 border-dashed border-zinc-300 bg-zinc-100/70 p-4 flex flex-col items-center justify-center text-center select-none shadow-xs`}>
        <div className="rounded-2xl bg-zinc-200 p-3 mb-2 text-zinc-400">
          <Star className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold text-zinc-500">{card.cardNumber}</span>
        <span className="text-[11px] text-zinc-400 mt-1">Undiscovered Card</span>
        <span className="text-[10px] text-rose-500/80 font-semibold mt-2">Open packs to unlock!</span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} select-none cursor-pointer perspective-1000 group`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full duration-200 ease-out transition-transform transform-3d rounded-3xl"
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg) scale3d(1.05, 1.05, 1.05)`
            : `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg) scale3d(1, 1, 1)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-zinc-900 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Main Card Image */}
          <Image
            src={card.image}
            alt={card.cardName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Rarity & Holographic Shine Overlay */}
          {(card.rarity === 'Holo' || card.rarity === 'Secret') && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-60 transition-opacity"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 0, 128, 0.8) 0%, rgba(0, 255, 255, 0.6) 40%, rgba(255, 255, 0, 0.4) 70%, transparent 100%)`,
                opacity: isHovered ? 0.75 : 0.3
              }}
            />
          )}

          {/* Foil Specular Glare */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-60 transition-opacity"
            style={{
              background: `linear-gradient(${rotateY * 4}deg, transparent 20%, rgba(255, 255, 255, 0.9) ${glareX}%, transparent 80%)`
            }}
          />

          {/* Top Bar: Rarity Badge, Wishlist & Card Number */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-md ${rarityBadgeColors[card.rarity]}`}>
              {card.rarity === 'Holo' && '✨ '}
              {card.rarity === 'Secret' && '👑 '}
              {card.rarity}
            </span>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {onWishlistToggle && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWishlistToggle();
                  }}
                  className={`rounded-full p-1.5 backdrop-blur-md transition-all ${isWishlisted
                      ? 'bg-rose-500 text-white shadow-rose-500/50 shadow-md scale-110'
                      : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80 border border-white/20'
                    }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                </button>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                {card.cardNumber}
              </span>
            </div>
          </div>

          {/* Bottom Card Title & Era */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 pt-8 text-white pointer-events-none">
            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>{card.era}</span>
            </div>
            <h4 className="text-xs font-black truncate mt-0.5">{card.cardName}</h4>
            <p className="text-[10px] text-zinc-300 font-medium truncate mt-0.5 italic">
              &quot;{card.quote}&quot;
            </p>
          </div>

          {/* Quick Flip Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="absolute bottom-2 right-2 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40 backdrop-blur-md transition-colors z-20"
            title="Flip card"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-gradient-to-br from-zinc-900 via-zinc-800 to-rose-950 p-5 text-white flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Card Back Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1 text-rose-400 font-extrabold text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ENHYPEN OFFICIAL</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">{card.cardNumber}</span>
          </div>

          {/* Signature & Message Area */}
          <div className="my-auto text-center space-y-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-xs">
              <p className="text-[11px] italic text-rose-100 font-serif leading-relaxed">
                &quot;{card.quote}&quot;
              </p>
            </div>

            {/* Member Signature Graphic */}
            <div className="py-1">
              <span className="font-serif text-lg font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 bg-clip-text text-transparent italic tracking-wider">
                {card.signature}
              </span>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">Verified Member Message</p>
            </div>
          </div>

          {/* Card Back Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Authentic Card
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="rounded-full bg-white/20 px-2 py-0.5 text-white hover:bg-white/40"
            >
              Flip Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
