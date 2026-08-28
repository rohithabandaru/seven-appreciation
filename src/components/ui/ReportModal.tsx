'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ReportCategory } from '@/types';
import { saveReport } from '@/lib/storage';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  contentType: 'appreciation' | 'post' | 'comment' | 'story';
  contentId: string;
  contentSnippet: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const REPORT_CATEGORIES: ReportCategory[] = [
  'Fan war / comparison',
  'Hate',
  'Harassment',
  'Personal information',
  'Rumor / misinformation',
  'Targeted attack',
  'Spam',
  'Inappropriate content',
  'Copyright concern',
  'Other'
];

export default function ReportModal({
  contentType,
  contentId,
  contentSnippet,
  onClose,
  onSubmitted
}: ReportModalProps) {
  const { data: session } = useSession();
  const [selectedReason, setSelectedReason] = useState<ReportCategory>('Fan war / comparison');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reportData = {
      id: `rep-${Date.now()}`,
      contentType,
      contentId,
      contentSnippet: contentSnippet.slice(0, 150),
      reporterId: session?.user?.id || null,
      reason: selectedReason,
      details: details.trim(),
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    try {
      // Submit via API to capture reporter's IP address server-side
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (res.ok) {
        const reportWithIp = await res.json();
        saveReport(reportWithIp); // Save with IP attached
      } else {
        saveReport(reportData); // Fallback: save without IP
      }
    } catch {
      saveReport(reportData); // Fallback: save without IP
    }

    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitted) onSubmitted();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <ShieldAlert className="h-5 w-5" />
            <span>Report Content to Moderation</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100 text-zinc-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 animate-bounce" />
            <h4 className="text-lg font-bold text-zinc-900">Thank You for Protecting Our Community</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your report has been dispatched to our moderation queue. We review all reports strictly against our &quot;Support without attacking anyone else&quot; community guidelines.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-amber-900">
              <span className="font-semibold block mb-0.5">Content Preview:</span>
              <p className="italic text-zinc-700 font-mono text-[11px] truncate">&quot;{contentSnippet}&quot;</p>
            </div>

            <div>
              <label className="block font-bold text-zinc-800 mb-2">Select Primary Reason:</label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedReason(category)}
                    className={`rounded-xl border p-2.5 text-left font-medium transition-all ${
                      selectedReason === category
                        ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-800 mb-1">Additional Details (Optional):</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain how this content violates community principles..."
                rows={3}
                className="w-full rounded-xl border border-zinc-200 p-3 text-xs focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-200 px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-md hover:bg-rose-700 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
