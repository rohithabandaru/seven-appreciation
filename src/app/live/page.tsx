'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UserAvatar from '@/components/ui/UserAvatar';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Radio,
  Send,
  Heart,
  Sparkles,
  Users,
  MessageCircle,
  Zap,
  Smile,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveLounge3DSceneLazy from '@/components/3d/LiveLounge3DSceneLazy';
import TiltCard from '@/components/ui/TiltCard';

interface LiveMessage {
  id: string;
  channel: string;
  userName: string;
  userAvatar?: string | null;
  content: string;
  hearts: number;
  heartedByMe: boolean;
  createdAt: string;
}

interface LiveStreamEventData {
  type: 'ready' | 'message' | 'heart';
  user?: string | null;
  payload?: unknown;
}

const QUICK_REACTIONS = [
  '❤️ Love from India!',
  '🔥 Outstanding Performance!',
  '👑 Absolute Visual King!',
  '✨ Vocal Masterpiece!',
  '☀️ Brightest Smile Ever!',
  '💖 Always Supporting You!'
];

const CHANNELS = ['all', ...MEMBERS_DATA.map((m) => m.slug)];

export default function LiveRoomPage() {
  const { status } = useSession();
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [messagesByChannel, setMessagesByChannel] =
    useState<Record<string, LiveMessage[]>>(() =>
      Object.fromEntries(CHANNELS.map((slug) => [slug, []]))
    );
  const [loadingChannel, setLoadingChannel] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHANNELS.map((slug) => [slug, false]))
  );
  const [inputText, setInputText] = useState('');
  const [activeHeartCount, setActiveHeartCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; drift: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const heartIdCounter = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const loadedChannelsRef = useRef<Set<string>>(new Set());

  const currentMessages = useMemo(() => {
    const list = messagesByChannel[selectedChannel] ?? [];
    const seen = new Set<string>();
    return list.filter((m) => {
      if (!m?.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messagesByChannel, selectedChannel]);

  // Handle incoming live stream events for the current channel.
  const handleStreamEvent = useCallback((data: LiveStreamEventData) => {
    if (data.type === 'message' && data.payload) {
      const msg = data.payload as LiveMessage;
      setMessagesByChannel((prev) => {
        const list = prev[msg.channel] ?? [];
        if (list.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.channel]: [...list, msg] };
      });
    } else if (data.type === 'heart' && data.payload) {
      const p = data.payload as { id: string; hearts: number; heartedByMe: boolean };
      setMessagesByChannel((prev) => {
        let changed = false;
        const next: Record<string, LiveMessage[]> = { ...prev };
        for (const slug of CHANNELS) {
          const list = next[slug];
          const idx = list.findIndex((m) => m.id === p.id);
          if (idx !== -1) {
            changed = true;
            const updated = [...list];
            updated[idx] = { ...updated[idx], hearts: p.hearts, heartedByMe: p.heartedByMe };
            next[slug] = updated;
          }
        }
        return changed ? next : prev;
      });
    }
  }, []);

  // Load messages for a channel from the server (once).
  const loadChannel = useCallback(
    async (channel: string) => {
      if (loadedChannelsRef.current.has(channel)) return;
      setLoadingChannel((prev) => ({ ...prev, [channel]: true }));
      try {
        const res = await fetch(`/api/live?channel=${encodeURIComponent(channel)}`);
        if (!res.ok) throw new Error('Failed to load messages');
        const json = await res.json();
        const data: LiveMessage[] = (json.data as LiveMessage[]) || [];
        setMessagesByChannel((prev) => {
          const existing = prev[channel] ?? [];
          const seen = new Set<string>();
          const merged: LiveMessage[] = [];
          for (const m of [...existing, ...data]) {
            if (m?.id && !seen.has(m.id)) {
              seen.add(m.id);
              merged.push(m);
            }
          }
          return { ...prev, [channel]: merged };
        });
        loadedChannelsRef.current.add(channel);
      } catch (e) {
        console.error('Error loading live messages:', e);
      } finally {
        setLoadingChannel((prev) => ({ ...prev, [channel]: false }));
      }
    },
    []
  );

  // Open/reconnect SSE stream whenever the selected channel changes.
  useEffect(() => {
    // Defer so the loading flag isn't set synchronously during the effect body.
    const loadTimer = setTimeout(() => {
      loadChannel(selectedChannel);
    }, 0);

    const source = new EventSource(`/api/live/stream?channel=${encodeURIComponent(selectedChannel)}`);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LiveStreamEventData;
        handleStreamEvent(data);
      } catch {
        // ignore malformed frames
      }
    };
    source.onerror = () => {
      // EventSource auto-reconnects; no action needed here.
    };

    return () => {
      clearTimeout(loadTimer);
      source.close();
      eventSourceRef.current = null;
    };
  }, [selectedChannel, loadChannel, handleStreamEvent]);

  // Auto-scroll to bottom when a new message arrives in the active channel.
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || sending || status !== 'authenticated') return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: selectedChannel, content: text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to send message.');
        return;
      }
      const msg = json as LiveMessage;
      setMessagesByChannel((prev) => {
        const list = prev[msg.channel] ?? [];
        if (list.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.channel]: [...list, msg] };
      });
      loadedChannelsRef.current.add(msg.channel);
      if (!textToSend) setInputText('');
    } catch (e) {
      console.error('Error sending message:', e);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendFloatingHeart = () => {
    setActiveHeartCount((prev) => prev + 1);
    const newHeart = {
      id: (++heartIdCounter.current),
      x: Math.random() * 80 + 10,
      drift: (Math.random() * 60 - 30)
    };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2600);
  };

  const handleHeartMessage = async (id: string) => {
    if (status !== 'authenticated') {
      setError('Please log in to send hearts.');
      return;
    }
    try {
      const res = await fetch('/api/live/heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Could not update hearts.');
        return;
      }
      // Optimistically update UI from server response.
      const p = json as { id: string; hearts: number; heartedByMe: boolean };
      setMessagesByChannel((prev) => {
        let changed = false;
        const next: Record<string, LiveMessage[]> = { ...prev };
        for (const slug of CHANNELS) {
          const list = next[slug];
          const idx = list.findIndex((m) => m.id === p.id);
          if (idx !== -1) {
            changed = true;
            const updated = [...list];
            updated[idx] = { ...updated[idx], hearts: p.hearts, heartedByMe: p.heartedByMe };
            next[slug] = updated;
          }
        }
        return changed ? next : prev;
      });
    } catch (e) {
      console.error('Error hearting message:', e);
    }
  };

  const isAuthenticated = status === 'authenticated';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFDF9] dark:bg-[#121014] overflow-x-hidden">
      <Navbar />

      {/* FLOATING HEARTS ANIMATION OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-10 animate-float-up text-2xl select-none"
            style={{ left: `${h.x}%`, ['--float-drift' as string]: `${h.drift}px` }}
          >
            ❤️
          </div>
        ))}
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* LIVE HEADER BANNER WITH 3D STAGE & PARALLAX */}
        <TiltCard
          maxTilt={7}
          glowAccent="#F43F5E"
          className="relative overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-500/15 p-5 sm:p-7 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Ambient 3D floor glow */}
          <div className="absolute inset-0 bg-radial from-rose-500/15 via-transparent to-transparent pointer-events-none" />

          {/* Left Text & Status with 3D Popout */}
          <div
            className="space-y-2 text-center md:text-left z-10 max-w-lg"
            style={{ transform: 'translateZ(24px)' }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full bg-rose-500/10 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-2xs backdrop-blur-md">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 duration-1000" />
                <span className="animate-pulse absolute inline-flex h-5 w-5 rounded-full bg-rose-400/25" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              </span>
              <Radio className="h-3.5 w-3.5" />
              <span className="tracking-wide">LIVE LOUNGE • ENGENE SANCTUARY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              ENGENE Live Chat Room
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-lg leading-relaxed">
              A real-time sanctuary to share positive cheer, celebrate milestones, and send love to all seven members together.
            </p>
          </div>

          {/* 3D Live Heart Beacon Stage with 360 Drag & 7 Orbiting Stars */}
          <div
            className="w-full md:w-80 h-56 sm:h-64 my-[-12px] z-10 flex-shrink-0"
            style={{ transform: 'translateZ(18px)' }}
          >
            <LiveLounge3DSceneLazy burstTrigger={activeHeartCount} />
          </div>

          {/* TAP FOR HEARTS CTA with 3D Popout */}
          <div style={{ transform: 'translateZ(28px)' }} className="z-10 flex-shrink-0">
            <button
              onClick={handleSendFloatingHeart}
              className="group relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-rose-400/30"
            >
              <Heart className="h-5 w-5 fill-white group-hover:animate-heart-pop transition-transform" />
              <div className="text-left">
                <span className="text-xs font-extrabold block">Send Live Hearts ❤️</span>
                <span className="text-[10px] opacity-90 font-mono">{activeHeartCount.toLocaleString()} Hearts Sent</span>
              </div>
            </button>
          </div>
        </TiltCard>

        {/* MAIN CHAT & CHANNEL LAYOUT */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 items-start">

          {/* CHANNELS SELECTOR */}
          <div className="w-full lg:col-span-1 rounded-3xl border border-rose-100/90 dark:border-rose-900/40 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-lg backdrop-blur-md space-y-3 transition-all hover:shadow-2xl hover:border-rose-300 dark:hover:border-rose-700/60">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-rose-500" />
              <span>Live Channels</span>
            </h3>

            <div className="flex flex-row overflow-x-auto lg:flex-col gap-1.5 pb-1 lg:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedChannel('all')}
                className={`flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  selectedChannel === 'all'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-zinc-50 dark:bg-zinc-800 lg:bg-transparent'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>All Seven Lounge</span>
              </button>

              {MEMBERS_DATA.map((member) => (
                <button
                  key={member.slug}
                  onClick={() => setSelectedChannel(member.slug)}
                  className={`flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    selectedChannel === member.slug
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-zinc-50 dark:bg-zinc-800 lg:bg-transparent'
                  }`}
                >
                  <UserAvatar name={member.displayName} image={member.image} imagePosition={member.imagePosition} size={20} />
                  <span className="truncate">{member.displayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT STREAM CONTAINER */}
          <div className="w-full lg:col-span-3 rounded-3xl border border-rose-100/90 dark:border-rose-900/40 bg-white/95 dark:bg-zinc-900/95 shadow-xl flex flex-col h-[580px] overflow-hidden backdrop-blur-md transition-all hover:shadow-2xl hover:border-rose-300/80 dark:hover:border-rose-700/60 ring-1 ring-rose-500/10">

            {/* CHAT HEADER */}
            <div className="p-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-extrabold text-zinc-900 dark:text-white capitalize truncate">
                  {selectedChannel === 'all' ? 'All Seven General Lounge' : `${selectedChannel} Channel`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold flex-shrink-0">
                <span className="hidden sm:inline text-zinc-400">Be kind & respectful</span>
              </div>
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {loadingChannel[selectedChannel] ? (
                <div className="h-full flex items-center justify-center text-zinc-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-2">
                  <Smile className="h-8 w-8 text-zinc-300" />
                  <p className="text-xs font-bold">No messages in this channel yet.</p>
                  <p className="text-[11px]">Be the first to send live appreciation!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {currentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                      className="flex items-start gap-3 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/50 p-3.5 border border-zinc-100/90 dark:border-zinc-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-rose-300 dark:hover:border-rose-700/60 transition-all duration-200 group"
                    >
                      <UserAvatar name={msg.userName} image={msg.userAvatar} size={32} className="flex-shrink-0 mt-0.5" />

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-white truncate">
                            {msg.userName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium break-words">
                          {msg.content}
                        </p>
                      </div>

                      <button
                        onClick={() => handleHeartMessage(msg.id)}
                        disabled={status !== 'authenticated'}
                        className={`flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-bold border shadow-2xs transition-colors flex-shrink-0 ${
                          msg.heartedByMe
                            ? 'text-rose-500 border-rose-200 dark:border-rose-900/60'
                            : 'text-rose-500 border-rose-100 dark:border-rose-900/50 hover:bg-rose-50'
                        } disabled:opacity-50`}
                      >
                        <Heart className={`h-3 w-3 ${msg.heartedByMe ? 'fill-rose-500' : ''}`} />
                        <span>{msg.hearts}</span>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="px-4 py-2 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-100 dark:border-rose-900/30">
                {error}
              </div>
            )}

            {/* QUICK REACTION CHIPS */}
            <div className="p-2 border-t border-rose-100 dark:border-rose-900/30 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 ml-2" />
              {QUICK_REACTIONS.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(reaction)}
                  disabled={!isAuthenticated || sending}
                  className="whitespace-nowrap rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 hover:border-rose-300 hover:scale-105 active:scale-95 transition-all shadow-2xs flex-shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {reaction}
                </button>
              ))}
            </div>

            {/* CHAT INPUT FORM */}
            {isAuthenticated ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-rose-100 dark:border-rose-900/30 flex items-center gap-2 rounded-b-3xl"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Share love in ${selectedChannel === 'all' ? 'All Seven Lounge' : selectedChannel}...`}
                  className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-rose-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-104 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-3 rounded-b-3xl bg-zinc-50/50 dark:bg-zinc-800/30">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  You can view messages. Please log in to send messages and hearts.
                </p>
                <Link
                  href="/login"
                  className="flex-shrink-0 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all"
                >
                  Log in
                </Link>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
