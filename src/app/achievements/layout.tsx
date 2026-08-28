import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements & Milestones | Seven Appreciation",
  description: "Verified milestones and accomplishments of the seven members.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
