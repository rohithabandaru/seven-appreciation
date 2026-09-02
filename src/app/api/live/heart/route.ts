import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { likeSchema } from '@/lib/validations';
import { checkRateLimit, RATE_LIMIT_POLICIES, rateLimitResponse } from '@/lib/rate-limit';
import {
  toggleMessageHeart,
  channelMessageCount,
  broadcastLiveEvent,
} from '@/lib/live-stream';
import { MEMBERS_DATA } from '@/lib/data/membersData';

const ALLOWED_CHANNELS = new Set(['all', ...MEMBERS_DATA.map((m) => m.slug)]);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = checkRateLimit('liveHeart:' + session.user.id, RATE_LIMIT_POLICIES.liveHeart);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

    const body = await request.json();
    const result = likeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id: messageId } = result.data;
    const userId = session.user.id;

    // The message could be in any channel (id is globally unique). Find it and toggle.
    for (const channel of ALLOWED_CHANNELS) {
      if (channelMessageCount(channel) === 0) continue;
      const updated = toggleMessageHeart(channel, messageId, userId);
      if (updated) {
        broadcastLiveEvent(channel, {
          type: 'heart',
          payload: { id: messageId, ...updated },
        });
        return NextResponse.json({ id: messageId, ...updated });
      }
    }

    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  } catch (error) {
    console.error('Error hearting live message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
