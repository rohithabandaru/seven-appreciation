import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile | Seven Appreciation",
  description: "Your Seven Appreciation community profile.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
