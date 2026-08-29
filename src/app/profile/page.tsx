'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { getStoredProfile, saveProfile, CURRENT_USER_PROFILE } from '@/lib/storage';
import { Profile } from '@/types';
import { uploadFile, validateFileClient } from '@/lib/upload/client';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { 
  Heart, 
  Edit, 
  Sparkles, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Trophy, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile>(CURRENT_USER_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(CURRENT_USER_PROFILE.displayName);
  const [bio, setBio] = useState(CURRENT_USER_PROFILE.bio);
  const [avatarUrl, setAvatarUrl] = useState(CURRENT_USER_PROFILE.avatarUrl);

  const [lastSession, setLastSession] = React.useState(session);

  if (lastSession !== session) {
    setLastSession(session);
    const stored = typeof window !== 'undefined' ? getStoredProfile() : CURRENT_USER_PROFILE;
    if (session?.user) {
      const activeName = session.user.name || stored.displayName || 'Kind Supporter';
      const activeImage = session.user.image || stored.avatarUrl || '';
      const activeBio = stored.bio || 'Spreading kindness and love for all seven members!';
      const activeRole = session.user.role || stored.role || 'fan';
      const activeUsername = session.user.email?.split('@')[0] || stored.username || 'supporter';

      setDisplayName(activeName);
      setAvatarUrl(activeImage);
      setBio(activeBio);
      setProfile({
        ...stored,
        displayName: activeName,
        avatarUrl: activeImage,
        bio: activeBio,
        username: activeUsername,
        role: activeRole
      });
    } else {
      setDisplayName(stored.displayName);
      setAvatarUrl(stored.avatarUrl);
      setBio(stored.bio);
      setProfile(stored);
    }
  }

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!session?.user) {
      setToast({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in with your account to change your profile picture.'
      });
      return;
    }

    const clientCheck = validateFileClient(file, 2 * 1024 * 1024);
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
      const result = await uploadFile(file, 'avatar');
      setAvatarUrl(result.url);
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

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const newName = displayName.trim() || 'Kind Supporter';
    const newBio = bio.trim();

    try {
      if (session?.user) {
        const res = await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, bio: newBio, image: avatarUrl })
        });
        if (!res.ok) throw new Error('Failed to update profile via API');
        await update({ name: newName, image: avatarUrl });
      }

      const updated = {
        ...profile,
        displayName: newName,
        bio: newBio,
        avatarUrl: avatarUrl
      };

      setProfile(updated);
      saveProfile(updated);
      setIsEditing(false);
      setShowAvatarModal(false);

      setToast({
        type: 'success',
        title: 'Profile Updated!',
        message: 'Your profile picture and details have been saved.'
      });
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Error Saving Profile',
        message: err instanceof Error ? err.message : 'An error occurred'
      });
    }
  };

  const handleApplyAvatar = async (url: string) => {
    try {
      if (session?.user) {
        const res = await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: url })
        });
        if (!res.ok) throw new Error('Failed to update avatar via API');
        await update({ image: url });
      }

      setAvatarUrl(url);
      const updated = {
        ...profile,
        avatarUrl: url
      };
      setProfile(updated);
      saveProfile(updated);
      setShowAvatarModal(false);

      setToast({
        type: 'success',
        title: 'Profile Picture Changed!',
        message: 'Your new avatar is now active across the community.'
      });
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Error Updating Avatar',
        message: err instanceof Error ? err.message : 'An error occurred'
      });
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

      {/* AVATAR SELECTION MODAL */}
      {showAvatarModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setShowAvatarModal(false)}
        >
          <div 
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-rose-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-rose-100 pb-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-black text-zinc-900">
                  Choose Profile Picture
                </h3>
              </div>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-2xl bg-zinc-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'upload'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Member Avatars</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  avatarTab === 'url'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* TAB 1: FILE UPLOAD FROM COMPUTER */}
            {avatarTab === 'upload' && (
              <div className="space-y-4">
                <label
                  htmlFor="avatar-file-upload"
                  className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all ${
                    uploadedFileName
                      ? 'border-green-400 bg-green-50/40'
                      : 'border-zinc-300 bg-zinc-50/50 hover:border-rose-400 hover:bg-rose-50/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-rose-200 bg-rose-50 flex items-center justify-center shadow-md">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt="Preview" width={64} height={64} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <Camera className="h-8 w-8 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-zinc-800 block">
                        {uploadedFileName ? uploadedFileName : 'Click to browse image from computer'}
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        <span className="font-bold text-rose-600">Click to upload</span> or drag and drop<br/>
                        Supports JPG, PNG, WebP • Max 2MB
                      </span>
                    </div>
                  </div>
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleApplyAvatar(avatarUrl)}
                    disabled={isUploading}
                    className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Save As Profile Picture'}
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: MEMBER PRESETS */}
            {avatarTab === 'presets' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500">Choose an official member avatar to represent your profile:</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* All 7 Members */}
                  {MEMBERS_DATA.map((member) => (
                    <button
                      key={member.slug}
                      type="button"
                      onClick={() => handleApplyAvatar(member.image)}
                      className={`group flex flex-col items-center p-3 rounded-2xl border transition-all hover:scale-105 ${
                        avatarUrl === member.image
                          ? 'border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-500/20'
                          : 'border-zinc-200 bg-white hover:border-rose-300'
                      }`}
                    >
                      <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2">
                        <Image src={member.image} alt={member.displayName} width={64} height={64} className="h-full w-full object-cover" unoptimized />
                      </div>
                      <span className="text-xs font-bold text-zinc-800">{member.displayName}</span>
                      <span className="text-[10px] text-rose-500 font-semibold">{member.role.split(',')[0]}</span>
                    </button>
                  ))}

                  {/* Group Avatar */}
                  <button
                    type="button"
                    onClick={() => handleApplyAvatar('/images/members/all_members.jpg')}
                    className={`group flex flex-col items-center p-3 rounded-2xl border transition-all hover:scale-105 ${
                      avatarUrl === '/images/members/all_members.jpg'
                        ? 'border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-500/20'
                        : 'border-zinc-200 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2">
                      <Image src="/images/members/all_members.jpg" alt="All Seven" width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800">All Seven</span>
                    <span className="text-[10px] text-rose-500 font-semibold">ENHYPEN</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: IMAGE URL */}
            {avatarTab === 'url' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Paste Image Web Link</label>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or direct image link"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {customUrlInput && (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <Image src={customUrlInput} alt="Preview" width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
                    <span className="text-xs text-zinc-600 font-semibold truncate flex-1">{customUrlInput}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!customUrlInput}
                  onClick={() => handleApplyAvatar(customUrlInput)}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  Apply Avatar Link
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl w-full space-y-8">
        
        {/* Main Profile Header Card */}
        <div className="rounded-3xl border border-rose-100 bg-white p-8 sm:p-10 shadow-lg shadow-rose-100/40 space-y-6 relative overflow-hidden">
          {/* Ambient header banner */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 opacity-20 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-4">
            
            {/* AVATAR WITH INTERACTIVE CAMERA BADGE */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden shadow-xl border-4 border-white bg-zinc-100 ring-4 ring-rose-100 transition-transform group-hover:scale-102">
                <UserAvatar name={profile.displayName} image={profile.avatarUrl} size={128} />
              </div>

              {/* Hover Camera Overlay Button */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                <Camera className="h-6 w-6" />
                <span>Change Photo</span>
              </div>

              {/* Verified Star Badge */}
              <div className="absolute bottom-1 right-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 p-1.5 text-white shadow-md border-2 border-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">{profile.displayName}</h1>
                <span className="text-xs text-zinc-400 font-mono">@{profile.username}</span>
                <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-0.5 text-[11px] font-bold text-purple-700">
                  {profile.role.toUpperCase()}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl">{profile.bio}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-zinc-500 pt-1">
                <span>Joined {profile.joinedDate}</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">16 Cards Collected</span>
                <span>•</span>
                <span>Safe Community Member</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
              >
                <Camera className="h-4 w-4 text-rose-500" />
                <span>Change Photo</span>
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <Edit className="h-4 w-4 text-zinc-400" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Bio'}</span>
              </button>
            </div>
          </div>

          {/* INLINE EDIT BIO & NAME FORM */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="border-t border-zinc-100 pt-6 space-y-4 text-xs animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Display Name:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 p-3 font-semibold focus:border-rose-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Avatar Action:</label>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="w-full rounded-2xl border border-dashed border-rose-300 bg-rose-50/50 p-3 font-bold text-rose-600 hover:bg-rose-100 flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Upload or Pick New Avatar</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Bio / Supporter Note:</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 p-3 leading-relaxed focus:border-rose-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-2xl border border-zinc-200 px-5 py-2.5 font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 font-bold text-white shadow-md hover:opacity-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PROFILE QUICK ACCESS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Card 1: Photocard Binder */}
          <Link
            href="/binder"
            className="group rounded-3xl border border-rose-100 bg-white p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Trophy className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900">Your Photocard Binder</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              View your 3D holographic photocard collection and open daily packs.
            </p>
          </Link>

          {/* Card 2: Appreciation Wall Messages */}
          <Link
            href="/appreciation"
            className="group rounded-3xl border border-rose-100 bg-white p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-sm">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900">Appreciation Wall</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Read and post heartfelt supportive messages for all seven members.
            </p>
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  );
}
