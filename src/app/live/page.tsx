'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UserAvatar from '@/components/ui/UserAvatar';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { useSession } from 'next-auth/react';
import {
  Radio,
  Send,
  Heart,
  Sparkles,
  Users,
  MessageCircle,
  Zap,
  Smile
} from 'lucide-react';

interface LiveMessage {
  id: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  memberSlug?: string;
  country?: string;
  heartsCount: number;
  timestamp: string;
}

const INITIAL_MESSAGES: LiveMessage[] = [];

const QUICK_REACTIONS = [
  '❤️ Love from India!',
  '🔥 Outstanding Performance!',
  '👑 Absolute Visual King!',
  '✨ Vocal Masterpiece!',
  '☀️ Brightest Smile Ever!',
  '💖 Always Supporting You!'
];

export default function LiveRoomPage() {
  const { data: session } = useSession();
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [messages, setMessages] = useState<LiveMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [activeHeartCount, setActiveHeartCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  // Auto-scroll chat to bottom when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMessage: LiveMessage = {
      id: 'm-' + (++idCounter.current).toString(36) + '-' + messages.length,
      userName: session?.user?.name || 'Kind Supporter',
      userAvatar: session?.user?.image || null,
      text: text.trim(),
      memberSlug: selectedChannel === 'all' ? undefined : selectedChannel,
      country: '🇮🇳 India',
      heartsCount: 1,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, newMessage]);
    if (!textToSend) setInputText('');
  };

  const handleSendFloatingHeart = () => {
    setActiveHeartCount((prev) => prev + 1);
    const newHeart = { id: (++idCounter.current), x: Math.random() * 80 + 10 };
    setFloatingHearts((prev) => [...prev, newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const handleLikeMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, heartsCount: m.heartsCount + 1 } : m))
    );
  };

  const filteredMessages = selectedChannel === 'all'
    ? messages
    : messages.filter((m) => !m.memberSlug || m.memberSlug === selectedChannel);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFDF9] dark:bg-[#121014] overflow-x-hidden">
      <Navbar />

      {/* FLOATING HEARTS ANIMATION OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-10 animate-float-up text-2xl select-none"
            style={{ left: `${h.x}%` }}
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
              A casual space to share positive messages and cheer for the members together.
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
          
          {/* CHANNELS SELECTOR (HORIZONTAL PILLS ON MOBILE/TABLET, SIDEBAR ON DESKTOP) */}
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
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-2">
                  <Smile className="h-8 w-8 text-zinc-300" />
                  <p className="text-xs font-bold">No messages in this channel yet.</p>
                  <p className="text-[11px]">Be the first to send live appreciation!</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 p-3 border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 transition-colors group"
                  >
                    <UserAvatar name={msg.userName} image={msg.userAvatar} size={32} className="flex-shrink-0 mt-0.5" />

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-white truncate">{msg.userName}</span>
                          {msg.country && (
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-700/50 px-2 py-0.5 rounded-full">
                              {msg.country}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{msg.timestamp}</span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium break-words">{msg.text}</p>
                    </div>

                    <button
                      onClick={() => handleLikeMessage(msg.id)}
                      className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-rose-500 border border-rose-100 dark:border-rose-900/50 shadow-2xs hover:bg-rose-50 transition-colors flex-shrink-0"
                    >
                      <Heart className="h-3 w-3 fill-rose-500" />
                      <span>{msg.heartsCount}</span>
                    </button>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* QUICK REACTION CHIPS */}
            <div className="p-2 border-t border-rose-100 dark:border-rose-900/30 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 ml-2" />
              {QUICK_REACTIONS.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(reaction)}
                  className="whitespace-nowrap rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 hover:border-rose-300 transition-all shadow-2xs flex-shrink-0"
                >
                  {reaction}
                </button>
              ))}
            </div>

            {/* CHAT INPUT FORM */}
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
                disabled={!inputText.trim()}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
