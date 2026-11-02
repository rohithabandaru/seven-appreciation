'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Sparkles,
  Search,
  ShieldCheck,
  Menu,
  X,
  MessageSquareHeart,
  BookOpen,
  Radio,
} from 'lucide-react';
import InstallPWAButton from '@/components/ui/InstallPWAButton';
import SocialShare from '@/components/ui/SocialShare';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Feed', icon: Sparkles },
    { href: '/community/engene-love', label: 'Daily Love 💌', icon: MessageSquareHeart },
    { href: '/live', label: 'Live Lounge', icon: Radio },
    { href: '/members', label: 'The Seven', icon: Users },
    { href: '/binder', label: 'Binder', icon: BookOpen },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'py-2 bg-[#FFFDF9]/85 dark:bg-[#121014]/85 backdrop-blur-xl border-b border-rose-200/50 dark:border-rose-900/40 shadow-lg shadow-rose-500/5'
            : 'py-3.5 bg-[#FFFDF9]/95 dark:bg-[#121014]/95 backdrop-blur-md border-b border-rose-100/60 dark:border-rose-900/30'
        }`}
      >
        {/* Subtle glowing animated gradient accent line at bottom of navbar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent pointer-events-none animate-gradient-flow" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.03]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-md shadow-rose-500/25 group-hover:shadow-lg group-hover:shadow-rose-500/40 transition-all duration-300">
              <Heart className="h-5 w-5 fill-white transition-transform duration-300 group-hover:scale-115 group-hover:animate-heart-pop" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                SEVEN <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 bg-clip-text text-transparent">APPRECIATION</span>
              </span>
            </div>
          </Link>

          {/* Desktop Core Navigation Links with Animated Active-Tab Pill */}
          <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex relative">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs xl:text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  {/* Sliding animated active pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-xl bg-rose-500/10 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 shadow-xs"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 h-4 w-4 transition-transform duration-200 ${isActive ? 'text-rose-500 scale-105' : 'text-zinc-400'}`} />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Controls & Create Post Modal Trigger */}
          <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
            <InstallPWAButton />

            <SocialShare
              title="Seven Appreciation – ENHYPEN Fan Community"
              description="A peaceful digital sanctuary to celebrate ENHYPEN with genuine appreciation. No fan wars, no rankings, just love."
              className="[&>button]:rounded-xl [&>button]:p-2 [&>button]:text-zinc-500 hover:[&>button]:bg-rose-50 hover:[&>button]:text-rose-600"
            />

            <Link
              href="/search"
              className="rounded-xl p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Search community"
              aria-label="Search community"
            >
              <Search className="h-4 w-4" />
            </Link>

            <ThemeToggle />

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
                  className="flex items-center gap-1.5 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-1 pr-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-rose-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs group"
                >
                  <UserAvatar name={session.user?.name || 'User'} image={session.user?.image} size={28} />
                  <span className="truncate max-w-[70px] xl:max-w-[100px]">{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all hover:scale-104 cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <Link
              href="/search"
              className="rounded-xl p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-100 dark:border-zinc-800 bg-[#FFFDF9]/98 dark:bg-[#121014]/98 backdrop-blur-xl px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-rose-50/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-rose-500' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-rose-100/70 dark:border-zinc-800 flex flex-col gap-2">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl p-2 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-rose-50"
                  >
                    <UserAvatar name={session.user?.name || 'User'} image={session.user?.image} size={28} />
                    <span>My Profile ({session.user?.name})</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full text-left rounded-xl p-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-2xl bg-rose-500 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/25"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
