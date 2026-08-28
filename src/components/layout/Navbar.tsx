'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import {
  Heart,
  Users,
  Sparkles,
  Search,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  MessageSquareHeart,
  BookOpen,
  Radio
} from 'lucide-react';
import CreatePostModal from '@/components/ui/CreatePostModal';
import InstallPWAButton from '@/components/ui/InstallPWAButton';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navLinks = [
    { href: '/', label: 'Feed', icon: Sparkles },
    { href: '/live', label: 'Live Lounge', icon: Radio },
    { href: '/members', label: 'The Seven', icon: Users },
    { href: '/binder', label: 'Binder', icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-rose-100/60 dark:border-rose-900/30 bg-[#FFFDF9]/85 dark:bg-[#121014]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.01]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-md shadow-rose-200">
              <Heart className="h-5 w-5 fill-white transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-zinc-900 leading-tight">
                SEVEN <span className="gradient-text-warm">APPRECIATION</span>
              </span>
            </div>
          </Link>

          {/* Desktop Core Navigation Links */}
          <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold transition-all ${isActive
                      ? 'bg-rose-500/10 text-rose-600 font-bold'
                      : 'text-zinc-600 hover:bg-rose-50/70 hover:text-rose-600'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-rose-500' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Controls & Create Post Modal Trigger */}
          <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
            <InstallPWAButton />

            <Link
              href="/search"
              className="rounded-xl p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Search community"
              aria-label="Search community"
            >
              <Search className="h-4 w-4" />
            </Link>

            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/70 px-2.5 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                <span className="hidden xl:inline">Mod Hub</span>
              </Link>
            )}

            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-1 pr-2.5 text-xs font-bold text-zinc-800 hover:bg-rose-100 transition-colors shadow-2xs group"
                >
                  <UserAvatar name={session.user?.name || 'User'} image={session.user?.image} size={28} />
                  <span className="truncate max-w-[70px] xl:max-w-[100px]">{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="h-8 w-8 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-600 hover:border-rose-300 transition-all"
                  title="My Profile"
                  aria-label="My Profile"
                >
                  <Users className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-2xs"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Prominent Quick Post Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition-all hover:scale-102 hover:shadow-lg hover:shadow-rose-300 active:scale-98"
            >
              <MessageSquareHeart className="h-4 w-4 fill-white" />
              <span>Share Appreciation</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs"
              title="Share Appreciation"
              aria-label="Share Appreciation"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-rose-100 dark:border-rose-900/30 bg-[#FFFDF9]/95 dark:bg-[#121014]/95 px-4 pt-3 pb-6 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${isActive
                        ? 'bg-rose-500/10 text-rose-600 font-bold'
                        : 'text-zinc-700 hover:bg-rose-50'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-rose-500' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-rose-50"
              >
                <Search className="h-4 w-4 text-zinc-400" />
                <span>Search Community</span>
              </Link>

              <div className="mt-4 flex flex-col gap-2.5 border-t border-zinc-100 pt-4">
                <div className="flex justify-center mb-1">
                  <InstallPWAButton />
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 py-3 text-xs font-bold text-white shadow-md"
                >
                  <Heart className="h-4 w-4 fill-white" />
                  <span>Share Appreciation Post</span>
                </button>

                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-50 py-2.5 text-xs font-bold text-purple-700 border border-purple-200"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Mod Hub</span>
                  </Link>
                )}

                {session ? (
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 py-2.5 text-xs font-semibold text-zinc-700"
                  >
                    Sign Out ({session.user?.name})
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white shadow-xs"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Post Creation Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => {
            // Trigger refresh or window event so feed picks up new post
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('postCreated'));
            }
          }}
        />
      )}
    </>
  );
}
