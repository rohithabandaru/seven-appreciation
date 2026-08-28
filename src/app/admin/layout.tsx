import { getServerSession } from "next-auth/next";
import { authOptions, isDbAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mod Hub | Seven Appreciation",
  description: "Moderation hub for Seven Appreciation community.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin" || !(await isDbAdmin(session.user.id))) {
    redirect("/");
  }

  return <>{children}</>;
}
