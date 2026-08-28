import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storageDelete } from '@/lib/upload';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security-logger';

const DELETE_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 10 };

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as { role?: string }).role;
    const { id } = await params;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const rl = checkRateLimit(`delete-upload:${userId}`, DELETE_RATE_LIMIT);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterMs);
    }

    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    if (file.ownerId !== userId && userRole !== 'admin') {
      logSecurityEvent({
        event: 'upload_unauthorized_delete',
        ip,
        userId,
        detail: `User ${userId} attempted to delete file ${id} owned by ${file.ownerId}`,
        endpoint: '/api/uploads/[id]',
      });
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await prisma.uploadedFile.delete({ where: { id } });

    const deleted = await storageDelete(file.storageKey);
    if (!deleted) {
      logSecurityEvent({
        event: 'upload_storage_delete_failed',
        ip,
        userId,
        detail: `Storage file not found for key: ${file.storageKey}`,
        endpoint: '/api/uploads/[id]',
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
