import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Feed | Seven Appreciation",
  description: "Join the supportive community feed sharing love for the seven members.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
