'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Heart, AlertTriangle, Lock, Users, CheckCircle2, XCircle } from 'lucide-react';

export default function GuidelinesPage() {
  const rules = [
    {
      title: '1. Support Without Attacking Anyone Else',
      icon: Heart,
      color: 'rose',
      description:
        'Supporting one person should NEVER require putting another person down. Appreciation should never become competition, and love for one artist should never become hatred toward another.',
      doText: 'Express genuine admiration, gratitude, and support for your favorite journeys.',
      dontText: 'Never use appreciation for one person as a tool to criticize, diminish, or insult another.'
    },
    {
      title: '2. Appreciate Without Comparing',
      icon: Users,
      color: 'amber',
      description:
        'Every individual possesses unique artistry, personality, and contributions. Posts ranking members ("who is better", "who deserves more", "best member") are strictly prohibited.',
      doText: 'Celebrate each member individually for their distinct qualities and hard work.',
      dontText: 'Do not create polls, rankings, leaderboards, or versus comparisons.'
    },
    {
      title: '3. Zero Tolerance for Fan Wars & Mobbing',
      icon: ShieldCheck,
      color: 'purple',
      description:
        'We are one united community of positive supporters. Any attempt to incite conflicts between different fan groups or mobilize users to attack others will result in immediate removal.',
      doText: 'Welcome supporters of all backgrounds with kindness and open arms.',
      dontText: 'Do not post call-outs, boycott demands, or divisive "solo stan war" content.'
    },
    {
      title: '4. Protect Personal Privacy (Strict Safety)',
      icon: Lock,
      color: 'sky',
      description:
        'Never share private or sensitive personal information. Examples include phone numbers, private home/hotel addresses, personal email addresses, family details, or private schedules.',
      doText: 'Share public artwork, legal embeds, and personal inspirational experiences.',
      dontText: 'Do not post private contact details or unverified schedule information.'
    },
    {
      title: '5. No Unverified Rumors or Harassment',
      icon: AlertTriangle,
      color: 'pink',
      description:
        'Do not spread unverified rumors, gossip, or speculative claims as facts. Bullying, intimidation, or persistent harassment of any member or user will be permanently banned.',
      doText: 'Rely on official channels and verified news for information.',
      dontText: 'Do not start or amplify negative gossip threads.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col  font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl w-full space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-bold text-rose-600">
            <ShieldCheck className="h-4 w-4" />
            <span>Community Safety Standards</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            Community Guidelines
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed">
            Our platform is built to ensure a peaceful, inspiring, and safe digital space. Please read and uphold these standards.
          </p>

          {/* Core Rule Banner */}
          <div className="rounded-3xl border-2 border-rose-300 bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white shadow-xl text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-200">Our Foundational Rule</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">&quot;SUPPORT WITHOUT ATTACKING ANYONE ELSE.&quot;</h2>
          </div>
        </div>

        {/* Detailed Guidelines Breakdown */}
        <div className="space-y-8">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 font-bold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-zinc-900">{rule.title}</h3>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{rule.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200 text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Encouraged Behavior:
                    </span>
                    <p className="opacity-90">{rule.doText}</p>
                  </div>

                  <div className="rounded-2xl bg-rose-50/80 p-4 border border-rose-200 text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-700">
                      <XCircle className="h-4 w-4" />
                      Strictly Prohibited:
                    </span>
                    <p className="opacity-90">{rule.dontText}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
