import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, Mail, AlertTriangle, FileText } from 'lucide-react';

export default function CopyrightPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFDF9] dark:bg-[#121014]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Copyright & Takedown Policy
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            We respect intellectual property rights. If you believe your copyrighted work has been used on this site without authorization, please follow the process below.
          </p>
        </div>

        <div className="space-y-6">
          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-900/40 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>Important Notice</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              This is an <strong>unofficial, non-commercial fan appreciation project</strong>. We do not claim ownership of any images, videos, or media belonging to the artists, their management, or their labels. All media is used in good faith for fan appreciation purposes only.
            </p>
          </div>

          {/* Our Policy */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              Our Commitment
            </h2>
            <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">1.</span>
                <span>We will promptly remove any content that infringes on copyright upon receiving a valid takedown request.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">2.</span>
                <span>User-uploaded content is the responsibility of the individual uploader. We moderate submissions but cannot verify copyright ownership of every image.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">3.</span>
                <span>We do not monetize copyrighted content. This site generates no advertising revenue from copyrighted material.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold mt-0.5">4.</span>
                <span>Fan artworks and original creative works posted by community members remain the property of their respective creators.</span>
              </li>
            </ul>
          </div>

          {/* How to Submit a Takedown */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-rose-500" />
              How to Submit a Takedown Request
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If you are a copyright holder (or authorized to act on behalf of one) and believe that content on this site infringes your rights, please provide the following information:
            </p>
            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>A description of the copyrighted work you believe has been infringed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>The URL(s) on this site where the infringing material appears.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Your contact information (name, email, and relationship to the copyright holder).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>A statement that you have a good faith belief that the use is not authorized by the copyright owner.</span>
              </li>
            </ul>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-4 text-xs text-rose-700 dark:text-rose-300">
              <p className="font-bold mb-1">Contact for Takedown Requests:</p>
              <p>Please use the Report feature on any post, or contact the site administrator directly. We aim to respond to all valid requests within <strong>48 hours</strong>.</p>
            </div>
          </div>

          {/* Response Timeline */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Response Timeline</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center space-y-1">
                <p className="text-lg font-black text-rose-500">24h</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Acknowledgment of request</p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center space-y-1">
                <p className="text-lg font-black text-amber-500">48h</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Review & content removal</p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 text-center space-y-1">
                <p className="text-lg font-black text-emerald-500">72h</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Confirmation sent to requester</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
