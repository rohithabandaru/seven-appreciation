'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const { data: session, status } = useSession();
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

  const currentMessages = messagesByChannel[selectedChannel] ?? [];

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
        setMessagesByChannel((prev) => ({ ...prev, [channel]: data }));
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
    loadChannel(selectedChannel);

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

        {/* LIVE HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-900/30 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-purple-500/10 p-5 sm:p-8 backdrop-blur-md shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-600">
              <Radio className="h-3.5 w-3.5" />
              <span>Community Lounge</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Fan Chat Room
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg">
              A real-time space to share positive messages and cheer for the members together.
            </p>
          </div>

          {/* TAP FOR HEARTS CTA */}
          <button
            onClick={handleSendFloatingHeart}
            className="group relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-3 font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
          >
            <Heart className="h-5 w-5 fill-white group-hover:animate-bounce" />
            <div className="text-left">
              <span className="text-xs font-extrabold block">Send Live Hearts</span>
              <span className="text-[10px] opacity-90 font-mono">{activeHeartCount.toLocaleString()} Hearts Sent</span>
            </div>
          </button>
        </div>

        {/* MAIN CHAT & CHANNEL LAYOUT */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 items-start">

          {/* CHANNELS SELECTOR */}
          <div className="w-full lg:col-span-1 rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-3">
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
                  <UserAvatar name={member.displayName} image={member.image} size={20} />
                  <span className="truncate">{member.displayName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT STREAM CONTAINER */}
          <div className="w-full lg:col-span-3 rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-zinc-900 shadow-sm flex flex-col h-[560px] overflow-hidden">

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
                currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 p-3 border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 transition-colors group"
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
                  </div>
                ))
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
                  className="whitespace-nowrap rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-2xs flex-shrink-0 disabled:opacity-50"
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
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0"
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
