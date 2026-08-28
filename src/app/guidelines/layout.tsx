import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines | Seven Appreciation",
  description: "Rules and guidelines for maintaining a positive, supportive space.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
