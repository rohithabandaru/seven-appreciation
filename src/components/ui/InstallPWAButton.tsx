'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Download, Smartphone, Check, Share, MoreVertical, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function useHydrated(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export default function InstallPWAButton() {
  const mounted = useHydrated();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if app is already running as PWA (deferred so it is not a
    // synchronous setState during the effect body)
    const detectStandalone = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const isStandaloneMode =
          window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as unknown as { standalone?: boolean }).standalone === true;
        setIsStandalone(Boolean(isStandaloneMode));
      }
    }, 0);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(detectStandalone);
    };
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs opacity-0"
        aria-hidden="true"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  const handleInstallClick = async () => {
    if (isStandalone) {
      alert('The Seven Appreciation App is already installed and running on your device!');
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsStandalone(true);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (isStandalone) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300/60">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
        <span>App Installed</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:opacity-95 transition-all hover:scale-102 active:scale-98"
        title="Install App on Phone / Desktop"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-rose-200 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4 text-center max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Smartphone className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Install App on your Phone</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Follow these 2 quick steps to add Seven Appreciation to your home screen:
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/80 dark:border-zinc-700 text-left text-xs space-y-3 text-zinc-800 dark:text-zinc-200">
              
              {/* iPhone / Safari Instructions */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <Share className="h-4 w-4" />
                  <span>On iPhone (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1">
                  <li>Tap the <strong className="text-zinc-900 dark:text-white">Share button</strong> at the bottom of Safari.</li>
                  <li>Tap <strong className="text-rose-600 dark:text-rose-400">&ldquo;Add to Home Screen&rdquo;</strong> <PlusSquare className="inline h-3.5 w-3.5" />.</li>
                </ol>
              </div>

              {/* Android / Chrome */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <MoreVertical className="h-4 w-4" />
                  <span>On Android Phone:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1">
                  <li>Tap the <strong className="text-zinc-900 dark:text-white">3 dots menu</strong> in the top right.</li>
                  <li>Tap <strong className="text-amber-600 dark:text-amber-400">&ldquo;Install app&rdquo;</strong> or <strong className="text-amber-600 dark:text-amber-400">&ldquo;Add to Home screen&rdquo;</strong>.</li>
                </ol>
              </div>

              {/* Laptop / Computer */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <Download className="h-4 w-4" />
                  <span>On Laptop / Computer (Chrome/Edge):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1">
                  <li>Look at the top URL address bar (where it says <em>localhost:3000</em>).</li>
                  <li>Click the small <strong className="text-purple-600 dark:text-purple-400">3-Squares or Laptop icon</strong> on the far right end of the address bar.</li>
                </ol>
              </div>

            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 py-3 text-xs font-bold text-white hover:opacity-95 transition-opacity"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
