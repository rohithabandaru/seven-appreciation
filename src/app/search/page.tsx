'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { Post } from '@/types';
import { Search as SearchIcon, Users, BookOpen, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const trimmed = query.trim().toLowerCase();

  // Fetch posts from database API when query changes (debounced)
  useEffect(() => {
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/posts?page=1&limit=50`);
        if (res.ok) {
          const data = await res.json();
          const allPosts: Post[] = data.posts || [];
          // Client-side filter by query
          const filtered = allPosts.filter(
            (p) =>
              p.title?.toLowerCase().includes(trimmed) ||
              p.content?.toLowerCase().includes(trimmed) ||
              p.category?.toLowerCase().includes(trimmed) ||
              p.userName?.toLowerCase().includes(trimmed)
          );
          setPosts(filtered);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [trimmed]);

  const effectivePosts = trimmed ? posts : [];
  const effectiveHasSearched = trimmed ? hasSearched : false;

  const matchingMembers = trimmed
    ? MEMBERS_DATA.filter(
        (m) =>
          m.displayName.toLowerCase().includes(trimmed) ||
          m.name.toLowerCase().includes(trimmed) ||
          m.role.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFDF9] dark:bg-[#121014]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Search Community
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Find member profiles and community posts.
          </p>

          <div className="relative max-w-lg mx-auto pt-2">
            <SearchIcon className="absolute left-4 top-5 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, member name, category..."
              className="w-full rounded-2xl border border-rose-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3.5 pl-12 pr-4 text-xs font-medium text-zinc-800 dark:text-white shadow-sm focus:border-rose-500 focus:outline-hidden placeholder-zinc-400"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 text-rose-500 animate-spin" />
            <p className="text-xs text-zinc-400 mt-2">Searching...</p>
          </div>
        ) : trimmed && effectiveHasSearched ? (
          <div className="space-y-10">
            {/* Members */}
            {matchingMembers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <Users className="h-4 w-4 text-rose-500" />
                  <span>Members ({matchingMembers.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {matchingMembers.map((m) => (
                    <Link
                      key={m.id}
                      href={`/members#${m.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xs hover:border-rose-300 transition-colors"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                        <Image src={m.image} alt={m.displayName} fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{m.displayName}</h4>
                        <span className="text-[10px] text-rose-500">{m.role}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {effectivePosts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <BookOpen className="h-4 w-4 text-rose-500" />
                  <span>Community Posts ({effectivePosts.length})</span>
                </h3>
                <div className="space-y-3">
                  {effectivePosts.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-zinc-900 dark:text-white">{p.title}</h4>
                        <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">{p.category}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">{p.content}</p>
                      <p className="text-[10px] text-zinc-400">by {p.userName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {matchingMembers.length === 0 && effectivePosts.length === 0 && (
              <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                <SearchIcon className="mx-auto h-8 w-8 text-zinc-300" />
                <p>No results found for &ldquo;{query.trim()}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
            <SearchIcon className="mx-auto h-8 w-8 text-zinc-300" />
            <p>Type a search query above to find members or posts.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
