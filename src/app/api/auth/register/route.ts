import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize, readJsonBodySizeLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { logSecurityEvent } from "@/lib/security-logger";
import { STARTER_CARD_IDS } from "@/lib/photocards";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const sizeError = await checkPayloadSize(req);
  if (sizeError) return sizeError;

  const rl = await checkRateLimit('register:' + ip, RATE_LIMIT_POLICIES.register);
  if (!rl.allowed) {
    logSecurityEvent({ event: 'registration_blocked', ip, endpoint: '/api/auth/register' });
    return rateLimitResponse(rl.retryAfterMs);
  }

  try {
    const bodyResult = await readJsonBodySizeLimited<Record<string, unknown>>(req);
    if (!bodyResult.ok) return bodyResult.error;
    const body = bodyResult.data as Record<string, unknown>;
    
    // Zod validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const issueMsg = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: issueMsg, details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;
    const lowerEmail = email.toLowerCase();

    logSecurityEvent({ event: 'registration_attempt', ip, email: lowerEmail, endpoint: '/api/auth/register' });

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowerEmail }
    });

    if (existingUser) {
      // Safe error, does not expose system state unnecessarily
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (role hardcoded to 'user')
    const newUser = await prisma.user.create({
      data: {
        email: lowerEmail,
        name,
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true
      }
    });

    // Seed 3 starter photocards
    await prisma.unlockedPhotocard.createMany({
      data: STARTER_CARD_IDS.map((cardId) => ({
        userId: newUser.id,
        cardId,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Registration successful", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
