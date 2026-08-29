import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import RegisterPWA from "@/components/providers/RegisterPWA";
import FloatingCoffee from "@/components/ui/FloatingCoffee";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#F43F5E",
};

export const metadata: Metadata = {
  title: "Seven Appreciation — Support Without Attacking Anyone Else",
  description:
    "A peaceful digital sanctuary to celebrate the journeys, artistry, and inspirational impact of Heeseung, Jay, Jake, Sunghoon, Sunoo, Jungwon, and Ni-ki with genuine appreciation. No competition, no fan wars, no rankings.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SevenAppreciation",
  },
  keywords: [
    "appreciation",
    "support",
    "community",
    "positive",
    "Heeseung",
    "Jay",
    "Jake",
    "Sunghoon",
    "Sunoo",
    "Jungwon",
    "Ni-ki",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FFFDF9] text-zinc-900 dark:bg-[#121014] dark:text-zinc-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('seven_prefs');var theme=t?JSON.parse(t).theme:null;if(theme==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`
          }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-rose-600 focus:font-bold rounded-br-lg shadow-md">
          Skip to main content
        </a>
        <AuthProvider>
          <RegisterPWA />
          <FloatingCoffee />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
