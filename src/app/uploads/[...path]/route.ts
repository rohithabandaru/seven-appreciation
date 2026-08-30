import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const storageKey = pathSegments.join('/');

    // 1. Try local disk first (works in local dev)
    const localFilePath = path.join(process.cwd(), 'public', 'uploads', ...pathSegments);
    try {
      const fileBuffer = await fs.readFile(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Not on local disk, fall through to database
    }

    // 2. Fetch from Database (for Vercel Serverless production)
    const record = await prisma.uploadedFile.findUnique({
      where: { storageKey },
      select: { fileData: true, mimeType: true },
    });

    if (record && record.fileData) {
      const imageBuffer = Buffer.from(record.fileData, 'base64');
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': record.mimeType || 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
