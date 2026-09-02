import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { liveMessageSchema } from '@/lib/validations';
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse, checkPayloadSize } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { logSecurityEvent } from '@/lib/security-logger';
import { checkContentModeration } from '@/lib/moderation';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import {
  getChannelMessages,
  addChannelMessage,
  broadcastLiveEvent,
} from '@/lib/live-stream';

const ALLOWED_CHANNELS = new Set(['all', ...MEMBERS_DATA.map((m) => m.slug)]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'all';

    if (!ALLOWED_CHANNELS.has(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const data = getChannelMessages(channel, session?.user?.id);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching live messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to send a message.' }, { status: 401 });
    }

    const ip = getClientIp(request);
    const sizeError = await checkPayloadSize(request);
    if (sizeError) return sizeError;
    const rl = checkRateLimit('liveMessage:' + session.user.id, RATE_LIMIT_POLICIES.liveMessage);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await request.json();
    const result = liveMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { channel, content } = result.data;

    if (!ALLOWED_CHANNELS.has(channel)) {
      logSecurityEvent({ event: 'unauthorized_access_attempt', ip, userId: session.user.id, detail: 'Invalid live channel: ' + channel, endpoint: '/api/live' });
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    const modResult = checkContentModeration(content);
    if (!modResult.isAllowed) {
      logSecurityEvent({ event: 'moderation_blocked', ip, userId: session.user.id, detail: modResult.flagReason, endpoint: '/api/live' });
      return NextResponse.json({ error: modResult.guidanceMessage }, { status: 422 });
    }

    const message = addChannelMessage(channel, {
      userId: session.user.id,
      userName: session.user.name || 'Kind Supporter',
      userAvatar: session.user.image || null,
      content: content.trim(),
    });

    broadcastLiveEvent(channel, { type: 'message', payload: message });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error saving live message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
