import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { photoSchema } from '@/lib/validations';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberSlug = searchParams.get('memberSlug');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const whereClause = memberSlug ? { memberSlug } : {};

    const [photos, total] = await Promise.all([
      prisma.memberPhoto.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.memberPhoto.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: photos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(req);
    const sizeError = await checkPayloadSize(req);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('photo:' + session.user.id, RATE_LIMIT_POLICIES.photo);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await req.json();
    const result = photoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { memberSlug, url, caption, category, credit } = result.data;

    if (!isAllowedImageUrl(url)) {
      logSecurityEvent({ event: 'upload_invalid_url', ip, userId: session.user.id, detail: url, endpoint: '/api/photos' });
      return NextResponse.json({ error: 'Invalid image URL.' }, { status: 400 });
    }

    if (url.startsWith('data:')) {
      logSecurityEvent({ event: 'upload_base64_rejected', ip, userId: session.user.id, detail: 'Base64 data URL rejected', endpoint: '/api/photos' });
      return NextResponse.json({ error: 'Base64 images are not allowed. Please upload through the file picker.' }, { status: 400 });
    }

    const modResult = checkContentModeration(caption || '');
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/photos' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const photo = await prisma.memberPhoto.create({
      data: {
        memberSlug,
        url,
        caption: caption || null,
        category: category || 'Stage',
        credit: credit || 'Community Contributor',
        date: (body.date as string) || new Date().toISOString().split('T')[0],
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error saving photo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}