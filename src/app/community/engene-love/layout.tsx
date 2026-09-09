import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Random ENGENE Love 💌 | Seven Appreciation',
  description:
    'Sometimes the words you need come from another ENGENE. Read a random heartfelt appreciation message from the community.',
  openGraph: {
    title: 'Random ENGENE Love 💌',
    description:
      'Need a little ENGENE love today? Read a random heartfelt appreciation message from the community.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Random ENGENE Love 💌 | Seven Appreciation',
    description:
      'Sometimes the words you need come from another ENGENE.',
  },
};

export default function EngeneLoveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
