import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  validateFileUpload,
  processImage,
  storagePut,
  getUploadCategoryFromPurpose,
} from '@/lib/upload';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security-logger';

const UPLOAD_RATE_LIMIT_POLICY = { windowMs: 60 * 60 * 1000, maxRequests: 20 };

const DEBUG_LOG = process.env.NODE_ENV !== 'production';
function debugLog(line: string) {
  if (!DEBUG_LOG) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('fs').appendFileSync('upload-debug.log', `${new Date().toISOString()} ${line}\n`);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    debugLog('session ok');

    const userId = session.user.id;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const rl = checkRateLimit(`upload:${userId}`, UPLOAD_RATE_LIMIT_POLICY);
    if (!rl.allowed) {
      debugLog('REJECT 429 rate-limited');
      return rateLimitResponse(rl.retryAfterMs);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const purpose = (formData.get('purpose') as string) || 'photo';
    debugLog(`formData parsed file=${file instanceof File ? `${file.name} type=${file.type} size=${file.size}` : 'MISSING'} purpose=${purpose}`);

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const category = getUploadCategoryFromPurpose(purpose);

    const buffer = Buffer.from(await file.arrayBuffer());

    const validation = validateFileUpload(file, buffer, category);
    debugLog(`validation=${validation.valid ? 'PASS' : `FAIL: ${validation.error}`}`);
    if (!validation.valid) {
      logSecurityEvent({
        event: 'upload_validation_failed',
        ip,
        userId,
        detail: validation.error,
        endpoint: '/api/uploads',
      });
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 400 }
      );
    }

    const userFileCount = await prisma.uploadedFile.count({
      where: { ownerId: userId },
    });
    if (userFileCount >= 50) {
      return NextResponse.json(
        { error: 'Upload limit reached. Maximum 50 files per user.' },
        { status: 429 }
      );
    }

    const userStorageTotal = await prisma.uploadedFile.aggregate({
      where: { ownerId: userId },
      _sum: { size: true },
    });
    const totalBytes = userStorageTotal._sum.size || 0;
    if (totalBytes + buffer.length > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Storage quota exceeded. Maximum 100MB per user.' },
        { status: 413 }
      );
    }

    let processed;
    try {
      processed = await processImage(buffer, category);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image processing failed';
      const statusCode = (err as { statusCode?: number }).statusCode || 500;
      logSecurityEvent({
        event: 'upload_processing_failed',
        ip,
        userId,
        detail: message,
        endpoint: '/api/uploads',
      });
      return NextResponse.json({ error: message }, { status: statusCode });
    }

    const ext = category === 'avatar' ? 'webp' : processed.format === 'png' ? 'png' : 'webp';

    let storageResult;
    try {
      storageResult = await storagePut(category, userId, ext, processed.buffer);
    } catch (err) {
      logSecurityEvent({
        event: 'upload_storage_failed',
        ip,
        userId,
        detail: err instanceof Error ? err.message : 'Storage write failed',
        endpoint: '/api/uploads',
      });
      return NextResponse.json(
        { error: 'Failed to store file. Please try again.' },
        { status: 500 }
      );
    }

    let dbRecord;
    try {
      dbRecord = await prisma.uploadedFile.create({
        data: {
          ownerId: userId,
          storageKey: storageResult.storageKey,
          url: storageResult.publicUrl,
          fileData: processed.buffer.toString('base64'),
          originalName: file.name.slice(0, 255),
          mimeType: `image/${processed.format}`,
          size: processed.size,
          width: processed.width,
          height: processed.height,
          purpose,
        },
      });
    } catch (err) {
      await storageDeleteSafe(storageResult.storageKey);
      logSecurityEvent({
        event: 'upload_db_failed',
        ip,
        userId,
        detail: err instanceof Error ? err.message : 'Database insert failed',
        endpoint: '/api/uploads',
      });
      return NextResponse.json(
        { error: 'Failed to save file record. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: dbRecord.id,
      url: dbRecord.url,
      storageKey: dbRecord.storageKey,
      mimeType: dbRecord.mimeType,
      size: dbRecord.size,
      width: dbRecord.width,
      height: dbRecord.height,
    }, { status: 201 });

  } catch (error) {
    debugLog(`CRASH ${error instanceof Error ? error.stack : String(error)}`);
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function storageDeleteSafe(storageKey: string) {
  try {
    const { storageDelete } = await import('@/lib/upload');
    await storageDelete(storageKey);
  } catch {
    // best effort cleanup
  }
}
