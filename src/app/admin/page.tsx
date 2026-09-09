'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { Report, Post, AppreciationMessage } from '@/types';
import { ShieldCheck, ShieldAlert, CheckCircle, Ban, EyeOff, Trash2, AlertTriangle, LogIn, Loader2, BarChart3, CalendarDays, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

interface AdminPrompt {
  id: string;
  date: string;
  question: string;
  category: string;
  memberId: string | null;
  isActive: boolean;
  checkInsCount: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [appreciations, setAppreciations] = useState<AppreciationMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ action: string; time: string }[]>([]);
  const [analytics, setAnalytics] = useState<{
    today: number;
    week: number;
    month: number;
    totalUnique: number;
    series: { day: string; visits: number }[];
  } | null>(null);

  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  // Daily Prompts state
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [newPromptDate, setNewPromptDate] = useState('');
  const [newPromptQuestion, setNewPromptQuestion] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('APPRECIATION');
  const [newPromptMember, setNewPromptMember] = useState('');
  const [promptSaving, setPromptSaving] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.push('/');
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    async function loadData() {
      try {
        const [repRes, postRes, appRes, analyticsRes, promptsRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/posts'),
          fetch('/api/appreciations'),
          fetch('/api/analytics/stats'),
          fetch('/api/admin/prompts'),
        ]);
        if (repRes.ok) {
          const repJson = await repRes.json();
          setReports(Array.isArray(repJson) ? repJson : repJson.data || []);
        }
        if (postRes.ok) {
          const postJson = await postRes.json();
          setPosts(Array.isArray(postJson) ? postJson : postJson.data || []);
        }
        if (appRes.ok) {
          const appJson = await appRes.json();
          setAppreciations(Array.isArray(appJson) ? appJson : appJson.data || []);
        }
        if (analyticsRes.ok) {
          const analyticsJson = await analyticsRes.json();
          setAnalytics(analyticsJson);
        }
        if (promptsRes.ok) {
          const promptsJson = await promptsRes.json();
          setPrompts(promptsJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    }
    loadData();
  }, [isAdmin]);

  const handleExecuteAction = async (reportId: string, action: 'dismiss' | 'hide' | 'remove' | 'warn_user' | 'ban_user') => {
    // ban_user bans the AUTHOR of the reported content (server-side account
    // ban via /api/reports/[id]/action) — never the reporter's IP.
    if (action === 'ban_user') {
      const confirmed = confirm('Ban the author of this reported content? They will not be able to log in anymore.');
      if (!confirmed) {
        setToast({
          type: 'warning',
          title: 'Ban Cancelled',
          message: 'Admin cancelled the ban action.'
        });
        return;
      }
    }

    // Persist moderation action to database via API
    try {
      const res = await fetch(`/api/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Failed to persist action');

      const data = await res.json();

      // Update local state from server response
      const updatedReports = reports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: data.reportStatus as 'actioned' | 'dismissed',
            actionTaken: action,
          };
        }
        return r;
      });
      setReports(updatedReports);

      // Log action in audit log
      const logEntry = {
        action: `Executed action "${action.toUpperCase()}" on report #${reportId}`,
        time: new Date().toLocaleTimeString()
      };
      setAuditLogs([logEntry, ...auditLogs]);

      if (action === 'ban_user') {
        setToast({
          type: 'success',
          title: 'Account Banned',
          message: 'The author of the reported content has been banned from logging in.'
        });
      } else {
        setToast({
          type: 'success',
          title: 'Action Persisted',
          message: `Moderation action "${action}" saved to database.`
        });
      }
    } catch {
      setToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not save moderation action. Please try again.'
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
          <span className="text-sm font-semibold text-zinc-600 animate-pulse">Loading Mod Hub...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md rounded-3xl border border-rose-100 bg-white p-8 shadow-lg shadow-rose-100/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 shadow-xs">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-zinc-900">Admin Authentication Required</h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                You must be signed in with an authorized Administrator account to access the Mod Hub.
              </p>
            </div>
            <Link
              href="/login?callbackUrl=/admin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:scale-102 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In as Admin</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col  font-sans">
      <Navbar />

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-100 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              <ShieldCheck className="h-4 w-4" />
              <span>Safety & Behavioral Intent Moderation Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Admin Moderation Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600 bg-white border border-purple-100 p-3 rounded-2xl">
            <span>Community Health: <strong className="text-emerald-600">99.8% Safe</strong></span>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase">Pending Reports Queue</span>
            <div className="text-3xl font-extrabold text-purple-700">
              {reports.filter((r) => r.status === 'pending').length}
            </div>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xs space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase">Appreciation Messages</span>
            <div className="text-3xl font-extrabold text-rose-600">{appreciations.length}</div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-xs space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase">Active Community Posts</span>
            <div className="text-3xl font-extrabold text-amber-600">{posts.length}</div>
          </div>
        </div>

        {/* WEBSITE VISITOR STATISTICS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            <span>Website Visitors</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xs space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">Today</span>
              <div className="text-3xl font-extrabold text-sky-600">{analytics?.today ?? '-'}</div>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xs space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">Last 7 Days</span>
              <div className="text-3xl font-extrabold text-emerald-600">{analytics?.week ?? '-'}</div>
            </div>
            <div className="rounded-3xl border border-teal-100 bg-white p-6 shadow-xs space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">Last 30 Days</span>
              <div className="text-3xl font-extrabold text-teal-600">{analytics?.month ?? '-'}</div>
            </div>
            <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xs space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase">All-Time Visitors</span>
              <div className="text-3xl font-extrabold text-violet-600">{analytics?.totalUnique ?? '-'}</div>
            </div>
          </div>

          {analytics?.series && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold text-zinc-400 uppercase">Daily Visitors — Last 7 Days</span>
              <div className="mt-4 flex items-end gap-2 sm:gap-3">
                {analytics.series.map((item) => {
                  const max = Math.max(...analytics.series.map((s) => s.visits), 1);
                  const height = Math.max((item.visits / max) * 100, 4);
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-zinc-600">{item.visits}</span>
                      <div
                        className="w-full rounded-xl bg-gradient-to-t from-sky-500 to-emerald-400"
                        style={{ height: `${height}px` }}
                        title={item.day}
                      />
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {item.day.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* REPORTS QUEUE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-600" />
            <span>Moderation Queue — User Reports ({reports.length})</span>
          </h2>

          {reports.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-500">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p>The moderation queue is currently clean! All user reports handled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                        {report.reason}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">Target: {report.contentType}</span>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        report.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100 text-xs space-y-2">
                    <div className="space-y-1">
                      <span className="font-semibold text-zinc-500 block">Flagged Content Snippet:</span>
                      <p className="italic font-mono text-zinc-800">&quot;{report.contentSnippet}&quot;</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-200">
                      <span className="font-semibold text-zinc-500">Reporter IP:</span>
                      {report.reporterIp && report.reporterIp !== 'unknown' ? (
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          {report.reporterIp}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">Not captured</span>
                      )}
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 text-xs font-bold">
                      <button
                        onClick={() => handleExecuteAction(report.id, 'dismiss')}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-zinc-700 hover:bg-zinc-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Dismiss</span>
                      </button>

                      <button
                        onClick={() => handleExecuteAction(report.id, 'hide')}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-amber-800 hover:bg-amber-100"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Hide Content</span>
                      </button>

                      <button
                        onClick={() => handleExecuteAction(report.id, 'remove')}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Content</span>
                      </button>

                      <button
                        onClick={() => handleExecuteAction(report.id, 'warn_user')}
                        className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-purple-800 hover:bg-purple-100"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Warn User</span>
                      </button>

                      <button
                        onClick={() => handleExecuteAction(report.id, 'ban_user')}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-1.5 text-white hover:bg-rose-700"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Ban User</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DAILY PROMPTS MANAGEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-600" />
              <span>Daily Prompts ({prompts.length})</span>
            </h2>
            <button
              onClick={() => setShowCreatePrompt(!showCreatePrompt)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Prompt</span>
            </button>
          </div>

          {/* Create Prompt Form */}
          {showCreatePrompt && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Create Daily Prompt</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={newPromptDate}
                    onChange={(e) => setNewPromptDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1">Category</label>
                  <select
                    value={newPromptCategory}
                    onChange={(e) => setNewPromptCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="APPRECIATION">Appreciation</option>
                    <option value="MUSIC & MEMORY">Music & Memory</option>
                    <option value="MEMBER LOVE">Member Love</option>
                    <option value="GRATITUDE">Gratitude</option>
                    <option value="PRIDE & JOY">Pride & Joy</option>
                    <option value="INSPIRATION">Inspiration</option>
                    <option value="COMFORT">Comfort</option>
                    <option value="ENGENE BOND">ENGENE Bond</option>
                    <option value="COMMUNITY REFLECTION">Community Reflection</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Member (optional)</label>
                <select
                  value={newPromptMember}
                  onChange={(e) => setNewPromptMember(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="">All Seven (OT7)</option>
                  <option value="heeseung">Heeseung</option>
                  <option value="jay">Jay</option>
                  <option value="jake">Jake</option>
                  <option value="sunghoon">Sunghoon</option>
                  <option value="sunoo">Sunoo</option>
                  <option value="jungwon">Jungwon</option>
                  <option value="ni-ki">Ni-ki</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Question</label>
                <textarea
                  value={newPromptQuestion}
                  onChange={(e) => setNewPromptQuestion(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-amber-400 focus:outline-none resize-none"
                  placeholder="Write a warm, thoughtful prompt for ENGENEs..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  disabled={promptSaving || !newPromptDate || !newPromptQuestion.trim()}
                  onClick={async () => {
                    setPromptSaving(true);
                    try {
                      const res = await fetch('/api/admin/prompts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          date: newPromptDate,
                          question: newPromptQuestion.trim(),
                          category: newPromptCategory,
                          memberId: newPromptMember || null,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setToast({ type: 'error', title: 'Error', message: data.error || 'Failed to create prompt' });
                        return;
                      }
                      setPrompts([{ ...data, checkInsCount: 0 }, ...prompts]);
                      setNewPromptDate('');
                      setNewPromptQuestion('');
                      setNewPromptCategory('APPRECIATION');
                      setNewPromptMember('');
                      setShowCreatePrompt(false);
                      setToast({ type: 'success', title: 'Prompt Created', message: `Daily prompt for ${data.date} saved.` });
                    } catch {
                      setToast({ type: 'error', title: 'Error', message: 'Could not create prompt. Try again.' });
                    } finally {
                      setPromptSaving(false);
                    }
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {promptSaving ? 'Saving...' : 'Create Prompt'}
                </button>
                <button
                  onClick={() => setShowCreatePrompt(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Prompts List */}
          {prompts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-500">
              <CalendarDays className="mx-auto h-8 w-8 text-amber-400 mb-2" />
              <p>No daily prompts yet. Create your first prompt above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.slice(0, 20).map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 shadow-2xs space-y-2 ${
                    p.isActive
                      ? 'border-amber-200 bg-white'
                      : 'border-zinc-200 bg-zinc-50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                        {p.date}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                        {p.category}
                      </span>
                      {p.memberId && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          {p.memberId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400">
                        {p.checkInsCount} check-in{p.checkInsCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        title={p.isActive ? 'Deactivate' : 'Activate'}
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/prompts/${p.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isActive: !p.isActive }),
                            });
                            if (res.ok) {
                              setPrompts(prompts.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)));
                            }
                          } catch { /* ignore */ }
                        }}
                        className="text-zinc-400 hover:text-amber-600 transition-colors"
                      >
                        {p.isActive ? <ToggleRight className="h-5 w-5 text-amber-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        title="Delete prompt"
                        onClick={async () => {
                          if (!confirm('Delete this prompt? This cannot be undone.')) return;
                          try {
                            const res = await fetch(`/api/admin/prompts/${p.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              setPrompts(prompts.filter((x) => x.id !== p.id));
                              setToast({ type: 'success', title: 'Deleted', message: 'Prompt removed.' });
                            }
                          } catch { /* ignore */ }
                        }}
                        className="text-zinc-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 italic leading-relaxed">&ldquo;{p.question}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AUDIT LOG */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-zinc-900">Admin Audit History</h3>
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 text-xs font-mono space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-zinc-400">No actions recorded in this session yet.</p>
            ) : (
              auditLogs.map((log, i) => (
                <div key={i} className="flex justify-between text-zinc-600 border-b border-zinc-100 pb-1">
                  <span>{log.action}</span>
                  <span className="text-zinc-400">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
