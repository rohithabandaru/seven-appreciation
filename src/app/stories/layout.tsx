import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspiration Stories | Seven Appreciation",
  description: "Heartwarming stories of how the seven members have inspired fans.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
