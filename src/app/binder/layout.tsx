import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Photocards Binder | Seven Appreciation",
  description: "Collect and view your virtual photocards of the seven members.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
