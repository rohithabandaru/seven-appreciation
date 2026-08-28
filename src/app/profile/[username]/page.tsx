import React from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  await getServerSession(authOptions);
  
  // Wait, if no database, this will crash. For now, we will handle a graceful fallback.
  let userProfile = null;
  
  try {
    userProfile = await prisma.user.findFirst({
      where: { name: params.username },
      include: {
        posts: { where: { status: "approved" } },
        _count: {
          select: { followers: true, following: true },
        },
      },
    });
  } catch {
    console.warn("Database not connected yet.");
  }

  return (
    <div className="min-h-screen flex flex-col  font-sans">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl w-full space-y-10">
        {!userProfile ? (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold">User profile not found (or DB offline).</h2>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6 border-b border-rose-100 pb-8">
              <div className="h-24 w-24 rounded-full bg-zinc-200 overflow-hidden">
                {userProfile.image && <Image src={userProfile.image} alt={userProfile.name || "User"} width={96} height={96} className="object-cover" unoptimized />}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold">{userProfile.name}</h1>
                <div className="flex gap-4 mt-2 text-sm text-zinc-600 font-semibold">
                  <span>{userProfile._count.followers} Followers</span>
                  <span>{userProfile._count.following} Following</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Approved Posts</h2>
              <div className="grid gap-4">
                {userProfile.posts.map(post => (
                  <div key={post.id} className="p-4 border border-rose-100 rounded-xl bg-white shadow-sm">
                    <h3 className="font-bold text-rose-600">{post.title}</h3>
                    <p className="text-sm text-zinc-700 mt-2">{post.content}</p>
                  </div>
                ))}
                {userProfile.posts.length === 0 && (
                  <p className="text-sm text-zinc-500">No posts yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
