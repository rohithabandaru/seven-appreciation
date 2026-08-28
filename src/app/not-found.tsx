import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Heart, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <Heart className="h-10 w-10 text-rose-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-zinc-900 tracking-tight mb-3">404</h1>
        <h2 className="text-xl font-bold text-zinc-700 mb-4">Page Not Found</h2>
        <p className="text-zinc-500 max-w-md mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to the community.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
