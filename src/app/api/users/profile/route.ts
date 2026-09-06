import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";
import { readJsonBodySizeLimited } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

async function requireUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      role: true,
      bio: true,
      createdAt: true,
    },
  });
  if (!user) return { error: { error: "User not found" }, status: 404 as const, user: null };
  return { user, error: null, status: 200 as const };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await requireUser(session.user.id);
    if (!result.user) return NextResponse.json(result.error, { status: result.status });

    const [unlockedCount, followingCount] = await Promise.all([
      prisma.unlockedPhotocard.count({ where: { userId: session.user.id } }),
      prisma.follow.count({ where: { followerId: session.user.id } }),
    ]);

    return NextResponse.json({
      user: result.user,
      stats: { unlockedCount, followingCount },
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(req);
    if (!bodyResult.ok) return bodyResult.error;

    const result = updateProfileSchema.safeParse(bodyResult.data);
    if (!result.success) {
      const issueMsg = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: issueMsg, details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, image, bio } = result.data;

    const dataToUpdate: Prisma.UserUpdateInput = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (image !== undefined) dataToUpdate.image = image;
    if (bio !== undefined) dataToUpdate.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: { id: true, name: true, image: true, email: true, role: true, bio: true },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}