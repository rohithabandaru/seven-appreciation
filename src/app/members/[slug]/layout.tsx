import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Profile | Seven Appreciation",
  description: "Dedicated profile and appreciation for the member.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
