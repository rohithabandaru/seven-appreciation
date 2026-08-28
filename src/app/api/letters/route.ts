import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma'
import { letterSchema } from '@/lib/validations'
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';

function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'images.unsplash.com') return true;
    if (parsed.hostname === 'upload.wikimedia.org') return true;
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const session = await getServerSession(authOptions)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Build visibility filter: unauthenticated users see only shared letters;
    // authenticated users see shared + their own private letters.
    const visibilityFilter = session?.user?.id
      ? {
          OR: [
            { visibility: 'shared' },
            { userId: session.user.id },
          ],
        }
      : { visibility: 'shared' }

    const whereClause = memberId
      ? { memberId, ...visibilityFilter }
      : visibilityFilter

    const [letters, total] = await Promise.all([
      prisma.letter.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.letter.count({ where: whereClause }),
    ])
    return NextResponse.json({
      data: letters,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching letters:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(request as unknown as Request);
    const sizeError = await checkPayloadSize(request as unknown as Request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('letter:' + session.user.id, RATE_LIMIT_POLICIES.letter);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await request.json()
    const result = letterSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 })
    }

    const { memberId, title, body: letterBody, imageUrl, visibility } = result.data

    if (imageUrl && !isAllowedImageUrl(imageUrl)) {
      logSecurityEvent({ event: 'upload_invalid_url', ip, userId: session.user.id, detail: imageUrl, endpoint: '/api/letters' });
      return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
    }

    if (imageUrl && imageUrl.startsWith('data:')) {
      logSecurityEvent({ event: 'upload_base64_rejected', ip, userId: session.user.id, detail: 'Base64 data URL rejected', endpoint: '/api/letters' });
      return NextResponse.json({ error: 'Base64 images are not allowed. Please upload through the file picker.' }, { status: 400 });
    }

    const modResult = checkContentModeration(letterBody);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/letters' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const letter = await prisma.letter.create({
      data: {
        memberId: memberId || null,
        memberName: memberId || null,
        userName: session.user.name || 'Kind Supporter',
        userId: session.user.id,
        userAvatar: session.user.image || null,
        title: title || 'A Letter',
        body: letterBody || '',
        imageUrl: imageUrl || null,
        visibility: visibility || 'shared',
        sealedUntil: null
      }
    })

    return NextResponse.json(letter, { status: 201 })
  } catch (error) {
    console.error('Error saving letter:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
