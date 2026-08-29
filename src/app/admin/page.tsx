'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { Report, Post, AppreciationMessage } from '@/types';
import { ShieldCheck, ShieldAlert, CheckCircle, Ban, EyeOff, Trash2, AlertTriangle, LogIn, Loader2 } from 'lucide-react';
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [appreciations, setAppreciations] = useState<AppreciationMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ action: string; time: string }[]>([]);

  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

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
        const [repRes, postRes, appRes, pendingRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/posts'),
          fetch('/api/appreciations'),
          fetch('/api/admin/posts?status=pending')
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
        if (pendingRes.ok) {
          const pendingJson = await pendingRes.json();
          setPendingPosts(Array.isArray(pendingJson) ? pendingJson : pendingJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    }
    loadData();
  }, [isAdmin]);

  const handleExecuteAction = async (reportId: string, action: 'dismiss' | 'hide' | 'remove' | 'warn_user' | 'ban_user') => {
    // If banning, use the captured IP from the report (or prompt as fallback)
    if (action === 'ban_user') {
      const report = reports.find(r => r.id === reportId);
      let ip = report?.reporterIp;

      // If IP was captured, confirm with admin. If not, prompt manually.
      if (ip && ip !== 'unknown') {
        const confirmed = confirm(`Ban this IP address?\n\nIP: ${ip}\n\nThis user will not be able to log in anymore.`);
        if (!confirmed) {
          setToast({
            type: 'warning',
            title: 'Ban Cancelled',
            message: 'Admin cancelled the ban action.'
          });
          return;
        }
      } else {
        ip = prompt('IP address could not be auto-detected. Enter the IP address to ban:') || '';
        if (!ip.trim()) {
          setToast({
            type: 'warning',
            title: 'Ban Cancelled',
            message: 'No IP address provided. Ban was not applied.'
          });
          return;
        }
      }

      try {
        const res = await fetch('/api/ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip: ip.trim(),
            reason: `Banned via report #${reportId}`,
          })
        });

        if (!res.ok) throw new Error('Failed to ban IP');

        setToast({
          type: 'success',
          title: 'IP Banned',
          message: `IP address ${ip.trim()} has been banned. They cannot log in anymore.`
        });
      } catch {
        setToast({
          type: 'error',
          title: 'Ban Failed',
          message: 'Could not ban the IP. Please try again.'
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

      if (action !== 'ban_user') {
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

  const handleModeratePost = async (postId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, action }),
      });

      if (!res.ok) throw new Error('Failed to moderate post');

      setPendingPosts((prev) => prev.filter((p) => p.id !== postId));
      setToast({
        type: 'success',
        title: action === 'approve' ? 'Post Approved' : 'Post Rejected',
        message: `The post was ${action === 'approve' ? 'approved and published' : 'rejected and hidden'}.`
      });

      const logEntry = {
        action: `${action.toUpperCase()} post ${postId}`,
        time: new Date().toLocaleTimeString()
      };
      setAuditLogs([logEntry, ...auditLogs]);
    } catch {
      setToast({
        type: 'error',
        title: 'Moderation Failed',
        message: 'Could not moderate the post. Please try again.'
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

        {/* PENDING POSTS MODERATION QUEUE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-rose-600" />
            <span>Post Moderation Queue — Pending ({pendingPosts.length})</span>
          </h2>

          {pendingPosts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-500">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p>No posts awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          {post.category || post.type}
                        </span>
                        {post.memberId && (
                          <span className="text-xs font-mono text-zinc-400">{post.memberId}</span>
                        )}
                      </div>
                      <p className="mt-2 font-semibold text-zinc-900 truncate">{post.title || 'Untitled'}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      pending
                    </span>
                  </div>

                  {post.content && (
                    <p className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100 text-xs text-zinc-700 line-clamp-3">
                      {post.content}
                    </p>
                  )}

                  {post.imageUrl && (
                    <p className="text-xs font-mono text-zinc-400 break-all">{post.imageUrl}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 text-xs font-bold">
                    <button
                      onClick={() => handleModeratePost(post.id, 'approve')}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleModeratePost(post.id, 'reject')}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-rose-700 hover:bg-rose-100"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
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
