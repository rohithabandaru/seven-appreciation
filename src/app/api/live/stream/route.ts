import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { MEMBERS_DATA } from '@/lib/data/membersData';
import { getClientIp } from '@/lib/ip';
import {
  registerLiveClient,
  acquireConnectionSlot,
  releaseConnectionSlot,
} from '@/lib/live-stream';

export const dynamic = 'force-dynamic';

const ALLOWED_CHANNELS = new Set(['all', ...MEMBERS_DATA.map((m) => m.slug)]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || 'all';

  if (!ALLOWED_CHANNELS.has(channel)) {
    return new Response('Invalid channel', { status: 400 });
  }

  const ip = getClientIp(request);
  if (!acquireConnectionSlot(ip)) {
    return new Response('Too many connections', { status: 429 });
  }

  const session = await getServerSession(authOptions);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: 'ready', user: session?.user?.id ?? null });

      const cleanup = registerLiveClient(channel, controller, encoder);

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);

      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        cleanup();
        releaseConnectionSlot(ip);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      request.signal.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
