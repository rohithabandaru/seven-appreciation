import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import RegisterPWA from "@/components/providers/RegisterPWA";
import VisitTracker from "@/components/providers/VisitTracker";
import FloatingCoffee from "@/components/ui/FloatingCoffee";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F43F5E",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://seven-appreciation.vercel.app"
  ),
  title: {
    default: "Seven Appreciation — Support Without Attacking Anyone Else",
    template: "%s • Seven Appreciation",
  },
  description:
    "A peaceful digital sanctuary to celebrate the journeys, artistry, and inspirational impact of Heeseung, Jay, Jake, Sunghoon, Sunoo, Jungwon, and Ni-ki with genuine appreciation. No competition, no fan wars, no rankings.",
  applicationName: "Seven Appreciation",
  authors: [{ name: "Seven Appreciation Community" }],
  creator: "Seven Appreciation Community",
  publisher: "Seven Appreciation Community",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Seven Appreciation — Support Without Attacking Anyone Else",
    description:
      "A peaceful digital sanctuary to celebrate the journeys, artistry, and inspirational impact of HEESEUNG, JAY, JAKE, SUNGHOON, SUNOO, JUNGWON, and NI-KI with genuine appreciation. Share appreciation notes, fan stories, artworks, and more.",
    url: "/",
    siteName: "Seven Appreciation",
    locale: "en_US",
    images: [
      {
        url: "/images/members/all_members.jpg",
        width: 1200,
        height: 630,
        alt: "Seven Appreciation — ENHYPEN Fan Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seven Appreciation — Support Without Attacking Anyone Else",
    description:
      "A peaceful digital sanctuary to celebrate ENHYPEN with genuine appreciation. No competition, no fan wars, no rankings.",
    images: ["/images/members/all_members.jpg"],
    creator: "@SevenAppreciation",
    site: "@SevenAppreciation",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SevenAppreciation",
  },
  category: "Fan Community",
  keywords: [
    "ENHYPEN",
    "ENGENE",
    "K-pop",
    "appreciation",
    "support without attacking",
    "fan community",
    "positive fandom",
    "Kpop appreciation",
    "fan art",
    "fan stories",
    "Heeseung",
    "Jay",
    "Jake",
    "Sunghoon",
    "Sunoo",
    "Jungwon",
    "Ni-ki",
    "ENHYPEN appreciation",
    "ENHYPEN fan site",
    "ENGENE community",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${outfit.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense */}
        <Script
          async
          strategy="beforeInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5401075281300328"
          crossOrigin="anonymous"
        />
      </head>

      <body className="min-h-full flex flex-col bg-[#FFFDF9] text-zinc-900 dark:bg-[#121014] dark:text-zinc-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('seven_prefs');var theme=t?JSON.parse(t).theme:null;if(theme==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-rose-600 focus:font-bold rounded-br-lg shadow-md"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <RegisterPWA />
          <VisitTracker />
          <FloatingCoffee />
          {children}
        </AuthProvider>

        <Analytics />
      </body>
    </html>
  );
}