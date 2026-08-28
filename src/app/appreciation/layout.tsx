import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appreciation Wall | Seven Appreciation",
  description: "A wall of heartfelt appreciation notes dedicated to the seven members.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
