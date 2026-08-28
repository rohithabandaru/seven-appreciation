import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { targetIdSchema } from "@/lib/validations";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const sizeError = await checkPayloadSize(req);
    if (sizeError) return sizeError;

    const rl = checkRateLimit('follow:' + session.user.id, RATE_LIMIT_POLICIES.follow);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = targetIdSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.flatten() }), { status: 400 });
    }

    const { targetUserId } = result.data;

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId,
          }
        }
      });
      return new NextResponse(JSON.stringify({ message: "Unfollowed successfully" }), { status: 200 });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        }
      });
      return new NextResponse(JSON.stringify({ message: "Followed successfully" }), { status: 201 });
    }

  } catch (error) {
    console.error("Failed to toggle follow:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
