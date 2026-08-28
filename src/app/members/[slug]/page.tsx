'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { AppreciationMessage, MemberPhoto, Post, Letter, MemberSlug } from '@/types';
import Toast from '@/components/ui/Toast';
import ReportModal from '@/components/ui/ReportModal';
import { checkContentModeration } from '@/lib/moderation';
import { uploadFile, validateFileClient } from '@/lib/upload/client';
import { getStoredAppreciations, saveAppreciations, getStoredPosts } from '@/lib/storage';
import { 
  Heart, 
  Sparkles, 
  Calendar,
  Award, 
  BookOpen, 
  ExternalLink, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Mail,
  FileText,
  Upload,
  Link as LinkIcon
} from 'lucide-react';

interface MemberPageProps {
  params: Promise<{ slug: string }>;
}

const PHOTO_CATEGORIES = ['All', 'Stage', 'Concept', 'Studio', 'Casual', 'Behind The Scenes', 'Fan Art'] as const;

export default function MemberDetailPage({ params }: MemberPageProps) {
  const resolvedParams = use(params);
  const member = MEMBERS_DATA.find((m) => m.slug === resolvedParams.slug);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';

  if (!member) {
    notFound();
  }

  const [appreciations, setAppreciations] = useState<AppreciationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<'wall' | 'photos' | 'journey' | 'achievements' | 'inspiration' | 'letters' | 'posts'>('wall');

  // Letters and Posts State
  const [letters, setLetters] = useState<Letter[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Sorting State
  const [appreciationSort, setAppreciationSort] = useState<'newest' | 'most_liked'>('newest');
  const [photoSort, setPhotoSort] = useState<'newest' | 'most_liked'>('newest');
  const [letterSort, setLetterSort] = useState<'newest' | 'oldest'>('newest');
  const [postSort, setPostSort] = useState<'newest' | 'oldest'>('newest');

  // Photo Gallery State
  const [photos, setPhotos] = useState<MemberPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showAddLetterModal, setShowAddLetterModal] = useState(false);

  // New Photo Form State
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<MemberPhoto['category']>('Stage');
  const [newPhotoCredit, setNewPhotoCredit] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // New Letter Form State
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterBody, setNewLetterBody] = useState('');
  const [newLetterImageUrl, setNewLetterImageUrl] = useState('');
  const [letterUploadMode, setLetterUploadMode] = useState<'file' | 'url'>('file');
  const [letterUploadedFileName, setLetterUploadedFileName] = useState('');

  // Notification and Report State
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; snippet: string } | null>(null);

  useEffect(() => {
    // 1. Load appreciations from real cloud database (with local fallback)
    fetch(`/api/appreciations?memberId=${member.slug}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAppreciations(data.map(m => ({
            ...m,
            likedBy: []
          })));
        } else {
          const allMessages = getStoredAppreciations();
          setAppreciations(allMessages.filter((m) => m.memberId === member.slug));
        }
      })
      .catch(() => {
        const allMessages = getStoredAppreciations();
        setAppreciations(allMessages.filter((m) => m.memberId === member.slug));
      });

    // 2. Load member photos from real cloud database (merged with default photos)
    fetch(`/api/photos?memberSlug=${member.slug}`)
      .then(res => res.json())
      .then(json => {
        const data = Array.isArray(json) ? json : json?.data;
        if (Array.isArray(data)) {
          setPhotos([...data, ...(member.photos || [])]);
        } else {
          setPhotos(member.photos || []);
        }
      })
      .catch(() => {
        setPhotos(member.photos || []);
      });

    // 3. Load letters from cloud
    fetch(`/api/letters?memberId=${member.slug}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLetters(data);
        }
      })
      .catch(console.error);

    // 4. Load posts from cloud
    fetch(`/api/posts?memberId=${member.slug}`)
      .then(res => res.json())
      .then(json => {
        const data = Array.isArray(json) ? json : json?.data;
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        } else {
          const allPosts = getStoredPosts();
          setPosts(allPosts.filter((p) => p.memberId === member.slug));
        }
      })
      .catch(() => {
        const allPosts = getStoredPosts();
        setPosts(allPosts.filter((p) => p.memberId === member.slug));
      });
  }, [member.slug, member.photos]);

  const [isUploading, setIsUploading] = useState(false);

  const handleLetterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clientCheck = validateFileClient(file, 3 * 1024 * 1024);
    if (!clientCheck.valid) {
      setToast({
        type: 'warning',
        title: 'Invalid File',
        message: clientCheck.error || 'Please select a valid image.'
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'letter-image');
      setLetterUploadedFileName(file.name);
      setNewLetterImageUrl(result.url);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Could not upload image.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePostLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetterTitle.trim() && !newLetterImageUrl) return;

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.slug,
          memberName: member.displayName,
          userName: userName || 'Anonymous Fan',
          title: newLetterTitle,
          body: newLetterBody,
          imageUrl: newLetterImageUrl,
        }),
      });
      if (response.ok) {
        const newLetter = await response.json();
        setLetters([newLetter, ...letters]);
        setShowAddLetterModal(false);
        setNewLetterTitle('');
        setNewLetterBody('');
        setNewLetterImageUrl('');
        setLetterUploadedFileName('');
        setToast({
          type: 'success',
          title: 'Letter Sent!',
          message: `Your letter to ${member.displayName} has been saved.`
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();

    const modResult = checkContentModeration(newMessage);

    if (!modResult.isAllowed) {
      setToast({
        type: 'warning',
        title: 'Moderation Guidance',
        message: modResult.guidanceMessage || 'Message did not pass our community safety check.'
      });
      return;
    }

    const payload = {
      memberId: member.slug,
      memberName: member.displayName,
      userName: userName.trim() || 'Kind Supporter',
      userAvatar: null,
      content: newMessage.trim(),
    };

    try {
      const res = await fetch('/api/appreciations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setAppreciations(prev => [{ ...saved, likedBy: currentUserId ? [currentUserId] : [] }, ...prev]);
      } else {
        throw new Error('Failed to save to cloud');
      }
    } catch {
      // Fallback local save
      const created: AppreciationMessage = {
        id: `msg-${Date.now()}`,
        memberId: member.slug as MemberSlug,
        memberName: member.displayName,
        userId: currentUserId || 'anonymous',
        userName: userName.trim() || 'Kind Supporter',
        userAvatar: null,
        content: newMessage.trim(),
        status: 'approved',
        likesCount: 1,
        likedBy: currentUserId ? [currentUserId] : [],
        createdAt: new Date().toISOString()
      };
      const all = getStoredAppreciations();
      const updated = [created, ...all];
      saveAppreciations(updated);
      setAppreciations(updated.filter((m) => m.memberId === member.slug));
    }

    setNewMessage('');
    setToast({
      type: 'success',
      title: 'Appreciation Shared Globally!',
      message: `Your heartfelt message for ${member.displayName} is now live and visible to everyone!`
    });
  };

  const handleToggleLike = async (msgId: string) => {
    if (!currentUserId) return;
    const hasLiked = appreciations.find(m => m.id === msgId)?.likedBy?.includes(currentUserId);
    const increment = hasLiked ? -1 : 1;

    setAppreciations(prev => prev.map(msg => {
      if (msg.id === msgId) {
        const updatedLikedBy = hasLiked
          ? (msg.likedBy || []).filter((id) => id !== currentUserId)
          : [...(msg.likedBy || []), currentUserId];
        return {
          ...msg,
          likesCount: msg.likesCount + increment,
          likedBy: updatedLikedBy
        };
      }
      return msg;
    }));

    // Send to cloud
    fetch('/api/appreciations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msgId, increment })
    }).catch(() => {});
  };

  // Add Photo to Gallery
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) {
      setToast({
        type: 'warning',
        title: 'Image Required',
        message: 'Please upload an image from your computer or provide an image URL.'
      });
      return;
    }

    if (newPhotoCaption.trim()) {
      const mod = checkContentModeration(newPhotoCaption);
      if (!mod.isAllowed) {
        setToast({
          type: 'warning',
          title: 'Moderation Guidance',
          message: mod.guidanceMessage || 'Caption did not pass our community guidelines.'
        });
        return;
      }
    }

    const payload = {
      memberSlug: member.slug,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || `${member.displayName} Photo Moment`,
      category: newPhotoCategory,
      credit: newPhotoCredit.trim() || 'Community Contributor',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setPhotos(prev => [saved, ...prev]);
      } else {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        if (res.status === 401) {
          throw new Error('Please sign in to add photos to the gallery.');
        }
        throw new Error(err.error || 'Cloud save failed');
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Upload Error',
        message: err instanceof Error ? err.message : 'Could not save photo. Please try again.'
      });
      return;
    }

    setShowAddPhotoModal(false);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoCredit('');
    setUploadMode('file');
    setUploadedFileName('');

    setToast({
      type: 'success',
      title: 'Photo Added Globally!',
      message: `The photo was successfully added to ${member.displayName}'s gallery and is visible to everyone.`
    });
  };

  // Derived Sorted Data
  const sortedAppreciations = [...appreciations].sort((a, b) => {
    if (appreciationSort === 'most_liked') return b.likesCount - a.likesCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (photoSort === 'most_liked') return (b.likesCount || 0) - (a.likesCount || 0);
    const dateA = a.date || a.createdAt || '';
    const dateB = b.date || b.createdAt || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const sortedLetters = [...letters].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return letterSort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return postSort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  // Lightbox handlers
  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handlePrevLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  const handleNextLightbox = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && filteredPhotos.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const handleCopyPhotoLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clientCheck = validateFileClient(file, 5 * 1024 * 1024);
    if (!clientCheck.valid) {
      setToast({
        type: 'warning',
        title: 'Invalid File',
        message: clientCheck.error || 'Please select a valid image.'
      });
      return;
    }

    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const result = await uploadFile(file, 'photo');
      setNewPhotoUrl(result.url);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Could not upload image. Please try again.'
      });
      setUploadedFileName('');
    } finally {
      setIsUploading(false);
    }
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

      {reportTarget && (
        <ReportModal
          contentType="appreciation"
          contentId={reportTarget.id}
          contentSnippet={reportTarget.snippet}
          onClose={() => setReportTarget(null)}
        />
      )}

      <main className="flex-1">
        {/* MEMBER HERO HEADER */}
        <section className="relative overflow-hidden border-b border-rose-100 bg-gradient-to-b from-rose-50/70 via-amber-50/40 to-[#FFFDF9] py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Link
              href="/members"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to All Members</span>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Member Image Card */}
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-white group">
                <Image src={member.image} alt={member.displayName} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className={`absolute inset-0 bg-gradient-to-t ${member.colorGradient} opacity-30`} />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 backdrop-blur-md text-xs shadow-md">
                  <span className="font-bold text-zinc-900 block">{member.name}</span>
                  <span className="text-zinc-500">{member.koreanName} • {member.birthDate}</span>
                </div>
              </div>

              {/* Member Bio & Overview */}
              <div className="md:col-span-2 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-100/80 px-3.5 py-1 text-xs font-bold text-rose-700">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{member.role}</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('photos')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-2xs transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>{photos.length} Photos in Gallery</span>
                  </button>
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-900 tracking-tight">
                  {member.displayName}
                </h1>

                <blockquote className="border-l-4 border-rose-500 pl-4 italic text-base sm:text-lg text-zinc-700 font-serif bg-white/70 p-4 rounded-r-2xl border border-rose-100 shadow-2xs">
                  &quot;{member.quote}&quot;
                </blockquote>

                <p className="text-sm text-zinc-600 leading-relaxed">{member.bio}</p>

                {/* Official Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Official Channels:</span>
                  {member.officialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-rose-300 hover:text-rose-600 shadow-2xs transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NAVIGATION TABS */}
        <section className="sticky top-16 z-30 border-b border-rose-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-2 sm:space-x-6 overflow-x-auto py-3 no-scrollbar">
              {[
                { id: 'wall', label: `Appreciation Wall (${appreciations.length})`, icon: Heart },
                { id: 'photos', label: `Photo Gallery (${photos.length})`, icon: Camera },
                { id: 'letters', label: `Letters (${letters.length})`, icon: Mail },
                { id: 'posts', label: `Explore (${posts.length})`, icon: FileText },
                { id: 'journey', label: 'Journey & Milestones', icon: Calendar },
                { id: 'achievements', label: 'Verified Achievements', icon: Award },
                { id: 'inspiration', label: 'Inspiration Stories', icon: BookOpen }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'wall' | 'photos' | 'letters' | 'posts' | 'journey' | 'achievements' | 'inspiration')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-zinc-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* TAB CONTENTS */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          {/* TAB 1: APPRECIATION WALL */}
          {activeTab === 'wall' && (
            <div className="space-y-10">
              {/* MESSAGE SUBMISSION FORM */}
              <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <Heart className="h-5 w-5 fill-rose-500" />
                  <span>Write Your Message of Appreciation for {member.displayName}</span>
                </div>

                <div className="rounded-2xl bg-rose-50/70 p-3 border border-rose-100 text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Pre-Flight Positivity Check:
                  </p>
                  <p>Remember our core principle: <strong>Support without attacking anyone else.</strong> Keep your message respectful, warm, and free of comparisons or rankings.</p>
                </div>

                <form onSubmit={handlePostAppreciation} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`What do you cherish about ${member.displayName}'s artistry, kindness, voice, or passion?`}
                    rows={3}
                    required
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                    >
                      <Send className="h-4 w-4" />
                      <span>Publish to Wall</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* MESSAGES LIST */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-rose-500" />
                    <span>Warm Messages From the Community ({appreciations.length})</span>
                  </h3>
                  <select 
                    value={appreciationSort} 
                    onChange={(e) => setAppreciationSort(e.target.value as 'newest' | 'most_liked')}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 focus:border-rose-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="most_liked">Most Liked</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedAppreciations.map((msg) => {
                    const hasLiked = currentUserId ? msg.likedBy.includes(currentUserId) : false;
                    return (
                      <div
                        key={msg.id}
                        className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                      >
                        <p className="text-xs text-zinc-800 leading-relaxed font-sans italic">
                          &quot;{msg.content}&quot;
                        </p>

                        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={msg.userName} image={msg.userAvatar} size={24} />
                            <span className="font-semibold text-zinc-800">{msg.userName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleLike(msg.id)}
                              className={`flex items-center gap-1 font-bold text-xs rounded-full px-2.5 py-1 transition-colors ${
                                hasLiked
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'text-zinc-500 hover:bg-rose-50 hover:text-rose-500'
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{msg.likesCount}</span>
                            </button>

                            <button
                              onClick={() => setReportTarget({ id: msg.id, snippet: msg.content })}
                              className="text-zinc-400 hover:text-rose-500 transition-colors p-1"
                              title="Report message"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO GALLERY */}
          {activeTab === 'photos' && (
            <div className="space-y-8">
              {/* Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-rose-500" />
                    <span>{member.displayName}&apos;s Visual Gallery</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Curated stage captures, studio portraits, concept shoots, and heartwarming fan moments.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPhotoModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-102 self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Photo to Gallery</span>
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {PHOTO_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat;
                    const count = cat === 'All' ? photos.length : photos.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all border ${
                          isActive
                            ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50/50'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <select 
                  value={photoSort} 
                  onChange={(e) => setPhotoSort(e.target.value as 'newest' | 'most_liked')}
                  className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 focus:border-rose-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="most_liked">Most Liked</option>
                </select>
              </div>

              {/* Photos Grid */}
              {sortedPhotos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/30 p-12 text-center space-y-3">
                  <ImageIcon className="h-10 w-10 text-rose-300 mx-auto" />
                   <h4 className="text-sm font-bold text-zinc-800">Be the first to share a photo of {member.displayName} in this category.</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Be the first to contribute a photo for {member.displayName}.
                  </p>
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Contribute a Photo</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedPhotos.map((photo, index) => (
                    <div
                      key={photo.id || index}
                      onClick={() => handleOpenLightbox(index)}
                      className="group relative flex flex-col rounded-3xl overflow-hidden border border-rose-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-4/5 w-full overflow-hidden bg-zinc-100">
                        <Image src={photo.url} alt={photo.caption || 'Photo'} fill className="object-cover transition-transform duration-700 group-hover:scale-108" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="rounded-full bg-rose-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold">
                              {photo.category || 'Visual'}
                            </span>
                            <span className="text-[10px] opacity-80 flex items-center gap-1">
                              <Eye className="h-3 w-3" /> View Full
                            </span>
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 leading-snug">
                            {photo.caption}
                          </p>
                        </div>
                      </div>

                      {/* Card Info Bottom */}
                      <div className="p-4 space-y-1.5 bg-white">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-600 border border-rose-100">
                            {photo.category || 'Stage'}
                          </span>
                          {photo.date && <span>{photo.date}</span>}
                        </div>
                        <p className="text-xs font-bold text-zinc-800 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          {photo.caption}
                        </p>
                        {photo.credit && (
                          <p className="text-[10px] text-zinc-400 truncate">
                            Credit: {photo.credit}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LETTERS */}
          {activeTab === 'letters' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-rose-500" />
                  <span>Letters to {member.displayName}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAddLetterModal(true)}
                    className="rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 hover:shadow-md transition-all active:scale-95"
                  >
                    Write a Letter
                  </button>
                  <select 
                    value={letterSort} 
                    onChange={(e) => setLetterSort(e.target.value as 'newest' | 'oldest')}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 focus:border-rose-500 focus:outline-hidden cursor-pointer"
                  >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

              {letters.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/30 p-12 text-center space-y-3">
                  <Mail className="h-10 w-10 text-rose-300 mx-auto" />
                   <h4 className="text-sm font-bold text-zinc-800">Be the first to write a heartfelt letter to {member.displayName}.</h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedLetters.map((letter) => (
                    <div key={letter.id} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm space-y-4">
                      <h4 className="text-lg font-bold text-zinc-900">{letter.title}</h4>
                      {letter.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-100">
                          <Image src={letter.imageUrl} alt={letter.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                        </div>
                      )}
                      {letter.body && (
                        <p className="text-sm text-zinc-700 whitespace-pre-line line-clamp-4">{letter.body}</p>
                      )}
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                        <UserAvatar name={letter.userName} image={letter.userAvatar} size={24} />
                        <span className="text-xs font-semibold text-zinc-800">{letter.userName}</span>
                        <span className="text-[10px] text-zinc-400 ml-auto">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPLORE (POSTS) */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-500" />
                  <span>Explore {member.displayName}</span>
                </h3>
                <select 
                  value={postSort} 
                  onChange={(e) => setPostSort(e.target.value as 'newest' | 'oldest')}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 focus:border-rose-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/30 p-12 text-center space-y-3">
                  <FileText className="h-10 w-10 text-rose-300 mx-auto" />
                   <h4 className="text-sm font-bold text-zinc-800">No posts tagged with {member.displayName} yet. Be the first to write one!</h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {sortedPosts.map((post) => (
                    <div key={post.id} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                          {post.type || post.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-zinc-900">{post.title}</h4>
                      <p className="text-sm text-zinc-700 whitespace-pre-line">{post.content}</p>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                        {post.user && (
                          <>
                            <UserAvatar name={post.user?.name || 'User'} image={post.user?.image} size={24} />
                            <span className="text-xs font-semibold text-zinc-800">{post.user.name || 'Community Member'}</span>
                          </>
                        )}
                        <span className="text-[10px] text-zinc-400 ml-auto">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: JOURNEY & MILESTONES */}
          {activeTab === 'journey' && (
            <div className="space-y-6 max-w-3xl">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-500" />
                <span>Career Journey & Key Milestones</span>
              </h3>

              <div className="relative border-l-2 border-rose-200 pl-6 space-y-8 ml-3">
                {member.journey.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-rose-500 bg-white group-hover:bg-rose-500 transition-colors" />
                    <span className="inline-block rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 mb-1">
                      {item.year}
                    </span>
                    <h4 className="text-base font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>Verified Public Achievements</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {member.achievements.map((ach) => (
                  <div key={ach.id} className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-6 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                        {ach.category}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{ach.eventDate}</span>
                    </div>

                    <h4 className="text-base font-bold text-zinc-900">{ach.title}</h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">{ach.description}</p>

                    {ach.verifiedSourceUrl && (
                      <a
                        href={ach.verifiedSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline pt-2"
                      >
                        <span>Verified Source Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INSPIRATION STORIES */}
          {activeTab === 'inspiration' && (
            <div className="space-y-6 max-w-3xl">
              <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-rose-500" />
                <span>Positive Impact & Community Stories</span>
              </h3>

              <div className="space-y-4">
                {member.inspirationStories.map((story, idx) => (
                  <div key={idx} className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                      <Sparkles className="h-4 w-4" />
                      <span>Community Reflection #{idx + 1}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic">
                      &quot;{story}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30 backdrop-blur-md transition-colors z-20"
            title="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={handlePrevLightbox}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 z-20"
            title="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNextLightbox}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 backdrop-blur-md transition-all hover:scale-110 z-20"
            title="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Main Lightbox Content */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] w-auto max-w-full overflow-hidden rounded-2xl shadow-2xl bg-black/40 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filteredPhotos[lightboxIndex].url}
                alt={filteredPhotos[lightboxIndex].caption}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full w-auto object-contain rounded-2xl"
              />
            </div>

            {/* Bottom Details Bar */}
            <div className="w-full max-w-2xl rounded-2xl bg-zinc-900/90 border border-white/10 p-4 text-white backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold">
                    {filteredPhotos[lightboxIndex].category || 'Visual'}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {lightboxIndex + 1} of {filteredPhotos.length}
                  </span>
                  {filteredPhotos[lightboxIndex].date && (
                    <span className="text-xs text-zinc-400">• {filteredPhotos[lightboxIndex].date}</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-zinc-100">
                  {filteredPhotos[lightboxIndex].caption}
                </p>
                {filteredPhotos[lightboxIndex].credit && (
                  <p className="text-[11px] text-zinc-400">
                    Credit: {filteredPhotos[lightboxIndex].credit}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleCopyPhotoLink(filteredPhotos[lightboxIndex].url)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/20 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                </button>

                <a
                  href={filteredPhotos[lightboxIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Full Size</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LETTER MODAL */}
      {showAddLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowAddLetterModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-zinc-900">Write a Letter</h3>
              <button 
                onClick={() => setShowAddLetterModal(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostLetter} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Letter Title</label>
                <input 
                  type="text"
                  placeholder="E.g., Thank you for everything"
                  value={newLetterTitle}
                  onChange={(e) => setNewLetterTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Upload Type</label>
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setLetterUploadMode('file'); setNewLetterImageUrl(''); setLetterUploadedFileName(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all ${
                      letterUploadMode === 'file' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLetterUploadMode('url'); setNewLetterImageUrl(''); setLetterUploadedFileName(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all ${
                      letterUploadMode === 'url' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {/* File Upload Mode */}
              {letterUploadMode === 'file' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Upload Letter Image (Optional)</label>
                  <div className="relative">
                    <label 
                      htmlFor="letter-file-upload"
                      className="flex cursor-pointer items-center justify-center w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-6 hover:bg-zinc-100 hover:border-rose-300 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-zinc-400" />
                        {letterUploadedFileName ? (
                          <span className="text-xs text-zinc-600 font-medium truncate max-w-[280px]">
                            {letterUploadedFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 font-medium">Click to upload an image of your letter</span>
                        )}
                      </div>
                    </label>
                    <input 
                      type="file"
                      id="letter-file-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLetterFileUpload}
                    />
                  </div>
                </div>
              )}

              {/* URL Mode */}
              {letterUploadMode === 'url' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-zinc-700">Image URL (Optional)</label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={newLetterImageUrl}
                    onChange={(e) => setNewLetterImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-zinc-700">Letter Content (Optional if image provided)</label>
                <textarea 
                  placeholder="Write your letter here..."
                  rows={5}
                  value={newLetterBody}
                  onChange={(e) => setNewLetterBody(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={!newLetterTitle.trim() && !newLetterImageUrl && !newLetterBody.trim()}
                  className="w-full rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-xs hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {showAddPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowAddPhotoModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-extrabold text-zinc-900">
                  Add Photo to {member.displayName}&apos;s Gallery
                </h3>
              </div>
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              {/* Upload Mode Toggle */}
              <div className="flex rounded-2xl bg-zinc-100 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setUploadMode('file'); setNewPhotoUrl(''); setUploadedFileName(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    uploadMode === 'file'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload from Computer</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadMode('url'); setNewPhotoUrl(''); setUploadedFileName(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    uploadMode === 'url'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Paste Image URL</span>
                </button>
              </div>

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">
                    Choose Image <span className="text-rose-500">*</span>
                  </label>
                  <label
                    htmlFor="photo-file-upload"
                    className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all ${
                      newPhotoUrl
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-zinc-300 bg-zinc-50/50 hover:border-rose-400 hover:bg-rose-50/30'
                    }`}
                  >
                    {newPhotoUrl ? (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <span className="text-sm font-bold text-green-700">Image Selected!</span>
                        <span className="text-xs text-zinc-500 truncate max-w-[280px]">{uploadedFileName}</span>
                        <span className="text-[11px] text-rose-500 font-semibold mt-1">Click to choose a different image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="rounded-2xl bg-rose-100 p-4">
                          <ImageIcon className="h-8 w-8 text-rose-500" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-zinc-700 block">Click to browse files</span>
                          <span className="text-[11px] text-zinc-400 mt-1 block">Supports JPG, PNG, WebP • Max 5MB</span>
                        </div>
                      </div>
                    )}
                    <input
                      id="photo-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* URL Mode */}
              {uploadMode === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Image URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://upload.wikimedia.org/..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              )}

              {/* Preview */}
              {newPhotoUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-rose-100 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newPhotoUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    Live Preview
                  </div>
                </div>
              )}

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  Caption / Moment Description
                </label>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder={`e.g., ${member.displayName} shining on stage in Seoul`}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Category & Credit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Category</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value as import('@/types').MemberPhoto['category'])}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Stage">Stage</option>
                    <option value="Concept">Concept</option>
                    <option value="Studio">Studio</option>
                    <option value="Casual">Casual</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                    <option value="Fan Art">Fan Art</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Photo Credit / Source</label>
                  <input
                    type="text"
                    value={newPhotoCredit}
                    onChange={(e) => setNewPhotoCredit(e.target.value)}
                    placeholder="e.g. Official, Weverse, Fan Photo"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Guidance Box */}
              <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 text-[11px] text-amber-800">
                Please only upload or link respectful, high-quality, and positive photos celebrating {member.displayName}. No unverified rumors, private invasion, or negative media.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="rounded-2xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPhotoUrl || isUploading}
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
