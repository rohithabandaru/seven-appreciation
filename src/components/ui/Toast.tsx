'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({ type, title, message, onClose, durationMs = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900'
  }[type];

  const Icon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    info: Info
  }[type];

  const iconColors = {
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-rose-600',
    info: 'text-sky-600'
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${bgStyles}`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColors}`} />
      <div className="flex-1 text-xs">
        <h5 className="font-bold text-sm mb-0.5">{title}</h5>
        <p className="opacity-90 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className="rounded-md p-1 hover:bg-black/5">
        <X className="h-4 w-4 opacity-60" />
      </button>
    </div>
  );
}
