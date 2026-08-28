'use client';

import React from 'react';
import Image from 'next/image';
import { getInitials, getAvatarColorClass, isRealUserImage } from '@/lib/avatar';

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}

export default function UserAvatar({ name, image, size = 40, className = '' }: UserAvatarProps) {
  const showImage = isRealUserImage(image);
  const initials = getInitials(name || 'User');
  const colorClass = getAvatarColorClass(name || 'User');

  if (showImage && image) {
    return (
      <div
        className={`relative overflow-hidden rounded-full border border-white/80 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold select-none ${colorClass} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
