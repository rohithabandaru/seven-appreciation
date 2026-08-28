import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Seven Members | Seven Appreciation",
  description: "Learn more about the inspiring journeys of the seven members.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
