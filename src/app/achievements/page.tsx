'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import {
  Trophy,
  ExternalLink,
  Sparkles,
  Plus,
  X,
  Heart,
  Calendar,
  Users,
  User,
  Link as LinkIcon,
  Loader2,
  Star,
  Music,
  Flame,
  Globe,
  Palette,
  Award,
  Send
} from 'lucide-react';

type MilestoneCategory = 'Music' | 'Performance' | 'Milestone' | 'Global Impact' | 'Artistry';

interface CommunityMilestone {
  id: string;
  memberId: string | null;
  memberName: string | null;
  userName: string;
  userAvatar: string | null;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  sourceUrl: string | null;
  likesCount: number;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<MilestoneCategory, { icon: typeof Trophy; color: string; bg: string; border: string }> = {
  Music: { icon: Music, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  Performance: { icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  Milestone: { icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  'Global Impact': { icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Artistry: { icon: Palette, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
};

export default function AchievementsPage() {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Cloud milestones state
  const [communityMilestones, setCommunityMilestones] = useState<CommunityMilestone[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  // Fetch milestones from cloud
  const fetchMilestones = useCallback(async () => {
    try {
      setIsLoadingCloud(true);
      const res = await fetch('/api/milestones');
      if (res.ok) {
        const data = await res.json();
        setCommunityMilestones(data);
      }
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    } finally {
      setIsLoadingCloud(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMilestones();
  }, [fetchMilestones]);

  // Combine static + cloud milestones
  const staticAchievements = MEMBERS_DATA.flatMap((m) => m.achievements);

  const filteredStaticAchievements = selectedMember === 'all'
    ? staticAchievements
    : staticAchievements.filter((ach) => ach.memberId === selectedMember);

  const filteredCommunityMilestones = selectedMember === 'all'
    ? communityMilestones
    : selectedMember === 'seven'
      ? communityMilestones.filter((m) => !m.memberId)
      : communityMilestones.filter((m) => m.memberId === selectedMember);

  // Handle like
  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;

    setLikedIds((prev) => new Set(prev).add(id));
    setCommunityMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likesCount: m.likesCount + 1 } : m))
    );

    try {
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'like' })
      });
      if (!res.ok) throw new Error('Failed to like');
    } catch (err) {
      console.error('Failed to like milestone:', err);
      // Revert optimistic update
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCommunityMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likesCount: m.likesCount - 1 } : m))
      );
      setToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not connect to the cloud. Please try again later.'
      });
    }
  };

  const getCategoryConfig = (cat: string) => {
    return CATEGORY_CONFIG[cat as MilestoneCategory] || CATEGORY_CONFIG.Milestone;
  };

  const getMemberImage = (memberId: string | null) => {
    if (!memberId) return '/images/members/all_members.jpg';
    const member = MEMBERS_DATA.find((m) => m.slug === memberId);
    return member?.image || '/images/members/all_members.jpg';
  };

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

      {/* ADD MILESTONE MODAL */}
      {showAddModal && (
        <AddMilestoneModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMilestones();
            setToast({
              type: 'success',
              title: 'Milestone Added!',
              message: 'Your milestone has been shared with the community.'
            });
          }}
          onError={(msg: string) => {
            setToast({ type: 'error', title: 'Error', message: msg });
          }}
        />
      )}

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-bold text-amber-700">
            <Trophy className="h-3.5 w-3.5" />
            <span>Community-Powered Milestones & Achievements</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
            Celebrating Every <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-purple-500 bg-clip-text text-transparent">Milestone</span>
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed">
            Everyone can add milestones for a specific member or for all seven together. Every journey is celebrated equally — no rankings, no competition.
          </p>

          {/* Add Milestone CTA */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200/50 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" />
            <span>Add a Milestone</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedMember('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedMember === 'all'
                ? 'bg-amber-500 text-white shadow-xs scale-105'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-amber-50 hover:border-amber-200'
            }`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setSelectedMember('seven')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedMember === 'seven'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs scale-105'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-rose-50 hover:border-rose-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>All Seven</span>
          </button>
          {MEMBERS_DATA.map((m) => (
            <button
              key={m.slug}
              onClick={() => setSelectedMember(m.slug)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedMember === m.slug
                  ? 'bg-amber-500 text-white shadow-xs scale-105'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              <div className="relative h-4 w-4 overflow-hidden rounded-full"><Image src={m.image} alt={m.displayName} fill className="object-cover" sizes="16px" /></div>
              <span>{m.displayName}</span>
            </button>
          ))}
        </div>

        {/* Community Milestones Section */}
        {communityMilestones.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Community Milestones</span>
                <span className="ml-2 text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {filteredCommunityMilestones.length}
                </span>
              </h2>
            </div>

            {isLoadingCloud ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              </div>
            ) : filteredCommunityMilestones.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50">
                <Trophy className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-500">No milestones for this filter yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Be the first to add one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCommunityMilestones.map((milestone) => {
                  const config = getCategoryConfig(milestone.category);
                  const Icon = config.icon;

                  return (
                    <div
                      key={milestone.id}
                      className={`rounded-3xl border ${config.border} bg-gradient-to-br from-white via-white to-${config.bg} p-6 shadow-sm hover:shadow-md transition-all space-y-4 group`}
                    >
                      {/* Top row: member avatar + category + date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs"><Image src={getMemberImage(milestone.memberId)} alt={milestone.memberName || 'All Seven'} fill className="object-cover" sizes="32px" /></div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 block">
                              {milestone.memberName || 'All Seven'}
                            </span>
                            <span className={`text-[10px] font-bold ${config.color}`}>
                              {milestone.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>{milestone.eventDate}</span>
                        </div>
                      </div>

                      {/* Title & description */}
                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-zinc-900 leading-snug flex items-start gap-2">
                          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                          <span>{milestone.title}</span>
                        </h3>
                        <p className="text-xs text-zinc-600 leading-relaxed pl-6">{milestone.description}</p>
                      </div>

                      {/* Footer: contributed by + source + like */}
                      <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <User className="h-3 w-3" />
                          <span>by <strong className="text-zinc-600">{milestone.userName}</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                          {milestone.sourceUrl && (
                            <a
                              href={milestone.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Source</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleLike(milestone.id)}
                            disabled={likedIds.has(milestone.id)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                              likedIds.has(milestone.id)
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            <Heart className={`h-3 w-3 ${likedIds.has(milestone.id) ? 'fill-rose-500' : ''}`} />
                            <span>{milestone.likesCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Static / Official Achievements Section */}
        <section className="space-y-5">
          <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Official Verified Achievements</span>
            <span className="ml-2 text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              {filteredStaticAchievements.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredStaticAchievements.map((ach) => {
              const config = getCategoryConfig(ach.category);
              const Icon = config.icon;

              return (
                <div
                  key={ach.id}
                  className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/40 via-white to-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs"><Image src={getMemberImage(ach.memberId)} alt={ach.memberName} fill className="object-cover" sizes="32px" /></div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">{ach.memberName}</span>
                        <span className={`text-[10px] font-bold ${config.color}`}>{ach.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✓ Verified</span>
                      <span className="text-xs font-mono text-zinc-400">{ach.eventDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-zinc-900 leading-snug flex items-start gap-2">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                      <span>{ach.title}</span>
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed pl-6">{ach.description}</p>
                  </div>

                  {ach.verifiedSourceUrl && (
                    <div className="border-t border-amber-100 pt-3">
                      <a
                        href={ach.verifiedSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Verified Source</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ADD MILESTONE MODAL COMPONENT
   ───────────────────────────────────────────────────────── */

function AddMilestoneModal({
  onClose,
  onSuccess,
  onError
}: {
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestoneFor, setMilestoneFor] = useState<'seven' | 'member'>('seven');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('heeseung');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('Milestone');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !eventDate.trim()) {
      onError('Please fill in the title, description, and date.');
      return;
    }

    const memberId = milestoneFor === 'seven' ? null : selectedMemberId;
    const member = MEMBERS_DATA.find((m) => m.slug === selectedMemberId);
    const memberName = milestoneFor === 'seven' ? 'All Seven' : member?.displayName || selectedMemberId;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          memberName,
          userName: 'Kind Supporter',
          title: title.trim(),
          description: description.trim(),
          eventDate: eventDate.trim(),
          category,
          sourceUrl: sourceUrl.trim() || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save milestone.');
      }

      onSuccess();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Failed to save milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900">Add a Milestone</h3>
              <p className="text-[10px] text-zinc-500">For one member or for all seven</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* WHO IS THIS FOR? */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">This milestone is for:</label>
            <div className="flex rounded-2xl bg-zinc-100 p-1 border border-zinc-200">
              <button
                type="button"
                onClick={() => setMilestoneFor('seven')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  milestoneFor === 'seven'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-rose-500" />
                <span>All Seven (Group)</span>
              </button>
              <button
                type="button"
                onClick={() => setMilestoneFor('member')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  milestoneFor === 'member'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <User className="h-3.5 w-3.5 text-amber-500" />
                <span>One Member</span>
              </button>
            </div>
          </div>

          {/* MEMBER PICKER (only visible when "One Member") */}
          {milestoneFor === 'member' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">Select Member:</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {MEMBERS_DATA.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => setSelectedMemberId(m.slug)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${
                      selectedMemberId === m.slug
                        ? 'border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-500/20 scale-105'
                        : 'border-zinc-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white shadow-xs"><Image src={m.image} alt={m.displayName} fill className="object-cover" sizes="40px" /></div>
                    <span className="text-[9px] font-bold text-zinc-700 truncate w-full text-center">
                      {m.displayName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TITLE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">Milestone Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. First Daesang Award, 1 Billion Streams..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the milestone and why it matters to you or the community..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs resize-none"
            />
          </div>

          {/* DATE + CATEGORY ROW */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Event Date *</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-zinc-400" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MilestoneCategory)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs appearance-none"
              >
                <option value="Milestone">🏆 Milestone</option>
                <option value="Music">🎵 Music</option>
                <option value="Performance">🔥 Performance</option>
                <option value="Global Impact">🌍 Global Impact</option>
                <option value="Artistry">🎨 Artistry</option>
              </select>
            </div>
          </div>

          {/* SOURCE URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span>Source Link (optional)</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://twitter.com/... or news article link"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-amber-200/50 hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Add Milestone to Community</span>
              </>
            )}
          </button>

          {/* Pledge reminder */}
          <p className="text-[10px] text-center text-zinc-400 leading-relaxed">
            All milestones are shared with love. No competitive comparisons. Every journey is equally valuable.
          </p>
        </form>
      </div>
    </div>
  );
}
