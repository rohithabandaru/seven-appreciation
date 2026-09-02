'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Zap,
  Globe,
  KeyRound,
  UserPlus
} from 'lucide-react';
import Toast from '@/components/ui/Toast';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center text-xs text-zinc-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { status } = useSession();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'demo'>('signin');
  
  // Sign in / Sign up form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToPledge, setAgreedToPledge] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  // Check if IP is banned or if NextAuth returned an OAuth error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMsg = 'Authentication failed. Please try again.';
      if (errorParam === 'OAuthSignin' || errorParam === 'OAuthCallback' || errorParam === 'Configuration') {
        errorMsg = 'Google OAuth is not configured or client credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) in .env are invalid.';
      } else if (errorParam === 'AccessDenied') {
        errorMsg = 'Access was denied during Google sign in.';
      }
      queueMicrotask(() => setToast({
        type: 'error',
        title: 'Sign In Error',
        message: errorMsg,
      }));
    }

    fetch('/api/ban')
      .then(res => res.json())
      .then(data => {
        if (data.banned) {
          setIsBanned(true);
          setToast({
            type: 'error',
            title: 'Access Denied',
            message: 'Your IP address has been banned by an administrator. You cannot log in.'
          });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Handle Form Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBanned) {
      setToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Your IP address has been banned. You cannot log in.'
      });
      return;
    }

    if (!agreedToPledge) {
      setToast({
        type: 'warning',
        title: 'Community Pledge Required',
        message: 'Please agree to our core principle: Support without attacking anyone else.'
      });
      return;
    }

    if (!email.trim()) {
      setToast({
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const displayName = name.trim() || email.split('@')[0];
      const emailValue = email.trim().toLowerCase();

      if (!emailValue.includes('@')) {
        setToast({ type: 'warning', title: 'Invalid Email', message: 'Please enter a valid email address.' });
        setIsLoading(false);
        return;
      }

      if (activeTab === 'signup') {
        if (!displayName || displayName.length < 2) {
          setToast({ type: 'warning', title: 'Name Too Short', message: 'Name must be at least 2 characters long.' });
          setIsLoading(false);
          return;
        }
        if (!password.trim() || password.length < 8) {
          setToast({ type: 'warning', title: 'Weak Password', message: 'Password must be at least 8 characters long.' });
          setIsLoading(false);
          return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
          setToast({ type: 'warning', title: 'Weak Password', message: 'Password must contain uppercase, lowercase, number, and special character.' });
          setIsLoading(false);
          return;
        }
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailValue, name: displayName, password }),
        });
        if (!regRes.ok) {
          const data = await regRes.json();
          let errorMessage = data.error || 'Could not create account.';
          if (data.details?.fieldErrors) {
            const fieldErrs = Object.values(data.details.fieldErrors).flat();
            if (fieldErrs.length > 0 && fieldErrs[0]) {
              errorMessage = String(fieldErrs[0]);
            }
          }
          setToast({ type: 'error', title: 'Registration Failed', message: errorMessage });
          setIsLoading(false);
          return;
        }
      }

      const isDemoUser = ['supporter', 'mod', 'aria', 'sunny', 'supporter@seven.app', 'mod@seven.app', 'aria@seven.app', 'sunny@seven.app', 'kind supporter', 'community moderator'].includes(email.trim().toLowerCase());

      if (activeTab === 'signin' && !password.trim() && !isDemoUser) {
        setToast({
          type: 'warning',
          title: 'Password Required',
          message: 'Please enter your password to sign in.'
        });
        setIsLoading(false);
        return;
      }

      const effectivePassword = password.trim() || (isDemoUser ? 'demo-password' : '');

      const res = await signIn('credentials', {
        redirect: false,
        name: displayName,
        email: emailValue,
        password: effectivePassword,
        callbackUrl
      });

      if (res?.error) {
        setToast({
          type: 'error',
          title: 'Sign In Failed',
          message: res.error === 'CredentialsSignin' ? 'Invalid email or password. Please try again.' : res.error
        });
        setIsLoading(false);
      } else {
        setToast({
          type: 'success',
          title: activeTab === 'signup' ? 'Welcome to the Community!' : 'Welcome Back!',
          message: `Signed in successfully as ${displayName}. Redirecting...`
        });
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Authentication Error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.'
      });
      setIsLoading(false);
    }
  };

  // Quick One-Click Demo Logins
  const handleQuickDemo = async (roleName: string, roleEmail: string) => {
    if (isBanned) {
      setToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Your IP address has been banned. You cannot log in.'
      });
      return;
    }

    if (!agreedToPledge) {
      setToast({
        type: 'warning',
        title: 'Community Pledge Required',
        message: 'Please accept the community pledge before entering.'
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        name: roleName,
        email: roleEmail,
        password: 'demo-password',
        callbackUrl
      });

      if (res?.error) {
        setToast({
          type: 'error',
          title: 'Quick Access Failed',
          message: res.error
        });
        setIsLoading(false);
      } else {
        setToast({
          type: 'success',
          title: 'Welcome to Seven Haven!',
          message: `Signed in as ${roleName}. Redirecting...`
        });
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFAF6] text-zinc-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Navbar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-rose-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Encrypted & Safe</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl rounded-3xl border border-rose-100/80 bg-white shadow-2xl shadow-rose-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE: Visual Showcase (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative space-y-6">
              {/* Brand Pill */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-sm">
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                <span className="font-extrabold text-xs tracking-wide">SEVEN APPRECIATION</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  A Positive Haven for <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">Seven Stars.</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Join thousands of respectful fans celebrating Heeseung, Jay, Jake, Sunghoon, Sunoo, Jungwon, and Ni-ki.
                </p>
              </div>

              {/* Group Graphic Preview Card */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black/40 group">
                <Image
                  src="/images/members/all_members.jpg"
                  alt="The Seven"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100%"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                  <span className="text-[11px] font-bold text-rose-300">Official Community</span>
                  <span className="text-xs font-semibold text-white truncate">Seven Artists • One Unified Community</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-7 w-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Heart className="h-3.5 w-3.5 fill-rose-400" />
                  </div>
                  <span>Heartfelt Appreciation Walls for all members</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-7 w-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span>Collect 3D Holographic Photocards & daily packs</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-7 w-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span>Zero hate, zero toxicity, zero comparisons</span>
                </div>
              </div>
            </div>

            {/* Quote on bottom */}
            <div className="relative pt-6 mt-6 border-t border-white/10 text-xs text-zinc-400 italic">
              &quot;Support without attacking anyone else. Celebrate every journey.&quot;
            </div>
          </div>

          {/* RIGHT SIDE: Professional Interactive Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  {activeTab === 'signin' && 'Welcome Back'}
                  {activeTab === 'signup' && 'Create Your Community Pass'}
                  {activeTab === 'demo' && 'Fast Demo Access'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  {activeTab === 'signin' && 'Enter your account details to access your binder and messages.'}
                  {activeTab === 'signup' && 'Join our respectful community in seconds with zero ads or tracking.'}
                  {activeTab === 'demo' && 'Explore all features instantly with pre-configured guest profiles.'}
                </p>
              </div>

              {/* Navigation Segment Tabs */}
              <div className="flex items-center rounded-2xl bg-zinc-100 p-1 border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'signin'
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'signup'
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('demo')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'demo'
                      ? 'bg-white text-rose-600 shadow-sm border border-zinc-200/60 font-black'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                  <span>Quick Demo</span>
                </button>
              </div>

              {/* TAB 1 & 2: SIGN IN / SIGN UP FORM */}
              {(activeTab === 'signin' || activeTab === 'signup') && (
                <form onSubmit={handleAuthSubmit} className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Name field (Only shown on Sign Up) */}
                  {activeTab === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Display Name / Supporter Handle</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. HeeseungVocalist or kind_engene"
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Email / Username field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. supporter@example.com"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Password</span>
                      </span>
                      {activeTab === 'signin' && (
                        <span className="text-[10px] text-zinc-400">Optional for demo access</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 pr-10 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Community Pledge Checkbox */}
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5 space-y-1.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToPledge}
                        onChange={(e) => setAgreedToPledge(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded-md border-rose-300 text-rose-600 focus:ring-rose-400 accent-rose-500"
                      />
                      <span className="text-[11px] text-zinc-700 leading-snug">
                        <strong>Community Pledge:</strong> I will support without attacking anyone else. Zero fan wars, no negativity, and pure appreciation.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-200/50 hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <span>{activeTab === 'signup' ? 'Create Account & Enter Haven' : 'Sign In to Safe Haven'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 3: QUICK DEMO PROFILES */}
              {activeTab === 'demo' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-zinc-500">
                    Select a ready-to-use profile to test the application instantly without filling out a form:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickDemo('Kind Supporter', 'supporter@seven.app')}
                      className="group flex flex-col items-start p-4 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-300 transition-all text-left shadow-xs hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          💖
                        </div>
                        <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 block">Fan Supporter Pass</span>
                      <span className="text-[10px] text-zinc-500">Post on walls, open card packs, collect</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickDemo('Community Moderator', 'mod@seven.app')}
                      className="group flex flex-col items-start p-4 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all text-left shadow-xs hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          🛡️
                        </div>
                        <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 block">Moderator Pass</span>
                      <span className="text-[10px] text-zinc-500">Review flagged content & moderation hub</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer Info */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-zinc-400" />
                Global Cloud Sync
              </span>
              <Link href="/guidelines" className="text-rose-600 hover:underline font-semibold">
                Read Community Rules
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-zinc-400">
        Seven Appreciation Community • Safe Haven for ENGENE & Seven Artists
      </footer>
    </div>
  );
}
