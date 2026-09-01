import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Sparkles, AtSign, Camera, Play, MessageCircle } from 'lucide-react';
import BuyMeCoffee from '@/components/ui/BuyMeCoffee';

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 dark:border-rose-900/30 bg-amber-50/60 dark:bg-[#1C1917] text-zinc-700 dark:text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
                <Heart className="h-4 w-4 fill-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                SEVEN <span className="text-rose-500">APPRECIATION</span>
              </span>
            </div>

            <blockquote className="border-l-2 border-rose-300 pl-3.5 text-xs italic text-zinc-600 dark:text-zinc-400 font-serif">
              &quot;Support without attacking anyone else. Appreciate without comparing. Celebrate without competing.&quot;
            </blockquote>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              A peaceful digital sanctuary created to celebrate the journeys, art, and inspirational impact of seven exceptional artists with genuine respect, kindness, and positivity.
            </p>

            <BuyMeCoffee />
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Community Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/members" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors">
                  The Seven Members
                </Link>
              </li>
              <li>
                <Link href="/binder" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors">
                  Photocards & Binder
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors">
                  Fan Chat Room
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines & Legal Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Safety & Transparency</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/guidelines" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors">
                  Copyright & Takedown Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-rose-600 transition-colors font-medium">
                  Privacy & Safety Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Explicit Unofficial Disclaimer Box */}
        <div className="mt-10 rounded-2xl border border-rose-200/80 dark:border-rose-900/30 bg-white/80 dark:bg-[#1C1917]/80 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed backdrop-blur-sm">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Unofficial Project Disclaimer
          </p>
          This website is an <strong>independent, unofficial fan appreciation & community project</strong>. It is not officially operated, endorsed, managed, affiliated, or represented by any of the seven artists, their management companies, or their parent organizations. All public information, embedded links, and media remain the property of their respective copyright owners.
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-rose-100 dark:border-rose-900/30 pt-6 text-center sm:flex-row sm:text-left text-xs text-zinc-400">
          <div>&copy; {new Date().getFullYear()} Seven Appreciation Community. Built with genuine love and care.</div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5 sm:pr-32 font-bold text-sm">
            <a href="https://x.com/bandaru_ro61488" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sky-500 hover:text-sky-600 transition-colors" title="X (Twitter)">
              <AtSign className="h-5 w-5" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
            <a href="https://www.instagram.com/enha100930/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 transition-colors" title="Instagram">
              <Camera className="h-5 w-5" />
              <span className="hidden sm:inline">Instagram</span>
            </a>
            <a href="https://www.youtube.com/@forenhypen1009" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors" title="YouTube">
              <Play className="h-5 w-5 fill-current" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <a href="https://discord.gg/DQDVrjhWd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#5865F2] hover:opacity-80 transition-colors" title="Join Discord Server">
              <MessageCircle className="h-5 w-5 fill-current" />
              <span className="hidden sm:inline">Discord</span>
            </a>
          </div>
 <a
  href="https://maidensail.com/startup/seven-appreciation"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="https://maidensail.com/badge/seven-appreciation.svg"
    alt="Featured on MaidenSail"
    width={180}
    height={44}
    className="h-11 w-auto"
  />
</a>
        </div>
      </div>
    </footer>
  );
}
